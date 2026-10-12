# CyFort Academy — restored dashboard with integrated frontend

This package restores the original CCRA-GP 2026 dashboard HTML, stylesheet, official CyFort logo and advert, framework files, and scenario datasets from the uploaded original project. It integrates the existing enrolment, token login, eight assessments, progress and QR verification frontend from the prior CyFort Academy package.

## Deployment

1. Back up your current GitHub repository and current `config.js`.
2. Upload the **contents** of this folder to the root of `tongaigodfreymapiye-collab/cyfort-academy`, keeping the `assets`, `data`, and `docs` directories intact. Replace `index.html`, `app.js`, `config.js` and `assets/style.css`.
3. GitHub Pages: deploy from `main` and `/ (root)`.
4. Open the website and hard-refresh. Verify original logo, dashboard sections, forms, and certificate QR view.
5. Confirm **Service connected** before testing enrolment with an email address you control. The backend is a separate Google Apps Script deployment; no server-side files are changed by this package.

## Important

- `config.js` includes the deployment URL supplied in chat. If you redeploy Apps Script under a new deployment ID, update that URL.
- Keep Google Sheets, Script Properties, `Code.gs`, `Bridge.html`, Google Slides certificate template and original signature unchanged.
- The right-hand dashboard 0% indicator is a **visual placeholder**; actual learner progress is shown in the authenticated My Progress section. It does not yet compute live completion percentage.
- Some original brochure/marketing sections describe learning resources and scenarios. The original source package did not include full lesson videos or scenario simulators. Do not represent these as implemented interactive labs.
- Certificate QR test IDs should show invalid/not found; a backend connection error should say verification unavailable, not invalid.
- The original source contains no full student dashboard app beyond the public website. This is a restored public dashboard with backend-connected learner forms, not a fully-featured LMS.
- Before launch, test enrolment emails, access approval, assessments, lab approval, and real certificate issuance end-to-end. Confirm `BANK_DETAILS` and `PAYMENT_PROOF_EMAIL` are set privately in Apps Script Script Properties. Never commit these secrets.
