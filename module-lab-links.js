/* CyFort module virtual-workstation routing.
   Delegated listener works for module cards created later by app.js.
   Routes to existing browser simulations; does not create real VMs. */
(()=>{
  'use strict';
  const labByModule={1:'identity',2:'vuln',3:'vuln',4:'network',5:'network',6:'cloud',7:'cloud'};
  function launch(moduleNumber){
    const id=labByModule[moduleNumber];
    if(!id)return false;
    const section=document.getElementById('browser-labs');
    const tile=section?.querySelector('[data-lab="'+id+'"]');
    if(!tile)return false;
    location.hash='browser-labs';
    tile.click();
    return true;
  }
  document.addEventListener('click',event=>{
    const element=event.target.closest('a,button,[role="button"]');
    if(!element || element.closest('#browser-labs'))return;
    const label=(element.textContent||'').replace(/\s+/g,' ').trim();
    const match=label.match(/launch\s+module\s*(\d+)\s+virtual\s+workstation/i);
    if(!match)return;
    const n=Number(match[1]);
    if(!labByModule[n])return;
    // Prevent broken/placeholder links and direct the learner to the appropriate lab.
    event.preventDefault();
    event.stopImmediatePropagation();
    if(!launch(n))alert('The browser lab is not loaded. Check that browser-labs.js and labs-data.js are present.');
  },true);
})();
