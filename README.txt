CyFort Academy deployment fix (13 October 2026)

1. Download CyFort_Academy_Deployment_Fix_Single_File.html.
2. Rename to index.html and replace repository root index.html on the GitHub Pages publishing branch.
3. Keep all original website supporting files (app.js, style.css, config.js, etc.).
4. Hard refresh (Ctrl+Shift+R) after deployment.

This version EMBEDS the four browser lab simulations, lab data, final assessment questions, styling, and workstation button routing inside index.html. It does not require uploading browser-labs.js or labs-data.js separately.

The module 8 card produced by the original app.js is relabelled as Final Assessment and points to the 50-MCQ assessment. Backend modules, quizzes, and certification requirements remain unchanged.

IMPORTANT: Browser labs and 50-MCQ scoring are client-side demos. They do not authenticate enrolment or securely submit scores to the certification backend. No real VMs are provided. Full commercial integration requires app.js and backend source files.
