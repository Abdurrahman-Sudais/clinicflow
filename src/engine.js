// ClinicFlow rules: a missed-appointment model fitted to synthetic history (logistic regression), waitlist
// suggestions for high-risk slots, an extractive draft summary that staff must approve, task and follow-up
// queues, role-based access to notes, and a weekday demand forecast. Clinical decisions stay with clinicians.
import {history as HISTORY, weeklyBookings} from './data.js';

export const can = (roles, roleId, perm) => !!roles.find((r) => r.id === roleId)?.can.includes(perm);
export const FEATURES = ['Base rate', 'Per day booked ahead', 'Per previous missed visit', 'Reminder confirmed', 'New patient', 'Per km travelled'];
export const features = (a) => [1, a.lead, a.prior, a.confirmed ?? a.reminder === 'confirmed' ? 1 : 0, a.isNew ? 1 : 0, a.km];
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

/** Logistic regression by gradient descent on standardised features. */
export function fitLogistic(rows, iters = 600, lr = 0.3) {
  const X = rows.map((r) => features({...r, reminder: r.confirmed ? 'confirmed' : 'none'}));
  const k = X[0].length;
  const mu = Array.from({length: k}, (_, j) => (j === 0 ? 0 : X.reduce((s, x) => s + x[j], 0) / X.length));
  const sd = Array.from({length: k}, (_, j) => (j === 0 ? 1 : Math.sqrt(X.reduce((s, x) => s + (x[j] - mu[j]) ** 2, 0) / X.length) || 1));
  const Z = X.map((x) => x.map((v, j) => (j === 0 ? 1 : (v - mu[j]) / sd[j])));
  const w = Array(k).fill(0);
  for (let it = 0; it < iters; it += 1) {
    const g = Array(k).fill(0);
    Z.forEach((z, i) => { const e = sigmoid(z.reduce((s, v, j) => s + v * w[j], 0)) - (rows[i].noShow ? 1 : 0); z.forEach((v, j) => { g[j] += e * v; }); });
    for (let j = 0; j < k; j += 1) w[j] -= (lr * g[j]) / Z.length;
  }
  // Convert back to raw-feature coefficients for display.
  const raw = w.map((v, j) => (j === 0 ? v - w.slice(1).reduce((s, wj, jj) => s + (wj * mu[jj + 1]) / sd[jj + 1], 0) : v / sd[j]));
  return raw;
}
export const COEF = fitLogistic(HISTORY.slice(0, 500));
export const risk = (a) => sigmoid(features(a).reduce((s, v, j) => s + v * COEF[j], 0));
const holdout = HISTORY.slice(500).map((r) => ({p: risk({...r, reminder: r.confirmed ? 'confirmed' : 'none'}), y: r.noShow}));
/** Share of held-out appointments where a 30% threshold classifies correctly, and the base no-show rate. */
export const ACCURACY = holdout.filter((h) => (h.p >= 0.3) === h.y).length / holdout.length;
export const BASE_RATE = HISTORY.filter((r) => r.noShow).length / HISTORY.length;

/** Biggest contributors to one appointment's risk, in plain words. */
export function reasons(a) {
  const out = [];
  if (a.lead >= 14) out.push(`Booked ${a.lead} days ahead`);
  if (a.prior > 0) out.push(`${a.prior} missed visit${a.prior > 1 ? 's' : ''} last year`);
  if (a.reminder !== 'confirmed') out.push(a.reminder === 'sent' ? 'Reminder sent, not confirmed' : 'No reminder yet');
  if (a.isNew) out.push('New patient');
  if (a.km >= 15) out.push(`${a.km} km away`);
  return out;
}

export const level = (p) => (p >= 0.4 ? 'high' : p >= 0.2 ? 'medium' : 'low');

