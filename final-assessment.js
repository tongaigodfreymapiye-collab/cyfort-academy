
(()=>{'use strict';
const root=document.getElementById('final-assessment'),q=window.CYFORT_FINAL_QUESTIONS||[];
if(!root||q.length!==50)return;
const key='cyfort-final-assessment-demo-v1';
let state={answers:{},submitted:false,attempt:1};try{const old=JSON.parse(localStorage.getItem(key)||'null');if(old&&typeof old==='object'&&old.answers)state=old}catch{}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const answered=()=>Object.keys(state.answers).filter(k=>state.answers[k]!==undefined).length;
const correct=()=>q.filter(x=>Number(state.answers[x.id])===x.correct).length;
function draw(){
root.innerHTML=`<div class="section-heading"><div><span class="eyebrow">ASSESSMENT 08 · COMPREHENSIVE EXAM</span><h2>Final knowledge assessment</h2><p>50 multiple-choice questions across Prepare, Categorize, Select, Implement, Assess, Authorize and Monitor.</p></div></div>
<div class="final-meta"><span>Questions: <b>50</b></span><span>Pass mark: <b>80% (40/50)</b></span><span>Answered: <b id="final-count">${answered()}/50</b></span><span>Attempt: <b>${state.attempt}</b></span></div>
<p class="final-hint">Demonstration assessment: answers and results are stored locally in this browser. This is not authenticated or tamper-resistant grading and does not issue a certificate. Official pass rules, attempt limits and result recording must be implemented in the CyFort backend.</p>
<form id="final-form">${q.map(x=>`<fieldset class="final-question"><legend>${x.id}. [Module ${x.module}] ${escapeHtml(x.question)}</legend>${x.options.map((a,j)=>`<label><input type="radio" name="question-${x.id}" value="${j}" ${Number(state.answers[x.id])===j?'checked':''} ${state.submitted?'disabled':''}><span>${escapeHtml(a)}</span></label>`).join('')}</fieldset>`).join('')}</form>
<div class="final-actions"><button type="button" id="final-submit" ${state.submitted?'disabled':''}>Submit final assessment</button><button type="button" class="secondary" id="final-new">Start new attempt</button><button type="button" class="secondary" id="final-export" ${state.submitted?'':'disabled'}>Export results</button></div><div id="final-result" aria-live="polite"></div>`;
root.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener('change',()=>{const id=Number(el.name.split('-')[1]);state.answers[id]=Number(el.value);save();document.getElementById('final-count').textContent=answered()+'/50'}));
document.getElementById('final-submit').onclick=()=>{if(answered()!==50){document.getElementById('final-result').textContent=`Please answer all 50 questions before submitting. ${50-answered()} remaining.`;return}if(!confirm('Submit your final answers? This attempt cannot be edited afterward.'))return;state.submitted=true;save();draw()};
document.getElementById('final-new').onclick=()=>{if(!confirm('Begin a new attempt? The previous local answers will be replaced.'))return;state={answers:{},submitted:false,attempt:state.attempt+1};save();draw()};
document.getElementById('final-export').onclick=()=>{const payload={programme:'CyFort Academy',assessment:'Assessment 08 – 50 MCQs',attempt:state.attempt,correct:correct(),total:50,percent:correct()*2,passed:correct()>=40,createdAt:new Date().toISOString(),verification:'Browser-only demonstration, not official certification evidence'};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='cyfort-assessment-08-demo-result.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
if(state.submitted){const n=correct();document.getElementById('final-result').innerHTML=`<div class="final-result"><strong>${n>=40?'PASS':'NOT PASSED'} — ${n}/50 (${n*2}%)</strong><p>Required: 40 correct answers (80%). This score is a local demonstration result and does not update the CyFort certification database.</p><p>${q.map(x=>Number(state.answers[x.id])!==x.correct?`Question ${x.id}: correct answer — ${escapeHtml(x.options[x.correct])}`:'').filter(Boolean).join('<br>')}</p></div>`}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
draw();
})();
