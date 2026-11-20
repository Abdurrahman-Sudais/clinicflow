# ClinicFlow

**Less administration. More time for care.**

ClinicFlow is a proposed healthcare operations platform for private hospitals, specialist clinics and diagnostic centres. It would organise appointments, administrative documentation, patient follow-ups and operational resources, combining predictive appointment management with administrative workflow automation. Healthcare professionals retain responsibility for clinical decisions and review every AI-generated summary before use. ClinicFlow does not provide medical advice.

> ClinicFlow is a proposed product. Features, integrations and AWS services are planned until implemented and verified. Pricing is illustrative, and the prototype uses fictional data. Founder: **Amara Eze**. Website: `clinicflow.top` · contact: `amara@clinicflow.top`.

## Design

The look is calm and human: soft lavender light, generous rounding, Gloock for headlines and Plus Jakarta Sans for everything else.

- **Hero:** centred over slowly morphing colour blobs, with appointment cards floating gently below and their missed-appointment risk shown.
- **Predictive appointments:** a day view with risk meters that fill on scroll, plus waitlist suggestions.
- **Features:** a sticky "seven tools" panel beside an accordion of all seven core features.
- **Documentation summaries:** the original synthetic note with the kept sentences highlighted, beside a draft that needs review.
- **Access and audit:** a dark panel with the role-based access table.
- **Who it's for:** target customers and decision-makers.
- **Pricing:** a calculator by modules and staff accounts.
- **Technology:** the planned AWS architecture (Bedrock, Textract, SageMaker AI, S3, DynamoDB, Cognito, plus KMS and CloudTrail), with each service's role.
- **Closing sections:** founder, progress and the early-demo form, FAQ and a contact form with a topic picker.
- **Interactions:** a soft halo cursor that blends with the page, magnetic buttons, a gradient scroll-progress bar and view-transition tabs in the prototype.

## Prototype (`/app`)

The front desk runs one synthetic clinic day. There are no real patients.

- **Missed-appointment risk:** a logistic regression fitted in the browser to 500 synthetic past appointments. Its inputs are lead time, prior misses, reminder confirmation, new patient and distance. It is checked on 100 held-out appointments, and the reasons are shown for every booking.
- **Today:** send or confirm reminders, check patients in (which creates a follow-up) or mark them missed.
- **Waitlist:** suggestions offer one standby patient per high-risk slot.
- **Tasks:** referral letters, results filing and insurance forms, which staff take and complete.
- **Summaries:** extractive drafts of visit notes that a nurse or clinician edits and approves. The front desk and manager cannot see clinical notes.
- **Dashboard:** next week's bookings forecast.
- **Roles:** Front Desk, Nurse, Clinician and Clinic Manager.

Every decision in the prototype is made by a person and written to a log. Changes persist in the browser's `localStorage`, and motion is skipped for visitors who prefer reduced motion. All pages are server-rendered and readable without JavaScript.

## Structure

```
src/content.js      site facts and founder
src/data.js         fictional data and roles
src/engine.js       the prototype's rules (pure functions, tested)
src/aws.js          the planned AWS architecture shown on the home page
src/forms.js        demo-request and contact form rules and HubSpot payloads (tested)
src/fx.js           interaction layer: reveals, cursor, magnetic and tilt effects, progress bar
src/App.jsx         marketing pages · src/FrontDesk.jsx the prototype
docs/architecture.md  planned AWS architecture and design rules
docs/crm-plan.md      HubSpot forms, properties and pipeline
```

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # Vite build, server render, static prerender of /, /app, /privacy, /terms and 404.html
npm test        # node --test
```

The output in `dist/` is fully static. Configs are included for Netlify/Cloudflare (`public/_headers`, `public/_redirects`) and Vercel (`vercel.json`).

Until HubSpot is configured, the forms keep requests in the browser and open a pre-filled email. To connect it, set `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_GUID` and `VITE_HUBSPOT_CONTACT_FORM_GUID` (see `.env.example`), and update the privacy notice first.
