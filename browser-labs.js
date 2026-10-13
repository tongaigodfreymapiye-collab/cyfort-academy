
(()=>{'use strict';
const root=document.getElementById('browser-labs'), labs=window.CYFORT_LABS||[];
if(!root||!labs.length)return;
const storageKey='cyfort-labs-demo-v1';
let records={};try{records=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{}
let active=null,history=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(storageKey,JSON.stringify(records))}catch{}}
function rec(id){return records[id]||(records[id]={completed:[],attempts:0})}
function score(l){return l.tasks.reduce((n,t)=>n+(rec(l.id).completed.includes(t.command)?t.points:0),0)}
function renderTiles(){
 root.innerHTML=`<div class="section-heading"><div><span class="eyebrow">INTERACTIVE BROWSER LABS</span><h2>CyFort virtual security workbench</h2><p>Practise investigation, control selection and risk decisions in a simulated command environment.</p></div></div>
 <p class="lab-note">Self-contained educational simulators — not actual virtual machines or production systems. Scores are saved in this browser only and are not official certification records.</p>
 <div class="lab-grid">${labs.map(l=>`<button type="button" class="lab-tile" data-lab="${esc(l.id)}"><small>${esc(l.category)}</small><strong>${esc(l.title)}</strong><span>${esc(l.description)}</span><p class="lab-status">${score(l)} / 100 points</p></button>`).join('')}</div>
 <div id="lab-workbench" aria-live="polite"></div>`;
 root.querySelectorAll('[data-lab]').forEach(b=>b.addEventListener('click',()=>openLab(b.dataset.lab)));
}
function log(s){history.push(s);history=history.slice(-45);const el=document.getElementById('lab-console');if(el){el.textContent=history.join('\n\n');el.scrollTop=el.scrollHeight}}
function openLab(id){active=labs.find(l=>l.id===id);if(!active)return;history=[];
 const w=document.getElementById('lab-workbench');
 w.innerHTML=`<div class="lab-workspace"><div class="lab-bar"><div><strong>${esc(active.title)}</strong><div class="lab-note">${esc(active.category)}</div></div><div><span class="lab-score" id="lab-score">${score(active)} / 100</span> <span class="lab-status" id="lab-pass"></span></div></div>
 <div class="lab-body"><div><div class="lab-console" id="lab-console" role="log" aria-label="Simulated security terminal"></div><form id="lab-form" class="lab-controls"><input id="lab-command" autocomplete="off" spellcheck="false" aria-label="Enter lab command" placeholder="Type help or a lab command" required><button type="submit">Run</button></form><div class="lab-actions"><button type="button" class="secondary" id="lab-help">Show commands</button><button type="button" class="secondary" id="lab-reset">Reset this lab</button><button type="button" class="secondary" id="lab-export">Export results</button></div></div>
 <div><h3>Objectives & scoring</h3><p class="lab-note">${esc(active.description)}</p><ol class="lab-tasks" id="lab-tasks"></ol><p class="lab-note">Complete each objective using the exact training command. Each objective scores once. Pass mark: 80/100. A browser refresh preserves progress on this device.</p></div></div></div>`;
 document.getElementById('lab-form').addEventListener('submit',e=>{e.preventDefault();const inp=document.getElementById('lab-command');run(inp.value);inp.value='';inp.focus()});
 document.getElementById('lab-help').onclick=()=>run('help');
 document.getElementById('lab-reset').onclick=()=>{if(confirm('Reset this lab score on this browser?')){records[active.id]={completed:[],attempts:0};save();openLab(active.id);renderScores()}};
 document.getElementById('lab-export').onclick=()=>{const r=rec(active.id),payload={programme:'CyFort browser lab demonstration',lab:active.title,score:score(active),maxScore:100,passed:score(active)>=80,completedObjectives:r.completed,generatedAt:new Date().toISOString(),verification:'Unverified browser-local record; not a certificate'};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.href=url;a.download=`cyfort-${active.id}-demo-results.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 log('CYFORT TRAINING TERMINAL v1\nEnvironment: SIMULATED / ISOLATED\nNo external host, account, or cloud service is modified.\n\nType "help" to view training commands.');
 updateTasks();w.scrollIntoView({behavior:'smooth',block:'nearest'});document.getElementById('lab-command').focus();
}
function renderScores(){root.querySelectorAll('[data-lab]').forEach(b=>{const l=labs.find(x=>x.id===b.dataset.lab);b.querySelector('.lab-status').textContent=`${score(l)} / 100 points`})}
function updateTasks(){if(!active)return;const r=rec(active.id),s=score(active);document.getElementById('lab-score').textContent=`${s} / 100`;document.getElementById('lab-pass').textContent=s>=80?'PASS (DEMO)':'IN PROGRESS';document.getElementById('lab-tasks').innerHTML=active.tasks.map(t=>`<li class="${r.completed.includes(t.command)?'done':''}">${r.completed.includes(t.command)?'✓ ':'○ '}${esc(t.hint)} <strong>+${t.points}</strong><code>${esc(t.command)}</code></li>`).join('');renderScores()}
function run(raw){if(!active)return;const cmd=raw.trim().toLowerCase().replace(/\s+/g,' ');if(!cmd)return;log('cyfort@lab:~$ '+cmd);if(cmd==='help'){log('AVAILABLE COMMANDS:\n'+active.tasks.map(t=>'  '+t.command).join('\n')+'\n  help\n  status\n  clear');return}if(cmd==='clear'){history=[];log('Terminal cleared.');return}if(cmd==='status'){log(`SCORE ${score(active)}/100 | PASS >=80 | COMPLETED ${rec(active.id).completed.length}/${active.tasks.length}`);return}
 const task=active.tasks.find(t=>t.command===cmd);if(!task){log('Command not recognised in this training environment. Type help for available commands.');return}
 const r=rec(active.id);r.attempts++;log(active.responses[cmd]||'Training action completed.');if(!r.completed.includes(cmd)){r.completed.push(cmd);log(`OBJECTIVE COMPLETE: +${task.points} points`)}else log('Objective already scored: +0 points');save();updateTasks();if(score(active)===100)log('ALL OBJECTIVES COMPLETED. Export your demonstration results if needed.');
}
renderTiles();
})();
