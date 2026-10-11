
'use strict';

/*
 * CYFORT ACADEMY
 * Cyber Fortress Technologies
 * Frontend application: app.js
 *
 * Certification:
 * Certified Cybersecurity Risk Assessment &
 * Governance Practitioner (CCRA-GP)
 */

const modules = [
  'Governance and Cybersecurity Foundations',
  'NIST Risk Management Framework',
  'Risk Identification and Analysis',
  'Control Selection and Risk Treatment',
  'Zimbabwe and International Compliance',
  'Supply Chain, Cloud and SaaS Risk',
  'Security Planning and Executive Reporting',
  'Professional Practice and Ethics'
];

const $ = id => document.getElementById(id);

let bridgeReady = false;
let activeQuiz = null;
let nextId = 1;
let verificationRunning = false;

const pending = new Map();

const certParam = new URLSearchParams(
  window.location.search
).get('certificate');

/* ==========================================
   UTILITIES
========================================== */

function message(id, msg) {
  const element = $(id);

  if (!element) {
    console.warn('Missing element:', id);
    return;
  }

  element.textContent = msg;
  element.style.whiteSpace = 'pre-line';
}

function auth() {
  try {
    return JSON.parse(
      sessionStorage.getItem('cyfort_session') || 'null'
    );
  } catch {
    return null;
  }
}

function getBackendUrl() {
  return window.CYFORT_CONFIG?.appsScriptUrl || '';
}

function backendConfigured() {
  return getBackendUrl().startsWith(
    'https://script.google.com/macros/s/'
  );
}

