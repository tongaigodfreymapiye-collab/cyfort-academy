/* Additive CyFort AI Tutor widget; uses existing window.api or lexical api(). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const shell = document.createElement('section');
  shell.id = 'cyfort-ai-tutor';
  shell.innerHTML = `<button id="cyfort-ai-launch" type="button" aria-expanded="false" aria-controls="cyfort-ai-panel">✦ CyFort AI Tutor</button>
  <div id="cyfort-ai-panel" hidden role="region" aria-label="CyFort AI Tutor">
    <header><strong>✦ CyFort AI Tutor</strong><button type="button" id="cyfort-ai-close" aria-label="Close AI Tutor">×</button></header>
    <p class="cyfort-ai-note">Ask about cybersecurity or CyFort Academy. Course PDF search is not connected yet. Do not share passwords or access tokens.</p>
    <div id="cyfort-ai-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <form id="cyfort-ai-form"><label for="cyfort-ai-input">Your question</label><textarea id="cyfort-ai-input" maxlength="1200" rows="2" placeholder="Ask a cybersecurity question…" required></textarea><button type="submit" id="cyfort-ai-send">Send →</button></form>
    <small id="cyfort-ai-status" role="status"></small>
  </div>`;
  document.body.appendChild(shell);
  const panel = $('cyfort-ai-panel');
  const launch = $('cyfort-ai-launch');
  const messages = $('cyfort-ai-messages');
  const input = $('cyfort-ai-input');
  const status = $('cyfort-ai-status');
  const send = $('cyfort-ai-send');
  let history = [];
  function toggle(open) { panel.hidden = !open; launch.setAttribute('aria-expanded', String(open)); if(open) input.focus(); }
  launch.addEventListener('click', () => toggle(panel.hidden));
  $('cyfort-ai-close').addEventListener('click', () => toggle(false));
  function bubble(text, who) { const div = document.createElement('div'); div.className = 'cyfort-ai-bubble ' + who; div.textContent = text; messages.appendChild(div); messages.scrollTop = messages.scrollHeight; }
  bubble('Welcome! I can answer CyFort Academy FAQs. General AI cybersecurity answers require the API key to be configured.', 'assistant');
  $('cyfort-ai-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const question = input.value.trim(); if(!question || send.disabled) return;
    input.value = ''; bubble(question,'user'); status.textContent = 'Preparing answer…'; send.disabled = true;
    try {
      if(typeof api !== 'function') throw new Error('Website service is not ready. Refresh the page and try again.');
      // The existing app's auth() returns the current authenticated session or null.
      const session = typeof auth === 'function' ? auth() : null;
      const result = await api('chatTutor', Object.assign({question,history},session || {}));
      bubble(result.answer || 'No answer was returned.', 'assistant');
      if(result.source) bubble('Source: ' + result.source, 'source');
      history.push({role:'user',content:question},{role:'assistant',content:result.answer || ''});
      history = history.slice(-6);
      status.textContent = result.courseLinked ? 'Course-grounded answer' : 'Course PDFs not yet connected';
    } catch(err) { bubble('Unable to answer: ' + (err.message || 'Service error'), 'assistant'); status.textContent = 'Request failed'; }
    finally {send.disabled = false; input.focus();}
  });
})();
