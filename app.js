'use strict';
const modules=['Governance and Cybersecurity Foundations','NIST Risk Management Framework','Risk Identification and Analysis','Control Selection and Risk Treatment','Zimbabwe and International Compliance','Supply Chain, Cloud and SaaS Risk','Security Planning and Executive Reporting','Professional Practice and Ethics'];
const $=id=>document.getElementById(id);let bridgeReady=false, activeQuiz=null;
const auth=()=>{try{return JSON.parse(sessionStorage.getItem('cyfort_session')||'null')}catch{return null}};
const message=(id,msg)=>$(id).textContent=msg;

// Local UI state only. Google Sheets remains the authoritative enrolment database.
const ENROLMENT_UI_KEY='cyfort_enrolment_ui_v1';
function savedEnrolment(){try{return JSON.parse(localStorage.getItem(ENROLMENT_UI_KEY)||'null')}catch{return null}}
function rememberEnrolment(id,stage){if(!id)return;localStorage.setItem(ENROLMENT_UI_KEY,JSON.stringify({enrolmentId:id,stage}));updateEnrolmentUI()}
function updateEnrolmentUI(){
  const cta=document.querySelector('.topcta');if(!cta)return;
  const saved=savedEnrolment();const session=auth();
  const active=Boolean(session&&session.enrolmentId);
  const pending=Boolean(!active&&saved&&saved.enrolmentId);
  cta.classList.toggle('is-enrolled',active);
  cta.classList.toggle('is-pending',pending);
  cta.textContent=active?'Enrolled ✓':pending?'Registration received ✓':'Enrol now ↗';
  cta.href=active?'#access':pending?'#access':'#enrolment';
  cta.title=active?'Student access confirmed in this browser':pending?'Registration recorded in this browser; payment approval is still required':'Register for CCRA-GP';
  const status=document.getElementById('enrolmentStage');
  if(status){status.textContent=active?'Your student access is active. Open the Student Portal to continue.':pending?'Registration received. Check your original payment email; do not submit another registration. Sign in after your payment is approved.':'New students: register once. Existing students: use the Student Portal.';}
  // Keep registration hidden after a confirmed enrolment in this browser.
  // The backend remains authoritative; local storage is only a display hint.
  const registrationForm=document.getElementById('enrollForm');
  const alreadyRegistered=active||pending;
  if(registrationForm){registrationForm.hidden=alreadyRegistered;registrationForm.style.display=alreadyRegistered?'none':'';}
  const registrationTitle=document.querySelector('#registration > h3');
  if(registrationTitle)registrationTitle.textContent=active?'Enrolment confirmed ✓':pending?'Registration received ✓':'Register for CCRA-GP';
  const registrationMessage=document.getElementById('enrollStatus');
  if(registrationMessage&&alreadyRegistered){
    registrationMessage.textContent=active?'Your enrolment is active. Continue to the Student Portal to access your training.':'Your registration has been received. Check your email for payment instructions, then sign in after approval.';
  }
}

// The Apps Script HTML Service page runs inside a Google-managed nested iframe.
// A ready handshake identifies the *actual* sender window, rather than assuming
// it is the outer iframe.contentWindow.
const pending=new Map();let nextId=1,bridgeWindow=null,bridgeOrigin=null;
const bridgeNonce=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
const allowedBridgeOrigin=origin=>origin==='https://script.google.com'||origin==='https://script.googleusercontent.com'||/^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/.test(origin);
function api(action,payload={}){
  if(!bridgeReady||!bridgeWindow||!bridgeOrigin)return Promise.reject(new Error('Service not connected. Check the Apps Script deployment and bridge.'));
  return new Promise((resolve,reject)=>{
    const id=String(nextId++);
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Request timed out. Please try again.'))},30000);
    pending.set(id,{resolve,reject,timer});
    try{bridgeWindow.postMessage({kind:'cyfort-request',nonce:bridgeNonce,id,action,payload},bridgeOrigin)}
    catch(error){clearTimeout(timer);pending.delete(id);reject(error)}
  });
}
window.addEventListener('message',e=>{
  if(!allowedBridgeOrigin(e.origin)||!e.source)return;
  const d=e.data||{};
  if(d.nonce!==bridgeNonce)return;
  if(d.kind==='cyfort-ready'){
    if(bridgeWindow&&e.source!==bridgeWindow)return;
    bridgeWindow=e.source;bridgeOrigin=e.origin;bridgeReady=true;
    $('backendState').textContent='Service connected';
    if(certParam!==null)verifyFromQR();
    return;
  }
  if(d.kind!=='cyfort-response'||e.source!==bridgeWindow||e.origin!==bridgeOrigin||!pending.has(String(d.id)))return;
  const p=pending.get(String(d.id));pending.delete(String(d.id));clearTimeout(p.timer);
  d.ok?p.resolve(d.data):p.reject(new Error(d.error||'Service error'));
});
function cyfortRequireLogin(){
  if(auth()) return true;
  message('loginStatus','Please sign in to open the paid learning materials and virtual workstations.');
  location.hash='access';$('loginForm').scrollIntoView({behavior:'smooth'});
  return false;
}
/* Protected materials are fetched only after backend authorisation.
   No paid asset URLs or IDs are published in GitHub Pages. */
