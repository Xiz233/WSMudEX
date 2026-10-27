/* Isolated-world appearance controller. No game commands or page storage. */
(() => {
  'use strict';
  if (globalThis.__wxmInkLoaded) return;
  globalThis.__wxmInkLoaded = true;
  const {normalize,fontStack,commandFontStack,key}=WXMInk;
  const attrs=['data-wxm-ink','data-wxm-density','data-wxm-colors'];
  const props=['--wxm-font','--wxm-family','--wxm-code-family'];
  let state={},ready=false;
  const changed=new Set();
  function apply() {
    const root=document.documentElement;
    if(!root || !ready) return;
    const s=normalize(state[key]);
    if(state.extensionEnabled===false || !s.enabled) {
      attrs.forEach(name=>root.removeAttribute(name));
      props.forEach(name=>root.style.removeProperty(name));
      WXMInkCommands.stop();
      WXMInkSkillValues.stop();
      return;
    }
    WXMInkSkillValues.start();
    root.setAttribute('data-wxm-ink',s.theme);
    root.setAttribute('data-wxm-density',s.density);
    root.setAttribute('data-wxm-colors',String(s.colors));
    root.style.setProperty('--wxm-font',s.fontSize+'px');
    root.style.setProperty('--wxm-family',fontStack(s));
    root.style.setProperty('--wxm-code-family',commandFontStack(s));
    if(s.commandFont==='inherit') WXMInkCommands.stop();
    else WXMInkCommands.start();
  }
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local') return;
    for(const name of [key,'extensionEnabled']) {
      if(Object.hasOwn(changes,name)) {
        changed.add(name); state[name]=changes[name].newValue;
      }
    }
    apply();
  });
  chrome.storage.local.get([key,'extensionEnabled']).then(stored=>{
    for(const name of [key,'extensionEnabled']) {
      if(!changed.has(name)) state[name]=stored[name];
    }
    ready=true;apply();
  }).catch(()=>console.warn('[WSMudEX · 墨境] 外观设置暂时不可用。'));
  if(!document.documentElement) document.addEventListener('DOMContentLoaded',apply,{once:true});
})();