/** Waitlist suggestions for high-risk slots: same clinician, patient close by. */
export function suggestions(appts, waitlist, taken = {}) {
  const used = new Set(Object.keys(taken));
  return appts.filter((a) => a.status === 'booked' && risk(a) >= 0.4 && !Object.values(taken).includes(a.id)).sort((x, y) => risk(y) - risk(x)).flatMap((a) => {
    const w = waitlist.find((x) => x.wants === a.clinician && !used.has(x.id));
    if (!w) return [];
    used.add(w.id);
    return [{id: `${a.id}-${w.id}`, appt: a.id, wait: w.id, text: `Offer ${w.patient} (waitlist, ${w.km} km) a standby place in ${a.clinician}’s ${a.type.toLowerCase()} slot — ${a.patient} has a ${Math.round(risk(a) * 100)}% estimated chance of not attending.`}];
  });
}

const KEY_TERMS = /(continue|repeat|requested|return|next review|advised|reduce|improvement|blood pressure|follow)/i;
/** Extractive draft: keeps the sentences that carry plan, results and follow-up. Always a draft for staff review. */
export function draftSummary(text) {
  const sentences = text.split(/(?<=\.)\s+/);
  const keep = sentences.filter((s) => KEY_TERMS.test(s));
  return {sentences: keep, words: keep.join(' ').split(/\s+/).length, original: text.split(/\s+/).length};
}

export function forecastWeek(weeks = weeklyBookings) {
  return weeks[0].map((_, d) => { const vals = weeks.map((w) => w[d]); const avg = vals.reduce((a, b) => a + b, 0) / vals.length; const trend = (vals.at(-1) - vals[0]) / (vals.length - 1); return Math.round(avg + trend * 2.5); });
}

export function initial(appts, tasks, roles) {
  return {appts: structuredClone(appts), tasks: structuredClone(tasks), summaries: {}, offers: {}, followups: [], log: [], role: roles[0].id};
}
const now = () => new Date().toISOString();

export function act(state, a, {roles, actor}) {
  const fail = (error) => ({state, ok: false, error});
  if (a.type === 'role') return {state: {...state, role: a.role}, ok: true};
  const allow = (p) => can(roles, state.role, p);
  const log = (id, summary, patch) => ({ok: true, state: {...state, ...patch, log: [{at: now(), actor, role: state.role, id, summary}, ...state.log]}});
  const setAppt = (id, patch) => state.appts.map((x) => (x.id === id ? {...x, ...patch} : x));
  switch (a.type) {
    case 'remind': {
      if (!allow('schedule')) return fail('Only front desk, nurses and managers manage appointments.');
      return log(a.id, 'Reminder sent', {appts: setAppt(a.id, {reminder: a.confirmed ? 'confirmed' : 'sent'})});
    }
    case 'status': {
      if (!allow('schedule')) return fail('Only front desk, nurses and managers manage appointments.');
      if (!['arrived', 'missed', 'booked'].includes(a.status)) return fail('Unknown status.');
      const patch = {appts: setAppt(a.id, {status: a.status})};
      if (a.status === 'arrived') patch.followups = [...state.followups, {id: `F-${a.id}`, appt: a.id, due: 14, done: false}];
      return log(a.id, a.status === 'arrived' ? 'Checked in; follow-up created' : a.status === 'missed' ? 'Marked as missed' : 'Reset to booked', patch);
    }
    case 'offer': {
      if (!allow('schedule')) return fail('Only front desk, nurses and managers manage the waitlist.');
      return log(a.appt, `Standby offered to ${a.wait}`, {offers: {...state.offers, [a.wait]: a.appt}});
    }
    case 'task': {
      if (!allow('tasks')) return fail('Clinicians manage tasks through the nursing team.');
      const t = state.tasks.find((x) => x.id === a.id); if (!t) return fail('Task not found.');
      return log(a.id, a.done ? `Completed: ${t.title}` : `Assigned to ${actor}: ${t.title}`, {tasks: state.tasks.map((x) => (x.id === a.id ? {...x, owner: actor, done: !!a.done} : x))});
    }
    case 'summary': {
      if (!allow('approve')) return fail('Only clinicians and nurses approve documentation summaries.');
      const text = (a.text || '').trim();
      if (text.length < 20) return fail('The approved summary is too short — edit the draft before approving.');
      return log(a.id, 'Documentation summary reviewed and approved', {summaries: {...state.summaries, [a.id]: {text, by: actor, at: now()}}});
    }
    default: return fail('Unknown action.');
  }
}
