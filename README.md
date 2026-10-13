# CyFort Academy Browser Labs integration

Upload `index.html`, `browser-labs.css`, `labs-data.js`, and `browser-labs.js` to the **same repository directory** as the existing website's `style.css`, `app.js`, and `config.js`. Keep all original supporting files.

## What works
- Four interactive command-driven training labs (identity, network, vulnerability, cloud)
- Five objectives per lab, scoring to 100 points; 80 is the demonstration pass threshold
- Per-objective scoring once, local browser persistence, result JSON export
- Mobile-responsive workbench and keyboard-operable controls
- Browser labs link in left navigation
- Visible `08 Capstone` stage removed from the seven-stage RMF pathway

## What is not implemented
- These are **simulated command environments**, not actual EC-Council-style VMs.
- The scores are stored in `localStorage`; users can modify them. They are NOT secure evidence for paid certification.
- The original `app.js` and backend may still use an eight-module curriculum and capstone requirement. Those must be changed separately in the actual source/backend if the official course is to be seven modules.
- The original `app.js` may still render module 08 dynamically; this package does not silently change backend assessment requirements.
- Production certification requires authenticated learners, server-side grading, audit logs, signed result records, anti-tampering controls, lab reset/expiry, and safe sandboxed lab infrastructure.

For commercial VM-like labs, deploy ephemeral isolated containers or VMs behind an authenticated lab broker, never inside GitHub Pages itself.
