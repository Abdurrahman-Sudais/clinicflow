import React, {useState} from 'react';
import site from './content.js';
import {Count, Cycle, Marquee, Stats, Words} from './Flow.jsx';
import {appointments, hhmm, notes, waitlist} from './data.js';
import {ACCURACY, BASE_RATE, draftSummary, level, risk, suggestions} from './engine.js';
import {ACROSS, SERVICES, STAGES, WHY} from './aws.js';
import {PROGRESS} from './forms.js';
import FrontDesk from './FrontDesk.jsx';
import PilotForm from './PilotForm.jsx';
import ContactForm from './ContactForm.jsx';

export function Logo({size = 30}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="14" fill="#6c5ce7" />
      <path d="M12 21c3 0 4-6 7-6s3 10 6 10 3-4 5-4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const HIGH = appointments.filter((a) => level(risk(a)) === 'high');
const SUG = suggestions(appointments, waitlist);
const DRAFT = draftSummary(notes[0].text);

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Your day', '/#day'], ['Features', '/#features'], ['Documentation', '/#docs'], ['Privacy', '/#privacy'], ['Pricing', '/#pricing'], ['Contact', '/#contact']];
  return (
    <header className="hd">
      <a href="/" className="brand" aria-label="ClinicFlow home"><Logo /><span>ClinicFlow</span></a>
      <nav id="nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
        {links.map(([t, h]) => <a key={t} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="nav-app" href="/app" onClick={() => setOpen(false)}>Open the front desk</a>
      </nav>
      <a className="hd-cta" href="#demo" data-magnetic>Request a demo</a>
      <button className="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    </header>
  );
}

const CYCLE = ["private hospitals", "specialist clinics", "diagnostic centres"];
const MQ = ["Private hospitals", "Specialist clinics", "Diagnostic centres", "Appointment scheduling", "No-show risk", "Waitlist offers", "Reminders", "Documentation drafts", "Follow-up tasks", "Role-based access", "Practice managers", "Front-desk teams"];
const STATS = [[16, "appointments on the sample day"], [600, "past visits behind the no-show model"], [3, "waitlist patients matched to open slots"], [4, "roles with separate access"]];

function Hero() {
  const cards = [appointments[1], appointments[4], appointments[11], appointments[7]];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="blob" aria-hidden="true" /><div className="blob b2" aria-hidden="true" />
      <p className="badge" data-r>For private hospitals, specialist clinics and diagnostic centres</p>
      <h1 id="hero-title"><Words>Less administration.<br /><em>More time for care.</em></Words></h1>
      <p className="lede" data-r>{site.about}</p>
        <p className="fcy" data-r style={{'--d': '200ms'}}><Cycle lead="Built for" items={CYCLE} /></p>
      <div className="ctas" data-r><a className="btn" href="#demo" data-magnetic data-cursor="Book">Request a demo</a><a className="btn soft" href="/app" data-cursor="Try">Open the front desk</a></div>
      <div className="floaters" aria-hidden="true">{cards.map((a, i) => { const p = risk(a); return (
        <div key={a.id} className={`float f${i} ${level(p)}`}><span className="time">{hhmm(a.time)}</span><b>{a.type}</b><small>{a.clinician} · {a.patient}</small><span className="risk">{level(p) === 'high' ? `${Math.round(p * 100)}% may not attend` : a.reminder === 'confirmed' ? 'Confirmed' : 'Reminder sent'}</span></div>); })}</div>
    </section>
  );
}

function Day() {
  return (
    <section className="sec" id="day" aria-labelledby="day-title">
      <div className="split">
        <div>
          <p className="kicker">The core differentiator</p>
          <h2 id="day-title">Predictive appointments, with the admin done for you.</h2>
          <p className="intro">ClinicFlow estimates which appointments are likely to be missed — from how far ahead they were booked, past attendance, reminder replies, new-patient status and travel distance — then sends reminders, offers standby places to the waitlist and keeps the admin moving.</p>
          <ul className="sugs">{SUG.map((s) => <li key={s.id} data-r><span className="spark" aria-hidden="true">✦</span>{s.text}</li>)}</ul>
          <p className="fine">Synthetic day. Estimated on synthetic history: base missed-appointment rate {Math.round(BASE_RATE * 100)}%, about {Math.round(ACCURACY * 100)}% of held-out appointments classified correctly at a 30% threshold.</p>
        </div>
        <div className="dayline" data-r>
          <p className="day-h"><b>Tuesday</b><span>{appointments.length} appointments · {HIGH.length} at risk</span></p>
          <ol>{[...appointments].sort((x, y) => x.time - y.time).slice(0, 10).map((a) => { const p = risk(a); return <li key={a.id} className={level(p)}><span className="t">{hhmm(a.time)}</span><span className="nm"><b>{a.type}</b><small>{a.clinician} · {a.patient}</small></span><span className="meter" style={{'--p': p}}><i /></span><span className="pct">{Math.round(p * 100)}%</span></li>; })}</ol>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  ['Appointment scheduling and reminders', 'Book, move and remind by SMS or email; replies update the schedule automatically.'],
  ['AI-assisted documentation summaries', 'Draft summaries of visit notes and letters — always reviewed and approved by staff before use.'],
  ['Administrative task management', 'Referral letters, results filing and insurance forms in one queue, with owners and due dates.'],
  ['Appointment no-show predictions', 'An estimated chance of a missed appointment for every booking, with the reasons shown.'],
  ['Patient follow-up workflows', 'Follow-ups created at check-in and tracked until done.'],
  ['Facility performance dashboards', 'Attendance, utilisation, waiting times and task backlog per clinic and clinician.'],
  ['Role-based access and audit history', 'Each role sees only what it needs; every view and change is recorded.'],
];

function Features() {
  return (
    <section className="sec soft-bg" id="features" aria-labelledby="ft-title">
      <div className="split top">
        <div className="stick"><p className="kicker">Core product features</p><h2 id="ft-title">Seven tools, one calm workspace.</h2><p className="intro">Built for the people who keep a clinic running: front-desk teams, nurses, clinicians and managers.</p><a className="btn" href="/app" data-magnetic>Try the front desk</a></div>
        <div className="acc">{FEATURES.map(([t, d], i) => <details key={t} open={i === 0} data-r><summary><span className="n">{i + 1}</span>{t}</summary><div><p>{d}</p></div></details>)}</div>
      </div>
    </section>
  );
}

function Docs() {
  const kept = new Set(DRAFT.sentences);
  return (
    <section className="sec" id="docs" aria-labelledby="doc-title">
      <p className="kicker">Documentation summaries</p>
      <h2 id="doc-title">A draft in seconds. A professional decides.</h2>
      <div className="docs">
        <article className="note" data-r data-tilt><p className="mono">Visit note · synthetic</p><p className="note-t">{notes[0].text.split(/(?<=\.)\s+/).map((s, i) => <span key={i} className={kept.has(s) ? 'hl' : ''}>{s} </span>)}</p></article>
        <article className="draft" data-r data-tilt><p className="mono"><span className="pill">Draft · needs review</span> {DRAFT.words} words from {DRAFT.original}</p><ul>{DRAFT.sentences.map((s) => <li key={s}>{s}</li>)}</ul><div className="draft-act"><span className="btn soft sm" aria-hidden="true">Edit</span><span className="btn sm" aria-hidden="true">Approve</span></div></article>
      </div>
      <p className="fine">The draft keeps the sentences that carry plan, results and follow-up. Nothing is saved to a record until a clinician or nurse approves it.</p>
    </section>
  );
}

function Privacy() {
  const roles = [['Front desk', 'Schedules, reminders, tasks', 'No clinical notes'], ['Nurse', 'Schedules, tasks, notes, approvals', ''], ['Clinician', 'Notes and summary approval', ''], ['Clinic manager', 'Dashboards, schedules, exports', 'No clinical notes']];
  return (
    <section className="sec" id="privacy" aria-labelledby="pv-title">
      <div className="pv" data-r>
        <div><p className="kicker">Role-based access and audit history</p><h2 id="pv-title">Care data stays with the people who need it.</h2><p className="intro">Every role sees only what its work needs, every view and change is recorded, and records are encrypted at rest. Demonstrations use synthetic data only.</p></div>
        <table className="roles"><thead><tr><th scope="col">Role</th><th scope="col">Can use</th><th scope="col">Restricted</th></tr></thead><tbody>{roles.map(([r, c, x]) => <tr key={r}><th scope="row">{r}</th><td>{c}</td><td>{x || '—'}</td></tr>)}</tbody></table>
      </div>
    </section>
  );
}

function Who() {
  return (
    <section className="sec" aria-labelledby="who-title">
      <p className="kicker">Target customers</p>
      <h2 id="who-title">Made for facilities that run on appointments.</h2>
      <div className="who">{[['Private hospitals', 'Many departments, many clinicians, one view of the day.', '🏥'], ['Specialist clinics', 'Long waits and costly gaps when patients don’t attend.', '🩺'], ['Diagnostic centres', 'Tight slots, preparation instructions and results to file.', '🔬']].map(([t, d, e]) => <article key={t} data-r data-spot><span className="emo" aria-hidden="true">{e}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      <p className="decision">Decision-makers: hospital administrators · clinic owners · healthcare operations managers</p>
    </section>
  );
}

const MODULES = [['Scheduling and reminders', 2], ['No-show predictions', 1], ['Task management', 1], ['Documentation summaries', 2], ['Follow-ups', 1], ['Dashboards', 1]];

function Pricing() {
  const [staff, setStaff] = useState(15);
  const [mods, setMods] = useState({'Scheduling and reminders': true, 'No-show predictions': true});
  const perSeat = MODULES.filter(([m]) => mods[m]).reduce((s, [, p]) => s + p, 0) * 4;
  return (
    <section className="sec soft-bg" id="pricing" aria-labelledby="pr-title">
      <div className="split">
        <div><p className="kicker">Business model</p><h2 id="pr-title">Priced by facility size, staff accounts and modules.</h2><p className="intro">Choose the modules you need and the number of staff accounts. Illustrative pricing for a proposed product.</p></div>
        <div className="calc" data-r>
          <fieldset><legend>Modules</legend>{MODULES.map(([m]) => <label key={m} className="mod"><input type="checkbox" checked={!!mods[m]} onChange={(e) => setMods({...mods, [m]: e.target.checked})} /> <span>{m}</span></label>)}</fieldset>
          <label className="staff">Staff accounts <input type="number" min="1" max="500" value={staff} onChange={(e) => setStaff(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} /></label>
          <p className="total"><b>${(perSeat * staff).toLocaleString()}</b><span>per month · ${perSeat} per account</span></p>
          <a className="btn" href="#demo" data-magnetic>Request a demo</a>
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="sec" id="technology" aria-labelledby="tech-title">
      <p className="kicker">Planned AWS infrastructure</p>
      <h2 id="tech-title">How we use Amazon Web Services.</h2>
      <p className="intro">{WHY}</p>
      <ol className="stages">{STAGES.map(([t, svcs, d], i) => <li key={t} data-r style={{'--d': `${i * 80}ms`}}><span className="n">{i + 1}</span><h3>{t}</h3><p className="svcs">{svcs.map((s) => <span key={s}>{s}</span>)}</p><p>{d}</p></li>)}</ol>
      <div className="across" data-r><p className="kicker">Across every stage</p><ul>{ACROSS.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ul></div>
      <h3 className="sub">Services and their role in ClinicFlow</h3>
      <dl className="svc">{SERVICES.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
      <p className="fine">Planned, not yet deployed. This website and the front desk run in your browser on synthetic data.</p>
    </section>
  );
}

function Team() {
  return (
    <section className="sec" id="team" aria-labelledby="team-title">
      <div className="team-head"><p className="kicker">Founding team</p><h2 id="team-title">The people building {site.name}.</h2></div><div className="team-list">{site.team.map((p, i) => (<div key={p.name} style={{'--d': `${i * 90}ms`}} className="team" data-r><span className="av" aria-hidden="true">{p.initials}</span><div><p className="kicker">{p.role}</p><h3 className="tname">{p.name}</h3><p>{p.bio}</p><ul className="tags">{p.focus.map((f) => <li key={f}>{f}</li>)}</ul></div></div>))}</div>
    </section>
  );
}

function Demo() {
  return (
    <section className="sec" id="demo" aria-labelledby="demo-title">
      <div className="split top">
        <div>
          <p className="kicker">Progress & early demos</p>
          <h2 id="demo-title">See ClinicFlow with your own clinic’s day.</h2>
          <p className="intro">ClinicFlow is a proposed product in its building stage, looking for qualified healthcare organisations for early demonstrations. Pilots begin with appointment management on synthetic records.</p>
          <ol className="progress">{PROGRESS.map(([st, t, d]) => <li key={t} className={st === 'Next' ? 'next' : ''}><span>{st}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol>
        </div>
        <div className="card-form" data-r><PilotForm submitLabel="Request a demo" /></div>
      </div>
    </section>
  );
}

const FAQ = [['Does ClinicFlow make clinical decisions?', 'No. It supports administration. Healthcare professionals retain responsibility for clinical decisions and review every AI-assisted summary before use.'], ['How is patient data protected?', 'Role-based access, encryption at rest with facility-specific keys and an audit record of access. Demonstrations use synthetic data only.'], ['How are no-shows predicted?', 'From booking lead time, past attendance, reminder replies, new-patient status and travel distance — with the reasons shown for every appointment.'], ['Is ClinicFlow live?', 'Not yet. It is a proposed product; the front desk is a prototype running in your browser on synthetic records.']];

function Faq() {
  return (
    <section className="sec" aria-labelledby="faq-title">
      <p className="kicker">FAQ</p><h2 id="faq-title">Questions facilities ask.</h2>
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
  );
}

function Contact() {
  return (
    <section className="sec" id="contact" aria-labelledby="contact-title">
      <div className="split top">
        <div><p className="kicker">Contact</p><h2 id="contact-title">Talk to ClinicFlow.</h2><p className="intro">Questions about the product, integrations, privacy and access, or partnerships. Messages go directly to the founder.</p><p className="mail"><a href={`mailto:${site.email}`}>{site.email}</a></p></div>
        <div className="card-form" data-r><ContactForm /></div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ft">
      <div className="ft-row"><a href="/" className="brand" aria-label="ClinicFlow home"><Logo /><span>ClinicFlow</span></a><nav aria-label="Footer"><a href="/app">Front desk</a><a href="/#technology">Technology (AWS)</a><a href="/#pricing">Pricing</a><a href="/#contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></div>
      <p className="fine">© 2026 ClinicFlow · {site.email} · Founded by {site.team[0].name}. A proposed product: features, integrations and AWS services are planned, pricing is illustrative and the front desk uses synthetic records. ClinicFlow does not provide medical advice.</p>
    </footer>
  );
}

function Home() { return (<><Hero /><Marquee items={MQ} label="Who and what it is built for" /><Stats items={STATS} /><Day /><Features /><Docs /><Privacy /><Who /><Pricing /><Technology /><Team /><Demo /><Faq /><Contact /></>); }

const LEGAL = {
  privacy: ['Privacy notice', [['This website', 'ClinicFlow is a proposed product. This website and the front desk run in your browser on synthetic data; no patient data is collected.'], ['Front desk', 'Your changes are kept in your browser’s local storage (key clinicflow-desk-v1) and never leave your device.'], ['Forms', `Until a form service is connected, the demo and contact forms open a pre-filled email to ${site.email}; nothing is sent until you send it. Please do not include patient information.`], ['Cookies & analytics', 'None.']]],
  terms: ['Terms of use', [['A proposed product', 'Nothing here is an offer of service. Pricing is illustrative.'], ['Demonstration only', 'The front desk uses synthetic records and must not be used with real patient data or for clinical decisions.'], ['Professionals decide', 'ClinicFlow supports administration; healthcare professionals are responsible for clinical decisions.']]],
};
function Legal({kind}) { const [title, items] = LEGAL[kind]; return <section className="sec legal"><p className="kicker">Review draft</p><h1>{title}</h1>{items.map(([t, d]) => <div key={t}><h2>{t}</h2><p>{d}</p></div>)}</section>; }
function NotFound() { return <section className="sec legal"><p className="kicker">404</p><h1>This page missed its appointment.</h1><p>We couldn’t find it.</p><p><a className="btn" href="/">Back to ClinicFlow</a></p></section>; }

export default function App({path = '/'}) {
  if (path.startsWith('/app')) return <FrontDesk />;
  const page = path === '/' ? <Home /> : path === '/privacy' ? <Legal kind="privacy" /> : path === '/terms' ? <Legal kind="terms" /> : <NotFound />;
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main">{page}</main><Footer /></>);
}
