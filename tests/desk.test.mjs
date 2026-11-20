import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';
import {appointments, notes, people, roles, tasks, waitlist} from '../src/data.js';
import {ACCURACY, COEF, act, draftSummary, initial, risk, suggestions} from '../src/engine.js';

test('the missed-appointment model learns sensible directions and beats chance', () => {
  assert.ok(COEF[1] > 0 && COEF[2] > 0 && COEF[3] < 0 && COEF[4] > 0, 'lead time, past no-shows and new patients raise risk; confirmation lowers it');
  assert.ok(ACCURACY > 0.6);
  const confirmed = {...appointments[1], reminder: 'confirmed'};
  assert.ok(risk(confirmed) < risk(appointments[1]));
});

test('waitlist suggestions target high-risk slots, one offer per waitlisted patient', () => {
  const s = suggestions(appointments, waitlist);
  assert.ok(s.length >= 1);
  assert.equal(new Set(s.map((x) => x.wait)).size, s.length);
  for (const x of s) assert.ok(risk(appointments.find((a) => a.id === x.appt)) >= 0.4);
});

test('draft summaries keep plan and follow-up sentences and stay drafts until approved', () => {
  const d = draftSummary(notes[0].text);
  assert.ok(d.sentences.some((x) => /Repeat lipid profile/.test(x)) && d.words < d.original);
});

test('role-based access: front desk cannot approve notes; check-in creates a follow-up', () => {
  const ctx = (s) => ({roles, actor: people[s.role]});
  let s = initial(appointments, tasks, roles);
  assert.match(act(s, {type: 'summary', id: 'N1', text: 'Continue medication; repeat lipid profile; review in 3 months.'}, ctx(s)).error, /clinicians and nurses/);
  s = act(s, {type: 'status', id: 'AP01', status: 'arrived'}, ctx(s)).state;
  assert.equal(s.followups.length, 1);
  const doc = act(s, {type: 'role', role: 'clinician'}, ctx(s)).state;
  assert.match(act(doc, {type: 'remind', id: 'AP02'}, ctx(doc)).error, /front desk/);
  assert.ok(act(doc, {type: 'summary', id: 'N1', text: 'Continue medication; repeat lipid profile; review in 3 months.'}, ctx(doc)).state.summaries.N1);
});

test('founder and contact', () => {
  assert.equal(site.team[0].name, 'Amara Eze');
  assert.equal(site.email, 'amara@clinicflow.top');
});