function scrollToElement(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

/* ==========================================
   GOOGLE APPS SCRIPT API BRIDGE
========================================== */

function api(action, payload = {}) {
  if (!bridgeReady) {
    return Promise.reject(
      new Error(
        'CyFort Academy service is not connected. ' +
        'Please check config.js and the Apps Script deployment.'
      )
    );
  }

  const iframe = $('bridge');

  if (!iframe || !iframe.contentWindow) {
    return Promise.reject(
      new Error('The backend communication bridge is unavailable.')
    );
  }

  return new Promise((resolve, reject) => {
    const id = String(nextId++);

    const timer = setTimeout(() => {
      pending.delete(id);

      reject(
        new Error(
          'The request timed out. Please try again.'
        )
      );
    }, 30000);

    pending.set(id, {
      resolve,
      reject,
      timer
    });

    iframe.contentWindow.postMessage(
      {
        kind: 'cyfort-request',
        id,
        action,
        payload
      },
      '*'
    );
  });
}

/* ==========================================
   BACKEND CONNECTION MESSAGES
========================================== */

window.addEventListener('message', event => {
  if (!backendConfigured()) return;

  const iframe = $('bridge');

  if (!iframe || event.source !== iframe.contentWindow) {
    return;
  }

  const validOrigins = [
    'https://script.google.com',
    'https://script.googleusercontent.com'
  ];

  if (!validOrigins.includes(event.origin)) {
    return;
  }

  const data = event.data || {};

  if (data.kind === 'cyfort-ready') {
    bridgeReady = true;

    message(
      'backendState',
      'Service connected'
    );

    // A QR link should be verified only after
    // the backend is connected.
    if (certParam) {
      verifyCertificateFromQR();
    }

    return;
  }

  if (
    data.kind !== 'cyfort-response' ||
    !pending.has(String(data.id))
  ) {
    return;
  }

  const request = pending.get(String(data.id));

  pending.delete(String(data.id));
  clearTimeout(request.timer);

  if (data.ok) {
    request.resolve(data.data);
  } else {
    request.reject(
      new Error(data.error || 'Service error')
    );
  }
});

/* ==========================================
   MODULE DISPLAY
========================================== */

function renderModules() {
  const root = $('modules');

  if (!root) return;

  root.replaceChildren();

  modules.forEach((name, index) => {
    const number = index + 1;

    const container = document.createElement('div');
    container.className = 'module';

    const heading = document.createElement('h3');
    heading.textContent =
      `Module ${number}: ${name}`;

    const caption = document.createElement('p');
    caption.className = 'muted';

    caption.textContent =
      number === 1
        ? 'Free learning preview; graded completion requires an activated enrolment.'
        : 'Paid access — requires a verified enrolment.';

    const button = document.createElement('button');

    button.type = 'button';
    button.textContent =
      `Open module ${number} assessment`;

    button.addEventListener('click', () => {
      openQuiz(number);
    });

    container.append(
      heading,
      caption,
      button
    );

    root.append(container);
  });
}

/* ==========================================
   LEARNER ENROLMENT
========================================== */

async function submitEnrolment(event) {
  event.preventDefault();

  const name = $('fullName').value.trim();
  const email = $('email').value.trim();
  const consent = $('consent').checked;

  if (!name || !email || !consent) {
    message(
      'enrollStatus',
      'Please complete your name, email and consent.'
    );
    return;
  }

  message(
    'enrollStatus',
    'Submitting your enrolment…'
  );

  try {
    const result = await api('enroll', {
      name,
      email,
      consent
    });

    message(
      'enrollStatus',
      'ENROLMENT RECEIVED\n\n' +
      'Your enrolment ID: ' +
      result.enrolmentId +
      '\n\n' +
      'Check your email for the bank payment instructions.\n\n' +
      'After payment, send proof of payment as instructed. ' +
      'Once Cyber Fortress Technologies confirms payment, ' +
      'your access token will be emailed to you.\n\n' +
      'Keep your enrolment ID safe.'
    );
  } catch (error) {
    message(
      'enrollStatus',
      'Enrolment unsuccessful: ' + error.message
    );
  }
}

/* ==========================================
   LEARNER LOGIN
========================================== */

async function submitLogin(event) {
  event.preventDefault();

  const credentials = {
    enrolmentId: $('learnerId').value.trim(),
    token: $('accessToken').value.trim()
  };

  if (!credentials.enrolmentId || !credentials.token) {
    message(
      'loginStatus',
      'Enter your enrolment ID and access token.'
    );
    return;
  }

  message(
    'loginStatus',
    'Validating your access…'
  );

  try {
    const result = await api(
      'authenticate',
      credentials
    );

    sessionStorage.setItem(
      'cyfort_session',
      JSON.stringify(credentials)
    );

    message(
      'loginStatus',
      'ACCESS CONFIRMED\n\n' +
      'Welcome, ' + result.name + '.\n\n' +
      'You can now complete your module assessments.'
    );
  } catch (error) {
    sessionStorage.removeItem('cyfort_session');

    message(
      'loginStatus',
      'Access denied: ' + error.message
    );
  }
}

function logout() {
  sessionStorage.removeItem('cyfort_session');

  if ($('accessToken')) {
    $('accessToken').value = '';
  }

  message(
    'loginStatus',
    'Your session has been cleared.'
  );
}

/* ==========================================
   MODULE ASSESSMENTS
========================================== */

async function openQuiz(moduleNumber) {
  const session = auth();

  if (!session) {
    message(
      'loginStatus',
      'Please enter your enrolment ID and access token first.'
    );

    scrollToElement($('loginForm'));
    return;
  }

  activeQuiz = null;

  const panel = $('quizPanel');

  if (!panel) return;

  panel.classList.remove('hidden');

  message(
    'quizStatus',
    'Loading assessment…'
  );

  scrollToElement(panel);

  try {
    const result = await api('getQuiz', {
      ...session,
      module: moduleNumber
    });

    activeQuiz = moduleNumber;

    $('quizTitle').textContent =
      `Module ${moduleNumber}: ${modules[moduleNumber - 1]}`;

    const root = $('quizQuestions');

    root.replaceChildren();

    result.questions.forEach((question, index) => {
      const fieldset = document.createElement('fieldset');

      const legend = document.createElement('legend');

      legend.textContent =
        `${index + 1}. ${question.prompt}`;

      fieldset.append(legend);

      question.options.forEach((option, optionIndex) => {
        const label = document.createElement('label');

        const radio = document.createElement('input');

        radio.type = 'radio';
        radio.name = `q${index}`;
        radio.value = String(optionIndex);

        label.append(
          radio,
          document.createTextNode(option)
        );

        fieldset.append(label);
      });

      root.append(fieldset);
    });

    message(
      'quizStatus',
      `Pass mark: ${result.passPercent}%.\n` +
      'Your answers will be checked by the CyFort Academy backend.'
    );
  } catch (error) {
    activeQuiz = null;

    $('quizQuestions').replaceChildren();

    message(
      'quizStatus',
      'Unable to load assessment: ' + error.message
    );
  }
}

async function submitQuiz() {
  if (!activeQuiz) return;

  const session = auth();

  if (!session) {
    message(
      'quizStatus',
      'Your session has expired. Please sign in again.'
    );
    return;
  }

  const answers = [];

  const questionCount =
    $('quizQuestions').children.length;

  for (let index = 0; index < questionCount; index++) {
    const selected = document.querySelector(
      `input[name="q${index}"]:checked`
    );

    if (!selected) {
      message(
        'quizStatus',
        'Please answer every question before submitting.'
      );
      return;
    }

    answers.push(Number(selected.value));
  }

  message(
    'quizStatus',
    'Submitting your assessment…'
  );

  try {
    const result = await api('submitQuiz', {
      ...session,
      module: activeQuiz,
      answers
    });

    message(
      'quizStatus',
      'ASSESSMENT RESULT\n\n' +
      `Score: ${result.score}%\n` +
      `Result: ${result.passed ? 'PASS' : 'NOT YET PASSED'}\n\n` +
      (result.message || '')
    );
  } catch (error) {
    message(
      'quizStatus',
      'Assessment submission failed: ' + error.message
    );
  }
}

/* ==========================================
   LEARNER PROGRESS
========================================== */

async function checkProgress() {
  const session = auth();

  if (!session) {
    message(
      'progressStatus',
      'Please sign in before checking your progress.'
    );
    return;
  }

  message(
    'progressStatus',
    'Checking your certification progress…'
  );

  try {
    const result = await api(
      'progress',
      session
    );

    const passedModules =
      Array.isArray(result.passedModules)
        ? result.passedModules
        : [];

    message(
      'progressStatus',
      'CYFORT ACADEMY CERTIFICATION PROGRESS\n\n' +
      'Passed modules: ' +
      (passedModules.join(', ') || 'None') +
      ' / 8\n\n' +
      'Practical laboratory: ' +
      (result.labApproved
        ? 'Approved'
        : 'Awaiting approval') +
      '\n\n' +
      'Certificate: ' +
      (result.certificateId || 'Not yet issued') +
      (result.certificateUrl
        ? '\n\nCertificate PDF: ' + result.certificateUrl
        : '')
    );
  } catch (error) {
    message(
      'progressStatus',
      'Unable to retrieve progress: ' + error.message
    );
  }
}

/* ==========================================
   CERTIFICATE VERIFICATION
========================================== */

function formatVerificationResult(result, certificateId) {
  if (result && result.valid === true) {
    return (
      '✓ VERIFIED CERTIFICATE\n\n' +
      'Certificate Holder: ' + (result.name || 'Not provided') + '\n' +
      'Certification: ' + (result.title || 'CCRA-GP') + '\n' +
      'Date Issued: ' + (result.issued || 'Not provided') + '\n' +
      'Certificate ID: ' + certificateId + '\n\n' +
      'Issued by Cyber Fortress Technologies\n' +
      'CyFort Academy'
    );
  }

  return (
    '✗ CERTIFICATE NOT FOUND OR INVALID\n\n' +
    'Certificate ID: ' + certificateId + '\n\n' +
    'CyFort Academy could not confirm a valid certificate ' +
    'with this identification number.\n\n' +
    'Please contact Cyber Fortress Technologies ' +
    'if you believe this is an error.'
  );
}

async function verifyCertificate(certificateId) {
  const id = String(certificateId || '').trim();

  if (!id) {
    message(
      'verifyStatus',
      'Please enter a certificate ID.'
    );
    return;
  }

  if (verificationRunning) return;

  verificationRunning = true;

  message(
    'verifyStatus',
    'Verifying certificate against CyFort Academy records…'
  );

  try {
    const result = await api('verify', {
      certificateId: id
    });

    message(
      'verifyStatus',
      formatVerificationResult(result, id)
    );
  } catch (error) {
    message(
      'verifyStatus',
      'CERTIFICATE VERIFICATION UNAVAILABLE\n\n' +
      'We could not complete the database check.\n\n' +
      'Reason: ' + error.message +
      '\n\nPlease try again later.'
    );
  } finally {
    verificationRunning = false;
  }
}

/* ==========================================
   MANUAL CERTIFICATE VERIFICATION
========================================== */

async function verifyCertificateManually() {
  const id = $('certificateId').value.trim();

  if (!id) {
    message(
      'verifyStatus',
      'Please enter the certificate ID.'
    );
    return;
  }

  if (!bridgeReady) {
    message(
      'verifyStatus',
      'The verification service is still connecting. ' +
      'Please wait a moment and try again.'
    );
    return;
  }

  await verifyCertificate(id);
}

/* ==========================================
   AUTOMATIC QR CODE VERIFICATION
========================================== */

async function verifyCertificateFromQR() {
  if (!certParam) return;

  const certificateId = certParam.trim();

  if (!certificateId) return;

  if ($('certificateId')) {
    $('certificateId').value = certificateId;
  }

  const verificationSection =
    $('verifyStatus') || $('certificateId');

  scrollToElement(verificationSection);

  if (!bridgeReady) {
    message(
      'verifyStatus',
      'Connecting to the CyFort Academy verification service…'
    );
    return;
  }

  await verifyCertificate(certificateId);
}

/* ==========================================
   EVENT LISTENERS
========================================== */

function attachEvents() {
  const enrollForm = $('enrollForm');

  if (enrollForm) {
    enrollForm.addEventListener(
      'submit',
      submitEnrolment
    );
  }

  const loginForm = $('loginForm');

  if (loginForm) {
    loginForm.addEventListener(
      'submit',
      submitLogin
    );
  }

  const logoutButton = $('logout');

  if (logoutButton) {
    logoutButton.addEventListener(
      'click',
      logout
    );
  }

  const submitQuizButton = $('submitQuiz');

  if (submitQuizButton) {
    submitQuizButton.addEventListener(
      'click',
      submitQuiz
    );
  }

  const closeQuizButton = $('closeQuiz');

  if (closeQuizButton) {
    closeQuizButton.addEventListener(
      'click',
      () => {
        $('quizPanel').classList.add('hidden');
      }
    );
  }

  const progressButton = $('progress');

  if (progressButton) {
    progressButton.addEventListener(
      'click',
      checkProgress
    );
  }

  const verifyButton = $('verifyBtn');

  if (verifyButton) {
    verifyButton.addEventListener(
      'click',
      verifyCertificateManually
    );
  }
}

/* ==========================================
   CONNECT TO APPS SCRIPT
========================================== */

function connectBackend() {
  const iframe = $('bridge');

  if (!iframe) {
    console.error(
      'CyFort Academy bridge iframe is missing.'
    );
    return;
  }

  if (!backendConfigured()) {
    message(
      'backendState',
      'Backend not configured. Check config.js.'
    );

    if (certParam) {
      message(
        'verifyStatus',
        'Certificate verification is unavailable because ' +
        'the backend has not been configured.'
      );
    }

    return;
  }

  message(
    'backendState',
    'Connecting…'
  );

  if (certParam) {
    message(
      'verifyStatus',
      'Connecting to CyFort Academy certificate verification…'
    );
  }

  iframe.src = getBackendUrl() + '?view=bridge';

  // Report a connection problem if the Apps Script
  // bridge does not respond within 30 seconds.
  setTimeout(() => {
    if (bridgeReady) return;

    message(
      'backendState',
      'Connection unavailable'
    );

    if (certParam) {
      message(
        'verifyStatus',
        'CERTIFICATE VERIFICATION UNAVAILABLE\n\n' +
        'CyFort Academy could not connect to its ' +
        'verification database.\n\n' +
        'Please try again later.'
      );
    }
  }, 30000);
}

/* ==========================================
   INITIALISE CYFORT ACADEMY
========================================== */

function initialiseAcademy() {
  attachEvents();

  renderModules();

  connectBackend();

  if (certParam && $('certificateId')) {
    $('certificateId').value = certParam.trim();

    scrollToElement(
      $('verifyStatus') || $('certificateId')
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initialiseAcademy
  );
} else {
  initialiseAcademy();
}
