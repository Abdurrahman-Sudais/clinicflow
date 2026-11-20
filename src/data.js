// Synthetic records for the front-desk prototype: one specialist clinic's day. No real patients — names are
// invented initials, and every note, task and history row is generated for demonstration.

export const CLINIC = {name: 'Lekki Specialist Clinic', date: 'Tuesday 24 November'};
export const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// [id, patient initials, clinician, time (minutes), type, lead time days, prior no-shows (last year), reminder, new patient, distance km]
const A = (id, patient, clinician, time, type, lead, prior, reminder, isNew, km) => ({id, patient, clinician, time, type, lead, prior, reminder, isNew, km, status: 'booked'});
export const appointments = [
  A('AP01', 'A. O.', 'Dr Bello', 480, 'Cardiology review', 6, 0, 'confirmed', false, 4),
  A('AP02', 'K. E.', 'Dr Bello', 510, 'New referral', 21, 1, 'none', true, 18),
  A('AP03', 'T. A.', 'Dr Okafor', 480, 'Dermatology', 3, 0, 'confirmed', false, 6),
  A('AP04', 'M. I.', 'Dr Okafor', 510, 'Follow-up', 28, 2, 'sent', false, 22),
  A('AP05', 'F. B.', 'Dr Bello', 540, 'ECG', 2, 0, 'confirmed', false, 3),
  A('AP06', 'C. N.', 'Dr Okafor', 540, 'New referral', 35, 0, 'none', true, 25),
  A('AP07', 'S. Y.', 'Dr Ade', 570, 'Physiotherapy', 7, 1, 'sent', false, 9),
  A('AP08', 'O. D.', 'Dr Ade', 600, 'Physiotherapy', 5, 0, 'confirmed', false, 5),
  A('AP09', 'B. K.', 'Dr Bello', 600, 'Cardiology review', 14, 3, 'none', false, 15),
  A('AP10', 'E. U.', 'Dr Okafor', 630, 'Follow-up', 10, 0, 'sent', false, 12),
  A('AP11', 'I. M.', 'Dr Ade', 660, 'Physiotherapy', 4, 0, 'confirmed', false, 2),
  A('AP12', 'G. T.', 'Dr Bello', 690, 'New referral', 42, 1, 'none', true, 30),
  A('AP13', 'L. O.', 'Dr Okafor', 720, 'Dermatology', 9, 0, 'confirmed', false, 7),
  A('AP14', 'R. A.', 'Dr Ade', 750, 'Physiotherapy', 18, 2, 'sent', false, 20),
  A('AP15', 'H. S.', 'Dr Bello', 780, 'ECG', 1, 0, 'confirmed', false, 4),
  A('AP16', 'P. J.', 'Dr Okafor', 810, 'Follow-up', 24, 1, 'none', false, 16),
];

/** Patients on the waitlist who could take a slot at short notice. */
export const waitlist = [
  {id: 'W1', patient: 'N. A.', wants: 'Dr Bello', type: 'Cardiology review', km: 3},
  {id: 'W2', patient: 'D. O.', wants: 'Dr Okafor', type: 'Dermatology', km: 5},
  {id: 'W3', patient: 'U. E.', wants: 'Dr Ade', type: 'Physiotherapy', km: 4},
];

/** Synthetic visit notes (clinical text is for demonstration only and must not be read as medical guidance). */
export const notes = [
  {id: 'N1', appt: 'AP01', author: 'Dr Bello', text: 'Patient attended for routine cardiology review. Reports feeling well with no chest pain since last visit. Blood pressure 128/82. Continue current medication. Repeat lipid profile requested. Next review in three months. Patient asked about exercise; advised to continue walking 30 minutes daily.'},
  {id: 'N2', appt: 'AP03', author: 'Dr Okafor', text: 'Dermatology follow-up for eczema on both forearms. Improvement noted after two weeks of prescribed cream. Mild dryness remains. Continue cream twice daily for two more weeks, then reduce. Patient to return in four weeks. Discussed avoiding fragranced soaps.'},
];

export const tasks = [
  {id: 'T1', title: 'Type referral letter for K. E. to cardiac imaging', type: 'Referral', due: 0, priority: 'high', owner: null},
  {id: 'T2', title: 'File lab results for A. O. (lipid profile from last visit)', type: 'Results', due: 0, priority: 'medium', owner: null},
  {id: 'T3', title: 'Insurance pre-authorisation for M. I. physiotherapy course', type: 'Insurance', due: 1, priority: 'high', owner: null},
  {id: 'T4', title: 'Scan and attach consent form for C. N.', type: 'Documents', due: 0, priority: 'low', owner: null},
  {id: 'T5', title: 'Call G. T. to confirm referral paperwork', type: 'Calls', due: 0, priority: 'medium', owner: null},
];

/** Synthetic history used to fit the missed-appointment model. */
export const history = (() => {
  let s = 17;
  const rnd = () => ((s = (s * 48271) % 2147483647) / 2147483647);
  const out = [];
  for (let i = 0; i < 600; i += 1) {
    const r = {lead: Math.floor(rnd() * 45), prior: Math.floor(rnd() * rnd() * 4), confirmed: rnd() < 0.55, isNew: rnd() < 0.25, km: Math.floor(rnd() * 32)};
    const z = -3.1 + 0.045 * r.lead + 0.65 * r.prior - 1.3 * (r.confirmed ? 1 : 0) + 0.45 * (r.isNew ? 1 : 0) + 0.03 * r.km;
    r.noShow = rnd() < 1 / (1 + Math.exp(-z));
    out.push(r);
  }
  return out;
})();

/** Appointments booked per weekday over recent weeks (for the demand forecast). */
export const weeklyBookings = [[96, 104, 98, 110, 88, 34], [101, 108, 103, 112, 90, 36], [99, 112, 106, 118, 95, 38], [104, 115, 110, 121, 97, 41]];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const roles = [
  {id: 'desk', label: 'Front Desk', can: ['schedule', 'tasks']},
  {id: 'nurse', label: 'Nurse', can: ['schedule', 'tasks', 'notes', 'approve']},
  {id: 'clinician', label: 'Clinician', can: ['notes', 'approve']},
  {id: 'manager', label: 'Clinic Manager', can: ['schedule', 'tasks', 'export']},
];
export const people = {desk: 'Joy Okonkwo', nurse: 'Nurse Halima', clinician: 'Dr Bello', manager: 'Mrs Adeyemi'};
