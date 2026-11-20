import React, {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import site from './content.js';
import {CLINIC, WEEKDAYS, appointments, hhmm, notes, people, roles, tasks, waitlist} from './data.js';
import {act, can, draftSummary, forecastWeek, initial, level, reasons, risk, suggestions} from './engine.js';
import {vt} from './fx.js';
import {Logo} from './App.jsx';

const KEY = 'clinicflow-desk-v1';

export default function FrontDesk() {
  const [state, setState] = useState(() => initial(appointments, tasks, roles));
  const [tab, setTab] = useState('day');
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState({});
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.appts) setState(s); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const actor = people[state.role];
  const allow = (p) => can(roles, state.role, p);
  const run = (a) => { const r = act(state, a, {roles, actor}); setMsg(r.ok ? '' : r.error); if (r.ok) setState(r.state); };
  const go = (t) => vt(() => flushSync(() => { setTab(t); setMsg(''); }));
  const appts = [...state.appts].sort((a, b) => a.time - b.time);
  const sug = suggestions(state.appts, waitlist, state.offers);
  const att = state.appts.filter((a) => a.status === 'arrived').length; const missed = state.appts.filter((a) => a.status === 'missed').length;
  const expected = state.appts.reduce((s, a) => s + risk(a), 0);
  const week = forecastWeek();

  return (
    <div className="fd">
      <header className="fd-top">
        <a href="/" className="brand" aria-label="Back to the ClinicFlow website"><Logo size={26} /><span>ClinicFlow</span></a>
        <span className="mono">{CLINIC.name} · {CLINIC.date}</span>
        <label className="fd-role">Signed in as <select value={state.role} onChange={(e) => run({type: 'role', role: e.target.value})}>{roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        <button className="btn soft sm" onClick={() => { setState(initial(appointments, tasks, roles)); setMsg(''); }}>Reset</button>
      </header>
      <p className="fd-banner">Synthetic records only. ClinicFlow supports administration — clinical decisions stay with healthcare professionals.</p>
      <main className="fd-main">
        <div className="fd-head"><h1>{site.app.title}</h1><dl className="kp"><div><dt>Booked</dt><dd>{state.appts.length}</dd></div><div><dt>Expected to miss</dt><dd>{expected.toFixed(1)}</dd></div><div><dt>Arrived</dt><dd>{att}</dd></div><div><dt>Missed</dt><dd>{missed}</dd></div></dl></div>
        <div className="fd-tabs" role="tablist">{[['day', 'Today'], ['tasks', `Tasks (${state.tasks.filter((t) => !t.done).length})`], ['docs', 'Summaries'], ['follow', `Follow-ups (${state.followups.length})`], ['dash', 'Dashboard']].map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => go(id)}>{l}</button>)}</div>
        {msg && <p className="fd-err" role="alert">{msg}</p>}
        <div className="fd-grid">
          <section className="fd-card" key={tab}>
            {tab === 'day' && (<ul className="appts">{appts.map((a) => { const p = risk(a); return (
              <li key={a.id} className={`${level(p)} ${a.status}`}>
                <span className="t">{hhmm(a.time)}</span>
                <span className="nm"><b>{a.type}</b><small>{a.clinician} · {a.patient}{a.isNew ? ' · new' : ''}</small>{level(p) !== 'low' && a.status === 'booked' && <small className="why">{reasons(a).join(' · ')}</small>}</span>
                <span className="rk"><i style={{'--p': p}} />{Math.round(p * 100)}%</span>
                <span className="acts">{a.status === 'booked' ? (<>
                  {a.reminder !== 'confirmed' && <button className="btn soft sm" disabled={!allow('schedule')} onClick={() => run({type: 'remind', id: a.id})}>{a.reminder === 'sent' ? 'Resend' : 'Remind'}</button>}
                  {a.reminder === 'sent' && <button className="btn soft sm" disabled={!allow('schedule')} onClick={() => run({type: 'remind', id: a.id, confirmed: true})}>Confirmed</button>}
                  <button className="btn sm" disabled={!allow('schedule')} onClick={() => run({type: 'status', id: a.id, status: 'arrived'})}>Check in</button>
                  <button className="btn soft sm" disabled={!allow('schedule')} onClick={() => run({type: 'status', id: a.id, status: 'missed'})}>Missed</button></>) : <span className={`st ${a.status}`}>{a.status === 'arrived' ? 'Checked in' : 'Missed'}</span>}</span>
              </li>); })}</ul>)}

            {tab === 'tasks' && (<ul className="tasks">{state.tasks.map((t) => <li key={t.id} className={`${t.priority}${t.done ? ' done' : ''}`}><span className="pr">{t.priority}</span><span><b>{t.title}</b><small>{t.type} · due {t.due === 0 ? 'today' : 'tomorrow'}{t.owner ? ` · ${t.owner}` : ''}</small></span>{!t.done && (t.owner ? <button className="btn sm" disabled={!allow('tasks')} onClick={() => run({type: 'task', id: t.id, done: true})}>Done</button> : <button className="btn soft sm" disabled={!allow('tasks')} onClick={() => run({type: 'task', id: t.id})}>Take it</button>)}</li>)}</ul>)}

            {tab === 'docs' && (allow('notes') ? notes.map((n) => { const d = draftSummary(n.text); const s = state.summaries[n.id]; const val = edit[n.id] ?? d.sentences.join(' '); return (
              <article key={n.id} className="doc"><p className="mono">{n.author} · {state.appts.find((a) => a.id === n.appt)?.patient} · synthetic note</p><p className="orig">{n.text}</p>
                {s ? <p className="ok">Approved by {s.by}: “{s.text}”</p> : (<><p className="mono"><span className="pill">Draft · needs review</span></p><textarea rows="4" aria-label="Draft summary" value={val} onChange={(e) => setEdit({...edit, [n.id]: e.target.value})} disabled={!allow('approve')} /><button className="btn sm" disabled={!allow('approve')} onClick={() => run({type: 'summary', id: n.id, text: val})}>Approve summary</button></>)}
              </article>); }) : <p className="restricted">Clinical notes are restricted for the {roles.find((r) => r.id === state.role).label} role. Switch to Nurse or Clinician.</p>)}

            {tab === 'follow' && (state.followups.length ? <ul className="tasks">{state.followups.map((f) => { const a = state.appts.find((x) => x.id === f.appt); return <li key={f.id}><span className="pr">day {f.due}</span><span><b>Follow-up call · {a.patient}</b><small>{a.type} with {a.clinician} · created at check-in</small></span></li>; })}</ul> : <p className="empty">Check a patient in to create their follow-up.</p>)}

            {tab === 'dash' && (<div><h2>Next week’s bookings</h2><div className="wk">{week.map((v, i) => <div key={i}><i style={{height: `${(v / Math.max(...week)) * 100}%`}} /><b>{v}</b><small>{WEEKDAYS[i]}</small></div>)}</div><p className="fine">Forecast from recent weeks’ bookings with trend (synthetic).</p></div>)}
          </section>

          <aside className="fd-side">
            <div className="fd-card"><h2>Waitlist suggestions</h2>{sug.length ? <ul className="sg">{sug.map((s) => <li key={s.id}><p>{s.text}</p><button className="btn sm" disabled={!allow('schedule')} onClick={() => run({type: 'offer', appt: s.appt, wait: s.wait})}>Offer standby</button></li>)}</ul> : <p className="empty">No high-risk slots without an offer.</p>}</div>
            <div className="fd-card"><h2>Audit history</h2><ul className="log">{state.log.slice(0, 8).map((l, i) => <li key={i}><time>{new Date(l.at).toLocaleTimeString()}</time> <b>{l.actor}</b> · {l.id} · {l.summary}</li>)}{!state.log.length && <li className="fine">Every change is recorded here.</li>}</ul></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
