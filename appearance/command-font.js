/* Identify the site's <hic>HH:MM:SS</hic> <hiy>command</hiy> echo.
   Mark existing elements only: no text replacement, wrapping or event handlers. */
(() => {
  'use strict';
  const marker='data-wxm-command-ink';
  let observer=null;
  function inspect(stamp) {
    if (!stamp.closest('.content-message pre')) return;
    let next=stamp.nextSibling;
    while(next && next.nodeType===3 && /^[ \t]*$/.test(next.textContent)) next=next.nextSibling;
    const code=next?.nodeType===1 && next.localName==='hiy' ? next : null;
    const valid=!!code && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(stamp.textContent.trim())
      && /^[#/@]?[A-Za-z_][A-Za-z0-9_.:-]*(?:[ \t]+[^\r\n]+)?$/.test(code.textContent.trim());
    stamp.toggleAttribute(marker,valid);
    if(code) code.toggleAttribute(marker,valid);
    else if(stamp.nextElementSibling?.hasAttribute(marker)) stamp.nextElementSibling.removeAttribute(marker);
  }
  function scan(node) {
    const el=node.nodeType===1 ? node : node.parentElement;
    if(!el) return;
    // Appended newline text must not trigger a rescan of the entire log.
    if(node.nodeType!==1 && !['hic','hiy'].includes(el.localName)) return;
    if(el.localName==='hic') inspect(el);
    if(el.localName==='hiy') {
      if(el.previousElementSibling?.localName==='hic') inspect(el.previousElementSibling);
      else el.removeAttribute(marker);
    }
    for(const stamp of el.querySelectorAll('hic')) inspect(stamp);
  }
  function stop() {
    observer?.disconnect(); observer=null;
    for(const el of document.querySelectorAll('['+marker+']')) el.removeAttribute(marker);
  }
  function start() {
    if(observer) return;
    observer=new MutationObserver(records=>{
      for(const record of records) {
        if(record.type==='characterData') scan(record.target);
        else {
          // Text within a timestamp/command may have been replaced.
          if(['hic','hiy'].includes(record.target.localName)) scan(record.target);
          for(const node of record.addedNodes) scan(node);
          if(record.removedNodes.length && ['hic','hiy'].includes(record.previousSibling?.localName)) scan(record.previousSibling);
        }
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    for(const stamp of document.querySelectorAll('.content-message pre hic')) inspect(stamp);
  }
  globalThis.WXMInkCommands=Object.freeze({start,stop});
})();
