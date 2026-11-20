# Architecture

Status: **proposed**. The website and the prototype run entirely in the browser on fictional data. None of the AWS services below are deployed or connected.

## Today: browser-only prototype

- Vite + React, server-rendered to static HTML for every route (`scripts/prerender.mjs`).
- Synthetic appointments, notes, tasks and history live in `src/data.js`; the no-show model, summaries, tasks, follow-ups and access rules are pure functions in `src/engine.js`, tested with `node --test`.
- Changes persist in `localStorage`; roles are switched in the UI, not authenticated.

## Why AWS

ClinicFlow is a proposed AI-powered healthcare operations platform for private hospitals, specialist clinics and diagnostic centres. It handles appointments, administrative documents and follow-ups, where access control, encryption and an audit trail are not optional. Designing on AWS lets authentication, encrypted storage, extraction, summarisation and forecasting run as managed services, isolated per facility.

## Proposed production service

| Stage | Services | What happens |
|---|---|---|
| 1. Sign-in & access | Amazon Cognito | Staff sign in with role-based groups; front desk, nurses, clinicians and managers see only what their role needs. |
| 2. Documents | Amazon S3, Amazon Textract | Referral letters and administrative forms are stored encrypted and read for structured fields. |
| 3. Summaries | Amazon Bedrock | Draft documentation summaries are generated for staff to review, edit and approve. |
| 4. Appointments | Amazon DynamoDB | Appointments, reminders, tasks, follow-ups and approvals are stored per facility. |
| 5. Forecasting | Amazon SageMaker AI | Models forecast appointment demand and the chance of a missed appointment, so reminders and waitlists go where they help. |
| Across every stage | AWS KMS, AWS CloudTrail, Amazon CloudWatch, AWS Lambda | AWS KMS encrypts records with facility-specific keys; AWS CloudTrail records access to protected data; Amazon CloudWatch monitors jobs and APIs; AWS Lambda runs reminder and task workflows |

### Services and their role

- **Amazon Bedrock** — Drafts documentation summaries for staff to review; it never makes clinical decisions.
- **Amazon Textract** — Extracts structured fields from referral letters and administrative forms.
- **Amazon SageMaker AI** — Trains and hosts appointment-demand and missed-appointment forecasting models.
- **Amazon S3** — Stores administrative documents encrypted, separated by facility.
- **Amazon DynamoDB** — Holds appointments, reminders, tasks, follow-ups and approval history.
- **Amazon Cognito** — Authenticates staff and enforces role-based access.
- **AWS Lambda** — Runs reminder, task and follow-up workflows.
- **AWS KMS** — Manages facility-specific encryption keys.
- **AWS CloudTrail** — Keeps an audit record of access to protected resources.
- **Amazon CloudWatch** — Collects logs and metrics for jobs and APIs.

The same lists live in `src/aws.js` and are shown on the home page (`#technology`).

### Design rules

1. **Clinicians decide.** ClinicFlow supports administration; healthcare professionals retain responsibility for clinical decisions.
2. **Summaries are drafts.** AI-assisted documentation summaries are reviewed and approved by staff before they are saved or used.
3. **Least access.** Role-based access means front-desk staff see schedules, not clinical notes; every access and change is recorded.
4. **Synthetic first.** Demonstrations use synthetic records; real data only under an agreed pilot with encryption and access controls.

## Website lead capture

The pilot and contact forms post to HubSpot (see `docs/crm-plan.md`). If a server-side intake is needed later, Amazon API Gateway + AWS Lambda can validate submissions and Amazon SES can notify the founder.
