(() => {
  'use strict';
  const {defaults,normalize,fontStack,commandFontStack,key} = WXMInk;
  const byId = id => document.getElementById(id);
  const controls = ['enabled','fontSize','fontFamily','customFont','commandFont','density','colors'];
  const status = byId('status');
  let queue = Promise.resolve();
  let update = 0;
  function render(raw) {
    const s = normalize(raw);
    for (const id of controls) {
      if (typeof s[id] === 'boolean') byId(id).checked = s[id];
      else byId(id).value = s[id];
    }
    document.querySelector(`input[name="theme"][value="${s.theme}"]`).checked = true;
    byId('fontValue').textContent = s.fontSize+' px';
    byId('customFontRow').hidden = s.fontFamily !== 'custom';
    preview(s);
  }
  function preview(s) {
    byId('fontSample').style.fontFamily=fontStack(s);
    byId('fontSample').style.fontSize=s.fontSize+'px';
    byId('commandSample').style.fontFamily=s.commandFont==='inherit'?fontStack(s):commandFontStack(s);
    byId('commandSample').style.fontSize=s.fontSize+'px';
  }
  function getValue() {
    return normalize({enabled:byId('enabled').checked,theme:document.querySelector('input[name="theme"]:checked')?.value,fontSize:Number(byId('fontSize').value),fontFamily:byId('fontFamily').value,customFont:byId('customFont').value,commandFont:byId('commandFont').value,density:byId('density').value,colors:byId('colors').checked});
  }
  function save(value) {
    const current = ++update;
    status.textContent = '正在保存…';
    queue = queue.catch(()=>{}).then(()=>chrome.storage.local.set({[key]:value})).then(()=>{
      if (current === update) status.textContent = value.enabled ? '已保存 · 游戏页即时生效' : '已恢复原界面';
    }).catch(()=>{if(current === update) status.textContent = '保存失败，请重试';});
  }
  async function init() {
    try {
      const data = await chrome.storage.local.get(key);
      render(data[key]);
      status.textContent = normalize(data[key]).enabled ? '外观已启用' : '正在使用原界面';
    } catch (_) { render(defaults); status.textContent = '读取失败，可重新保存'; }
    document.addEventListener('change', event => {
      if (!controls.includes(event.target.id) && event.target.name !== 'theme') return;
      const value=getValue(); render(value); save(value);
    });
    byId('fontSize').addEventListener('input',()=>{byId('fontValue').textContent=byId('fontSize').value+' px';preview(getValue());});
    byId('customFont').addEventListener('input',()=>preview(getValue()));
    const commitFont=()=>{const value=getValue();render(value);save(value);};
    byId('applyFont').addEventListener('click',commitFont);
    byId('customFont').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();commitFont();event.target.blur();}});
    byId('reset').addEventListener('click',()=>{render(defaults);save({...defaults});});
  }
  init();
})();
