'use strict';
const modules=['Governance and Cybersecurity Foundations','NIST Risk Management Framework','Risk Identification and Analysis','Control Selection and Risk Treatment','Zimbabwe and International Compliance','Supply Chain, Cloud and SaaS Risk','Security Planning and Executive Reporting','Professional Practice and Ethics'];
const $=id=>document.getElementById(id);let bridgeReady=false, activeQuiz=null;
const auth=()=>{try{return JSON.parse(sessionStorage.getItem('cyfort_session')||'null')}catch{return null}};
const message=(id,msg)=>$(id).textContent=msg;
const pending=new Map();let nextId=1;
function api(action,payload={}){if(!bridgeReady)return Promise.reject(new Error('Service not connected. Check config.js and deployment.'));return new Promise((resolve,reject)=>{const id=String(nextId++);const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Request timed out. Please try again.'))},30000);pending.set(id,{resolve,reject,timer});$('bridge').contentWindow.postMessage({kind:'cyfort-request',id,action,payload},'*');});}
window.addEventListener('message',e=>{if(!window.CYFORT_CONFIG?.appsScriptUrl?.startsWith('https://script.google.com/'))return;const validOrigins=['https://script.google.com','https://script.googleusercontent.com'];if(!validOrigins.includes(e.origin)||e.source!==$('bridge').contentWindow)return;const d=e.data||{};if(d.kind==='cyfort-ready'){bridgeReady=true;$('backendState').textContent='Service connected';if(certParam)verifyFromQR();return}if(d.kind!=='cyfort-response'||!pending.has(String(d.id)))return;const p=pending.get(String(d.id));pending.delete(String(d.id));clearTimeout(p.timer);d.ok?p.resolve(d.data):p.reject(new Error(d.error||'Service error'));});
function renderModules(){const root=$('modules');root.replaceChildren();modules.forEach((name,i)=>{const n=i+1;const div=document.createElement('div');div.className='module';const heading=document.createElement('h3');heading.textContent=`Module ${n}: ${name}`;const caption=document.createElement('p');caption.className='muted';caption.textContent=n===1?'Free learning preview; graded completion requires an activated enrolment.':'Paid access — requires a verified enrolment.';const btn=document.createElement('button');btn.textContent=`Open module ${n} assessment`;btn.onclick=()=>openQuiz(n);div.append(heading,caption,btn);root.append(div);});}
$('enrollForm').addEventListener('submit',async e=>{e.preventDefault();message('enrollStatus','Submitting enrolment…');try{const r=await api('enroll',{name:$('fullName').value.trim(),email:$('email').value.trim(),consent:$('consent').checked});message('enrollStatus',`Enrolment received. Your ID: ${r.enrolmentId}. Check your email for bank transfer instructions. Keep this ID safe.`)}catch(err){message('enrollStatus',err.message)}});
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const s={enrolmentId:$('learnerId').value.trim(),token:$('accessToken').value.trim()};message('loginStatus','Validating access…');try{const r=await api('authenticate',s);sessionStorage.setItem('cyfort_session',JSON.stringify(s));message('loginStatus',`Access confirmed for ${r.name}. You may now complete assessments.`)}catch(err){message('loginStatus',err.message)}});
$('logout').onclick=()=>{sessionStorage.removeItem('cyfort_session');$('accessToken').value='';message('loginStatus','Session cleared.');};
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
renderModules();if(window.CYFORT_CONFIG?.appsScriptUrl?.startsWith('https://script.google.com/macros/s/')){$('bridge').src=window.CYFORT_CONFIG.appsScriptUrl+'?view=bridge';$('backendState').textContent='Connecting…'}

if(certParam!==null&&!window.CYFORT_CONFIG?.appsScriptUrl?.startsWith('https://script.google.com/macros/s/')){qrStatus('VERIFICATION UNAVAILABLE\n\nThe website backend URL is missing or invalid in config.js.','error');}