function cyfortOpenStudy(n){
  if(!cyfortRequireLogin())return;
  cyfortOpenProtected('getStudy',n,'application/pdf');
}
function cyfortOpenLab(n){
  if(!cyfortRequireLogin())return;
  cyfortOpenProtected('getLab',n,'text/html');
}
async function cyfortOpenProtected(action,n,mime){
  // Open the tab synchronously so popup blockers do not discard it.
  const tab=window.open('about:blank','_blank');
  if(!tab){message('loginStatus','Please allow pop-ups for CyFort Academy.');return}
  tab.document.title='CyFort Academy — Loading';
  tab.document.body.textContent='Checking learner access and loading protected training material…';
  try{
    const result=await api(action,{...auth(),module:n});
    if(!result||!result.base64||result.mime!==mime)throw Error('Unexpected protected content response.');
    const binary=atob(result.base64);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    const blob=new Blob([bytes],{type:mime});
    const url=URL.createObjectURL(blob);
    tab.location.replace(url);
    // Keep object URL alive for browser PDF viewer and workstation navigation.
    window.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
  }catch(error){
    try{tab.document.body.textContent='Access denied or content unavailable: '+error.message}catch(e){}
    message('loginStatus','Unable to open protected material: '+error.message);
  }
}
function renderModules(){
  const root=$('modules');root.replaceChildren();
  modules.forEach((name,i)=>{
    const n=i+1,div=document.createElement('div');div.className='module';
    const heading=document.createElement('h3');heading.textContent=`Module ${n}: ${name}`;
    const caption=document.createElement('p');caption.className='muted';
    caption.textContent=n===1?'Free study PDF preview; assessments and virtual workstations require active enrolment.':'Study PDF and browser virtual workstation available to signed-in learners.';
    const study=document.createElement('button');study.textContent=`Read Module ${n} study PDF`;study.onclick=()=>cyfortOpenStudy(n);
    const lab=document.createElement('button');lab.textContent=`Launch Module ${n} virtual workstation`;lab.onclick=()=>cyfortOpenLab(n);
    const assessment=document.createElement('button');assessment.textContent=`Open Module ${n} assessment`;assessment.onclick=()=>openQuiz(n);
    [study,lab,assessment].forEach(btn=>{btn.style.margin='4px 9px 6px 0';btn.style.padding='10px 14px';btn.style.borderRadius='7px'});
    div.append(heading,caption,study,lab,assessment);root.append(div);
  });
}
$('enrollForm').addEventListener('submit',async e=>{e.preventDefault();message('enrollStatus','Submitting enrolment…');try{const r=await api('enroll',{name:$('fullName').value.trim(),email:$('email').value.trim(),consent:$('consent').checked});rememberEnrolment(r.enrolmentId,'pending');message('enrollStatus',`Enrolment received. Your ID: ${r.enrolmentId}. Check your email for bank transfer instructions. Keep this ID safe. Your registration is pending payment approval.`)}catch(err){message('enrollStatus',err.message)}});
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const s={enrolmentId:$('learnerId').value.trim(),token:$('accessToken').value.trim()};message('loginStatus','Validating access…');try{const r=await api('authenticate',s);sessionStorage.setItem('cyfort_session',JSON.stringify(s));rememberEnrolment(s.enrolmentId,'active');message('loginStatus',`Access confirmed for ${r.name}. You may now complete assessments.`)}catch(err){message('loginStatus',err.message)}});
$('logout').onclick=()=>{sessionStorage.removeItem('cyfort_session');$('accessToken').value='';updateEnrolmentUI();message('loginStatus','Session cleared. Sign in again to confirm active student access.');};
async function openQuiz(n){const s=auth();if(!s){message('loginStatus','Enter your enrolment ID and access token first.');$('loginForm').scrollIntoView({behavior:'smooth'});return}message('quizStatus','Loading assessment…');$('quizPanel').classList.remove('hidden');$('quizPanel').scrollIntoView({behavior:'smooth'});try{const r=await api('getQuiz',{...s,module:n});activeQuiz=n;$('quizTitle').textContent=`Module ${n}: ${modules[n-1]}`;const root=$('quizQuestions');root.replaceChildren();r.questions.forEach((q,i)=>{const fs=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent=`${i+1}. ${q.prompt}`;fs.append(legend);q.options.forEach((opt,j)=>{const label=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name=`q${i}`;radio.value=String(j);label.append(radio,document.createTextNode(opt));fs.append(label)});root.append(fs)});message('quizStatus',`Pass mark: ${r.passPercent}%. Answers are checked by CyFort's backend.`)}catch(err){activeQuiz=null;$('quizQuestions').replaceChildren();message('quizStatus',err.message)}}
$('submitQuiz').onclick=async()=>{if(!activeQuiz)return;const answers=[];for(let i=0;i<$('quizQuestions').children.length;i++){const selected=document.querySelector(`input[name=q${i}]:checked`);if(!selected){message('quizStatus','Answer every question before submitting.');return}answers.push(Number(selected.value))}message('quizStatus','Submitting assessment…');try{const r=await api('submitQuiz',{...auth(),module:activeQuiz,answers});message('quizStatus',`Score: ${r.score}%. ${r.passed?'PASS':'NOT YET PASSED'}. ${r.message}`)}catch(err){message('quizStatus',err.message)}};
$('closeQuiz').onclick=()=>$('quizPanel').classList.add('hidden');
$('progress').onclick=async()=>{if(!auth()){message('progressStatus','Please sign in first.');return}message('progressStatus','Checking progress…');try{const r=await api('progress',auth());message('progressStatus',`Passed modules: ${r.passedModules.join(', ')||'none'} / 8\nPractical lab: ${r.labApproved?'Approved':'Awaiting approval'}\nCertificate: ${r.certificateId||'Not yet issued'}${r.certificateUrl?'\nPDF: '+r.certificateUrl:''}`)}catch(err){message('progressStatus',err.message)}};
$('verifyBtn').onclick=async()=>{message('verifyStatus','Checking certificate…');try{const r=await api('verify',{certificateId:$('certificateId').value.trim()});$('verifyStatus').dataset.result=r.valid?'valid':'invalid';message('verifyStatus',r.valid?`VALID — ${r.name}\n${r.title}\nIssued: ${r.issued}`:'No valid certificate found for this ID.')}catch(err){message('verifyStatus',err.message)}};
const certParam=new URLSearchParams(location.search).get('certificate');
let qrVerificationStarted=false;
const qrStatus=(text,result)=>{const el=$('qrStatus');if(!el)return;el.textContent=text;if(result)el.dataset.result=result;};
if(certParam!==null){
  document.body.classList.add('qr-mode');
  qrStatus('Connecting to the CyFort Academy verification service…');
  if($('certificateId'))$('certificateId').value=certParam.trim();
}
async function verifyFromQR(){
  if(certParam===null||!bridgeReady||qrVerificationStarted)return;
  qrVerificationStarted=true;
  const id=certParam.trim();
  if(!id){qrStatus('INVALID LINK\n\nNo certificate ID was provided.','invalid');return;}
  qrStatus('Checking certificate ID: '+id+'\n\nPlease wait…');
  try{
    const r=await api('verify',{certificateId:id});
    if(r&&r.valid===true){
      qrStatus('✓ VERIFIED CERTIFICATE\n\nHolder: '+(r.name||'Not provided')+'\nCertification: '+(r.title||'CCRA-GP')+'\nIssued: '+(r.issued||'Not provided')+'\nCertificate ID: '+id+'\n\nIssued by Cyber Fortress Technologies','valid');
    }else{
      qrStatus('✗ CERTIFICATE NOT FOUND OR INVALID\n\nCertificate ID: '+id+'\n\nNo valid certificate record was found in the CyFort Academy database.','invalid');
    }
  }catch(err){qrStatus('VERIFICATION UNAVAILABLE\n\nThe certificate could not be checked against the database. This does not establish that it is invalid.\n\nDetails: '+err.message,'error');}
}
if(certParam!==null){
  setTimeout(()=>{if(!bridgeReady){qrStatus('VERIFICATION UNAVAILABLE\n\nThe CyFort Academy backend did not connect. Check the deployed Apps Script URL in config.js and its access permissions.','error');}},30000);
}
renderModules();updateEnrolmentUI();if(/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(window.CYFORT_CONFIG?.appsScriptUrl||'')){$('bridge').src=window.CYFORT_CONFIG.appsScriptUrl+'?view=bridge&nonce='+encodeURIComponent(bridgeNonce);$('backendState').textContent='Connecting…'}

if(certParam!==null&&!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(window.CYFORT_CONFIG?.appsScriptUrl||'')){qrStatus('VERIFICATION UNAVAILABLE\n\nThe website backend URL is missing or invalid in config.js.','error');}

// Evidence is reviewed by an administrator; it never self-approves a learner.
$('cyfortSubmitEvidence').onclick=async()=>{
  const s=auth(),file=$('cyfortEvidenceFile').files[0],status=$('cyfortEvidenceStatus');
  if(!s){status.textContent='Sign in before submitting evidence.';return}
  if(!file){status.textContent='Choose the exported workstation evidence JSON file.';return}
  if(file.size>12000){status.textContent='Evidence exceeds the 12 KB submission limit.';return}
  try{
    const evidence=JSON.parse(await file.text());
    status.textContent='Submitting for administrator review…';
    const result=await api('submitLabEvidence',{...s,evidence});
    status.textContent='Evidence received. Reference: '+result.submissionId+'. Await administrator review.';
  }catch(e){status.textContent='Submission failed: '+e.message}
};
