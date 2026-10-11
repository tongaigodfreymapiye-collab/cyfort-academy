# CyFort Academy website repair

This ZIP preserves the original dark/red CyFort Academy page and original logo.

## IMPORTANT: Backend configuration
The supplied starter ZIP had a placeholder in `config.js`. BEFORE uploading, replace `PASTE_APPS_SCRIPT_EXEC_URL_HERE` with the exact deployed Google Apps Script `/exec` URL from your **currently working GitHub repository config.js** or Apps Script deployment. Do not paste a `/dev` URL.

## Deploy
1. Extract ZIP.
2. Edit `config.js` with your existing deployed Apps Script `/exec` URL.
3. Upload **contents** of the extracted folder (not the ZIP itself) to the root of your existing `cyfort-academy` GitHub repository, preserving `assets/cyfort-logo.png`. Commit.
4. Wait for GitHub Pages, then hard refresh Ctrl+Shift+R.
5. Open `?certificate=CYFORT-CCRA-68258406-9CEC-4B7B-B3A5-572B09EAF792`; it should show an invalid/not-found result for the sample certificate once the backend connects.

The existing Google Apps Script deployment and database are NOT changed by this ZIP. The included `apps-script/` is historical starter reference material; do not paste it over your working bound script.

## Limits
Live deployment could not be accessed from this environment; actual enrolment/email/verification calls must be tested after publishing.
