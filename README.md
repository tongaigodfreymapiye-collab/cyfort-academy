# Cyber Fortress Technologies — CyFort Academy CCRA-GP

**Deployable GitHub Pages + Google Apps Script certification automation starter**. Includes learner enrolment, automatic bank-payment email, manual payment approval and access-token email, server-scored module quizzes, separate lab approval, automated PDF certificate email and public certificate verification.

## What is implemented

- GitHub Pages frontend (`index.html`, `app.js`, `config.js`), responsive and branded.
- Google Apps Script iframe bridge (`apps-script/Bridge.html`) using `google.script.run` so a GitHub Pages site can communicate with Apps Script without unsupported cross-origin `fetch` calls.
- Enrolment records and automated banking instructions (US$100), with enrolment ID and email.
- **Manual bank verification** and secure token generation through the private Google Sheet's administrator menu. Only token hashes are stored in Sheets; raw tokens are emailed once.
- Eight module quizzes with server-side answer keys, server-side scoring and 80% pass threshold; the backend records every attempt.
- Separate **administrator-reviewed lab approval**; no capstone required.
- Once all 8 quizzes pass and lab approval is recorded, Google Docs template → PDF in Google Drive → Gmail attachment, with unique certificate ID and public verification lookup.
- A verification URL is embedded in the certificate; QR codes are not yet generated. An administrator may add a QR code to the template later, but a static QR cannot represent each unique certificate without further implementation.

## Before using it

**This is an implementation starter, not a production-certified learning management system.** The supplied quizzes are short demonstration assessments (five questions each), not a defensible professional certification exam. Replace them with validated question banks and practical evaluation criteria before accepting paid certification enrolments. Add a privacy policy, retention/deletion procedures, anti-abuse protection, transactional mail delivery monitoring, token rotation/recovery and robust identity checks before launch.

**You must configure and deploy it yourself.** No bank details, Google accounts, Google Apps Script deployments, GitHub repositories, or real emails are connected by this ZIP. No payments have been processed.

Read `docs/DEPLOYMENT.md`, then `docs/ADMIN_OPERATIONS.md`, then `docs/SECURITY_AND_LIMITATIONS.md`.

## Hosting

GitHub Pages is static. All private operations happen in Google Apps Script with a private spreadsheet. The public website does not contain answer keys, bank account details or the access-token hash pepper. Bank details are included only in enrolment emails. Google Apps Script execution/email quotas apply.

## Branding

Certification title: **Certified Cybersecurity Risk Assessment & Governance Practitioner (CCRA-GP)**. Provider: **Cyber Fortress Technologies**. Tagline: **Building Stronger Digital Defences**.
