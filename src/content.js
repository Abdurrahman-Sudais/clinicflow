// ClinicFlow — site facts used by the pages, the prerender step and the tests.
// A proposed product: features, integrations and AWS services are planned until implemented and verified.
const site = {
  name: 'ClinicFlow',
  slug: 'clinicflow',
  tagline: 'Less administration. More time for care.',
  about: 'ClinicFlow is a proposed healthcare operations platform that helps healthcare facilities organise appointments, administrative documentation, patient follow-ups and operational resources. Healthcare professionals stay responsible for clinical decisions and review every AI-assisted summary before it is used.',
  url: 'https://clinicflow.top',
  email: 'amara@clinicflow.top',
  team: [
    {name: 'Amara Eze', role: 'Founder', initials: 'AE', bio: 'Amara founded ClinicFlow after seeing clinic teams spend their mornings chasing confirmations, typing referral letters and filling gaps left by missed appointments. Amara leads product, partnerships with facilities and every pilot.', focus: ['Product', 'Healthcare operations', 'Facility pilots']},
    {name: "Ngozi Okonkwo", role: "Co-founder", initials: "NO", bio: "Ngozi leads clinic partnerships and customer success at ClinicFlow: onboarding pilot clinics, shaping front-desk and care-team workflows and turning staff feedback into product changes.", focus: ["Clinic operations", "Pilot onboarding", "Front-desk workflow"]},
    {name: "Ibrahim Danjuma", role: "CTO", initials: "ID", bio: "Ibrahim leads engineering: scheduling, the no-show risk model, documentation drafting, role-based access to clinical notes and the AWS platform it runs on.", focus: ["Platform architecture", "Privacy and access control", "AWS infrastructure"]},
  ],
  app: {
    title: 'Front desk',
    subtitle: 'Run a synthetic clinic day: missed-appointment risk, reminders, waitlist suggestions, admin tasks, follow-ups and staff-reviewed documentation summaries.',
  },
};
export default site;
