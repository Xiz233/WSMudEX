/* WSMudEX controls; appearance settings use their own storage key/controller. */
(() => {
  'use strict';
  const toggle=document.getElementById('toggleSwitch');
  const status=document.getElementById('coreStatus');
  const input=document.getElementById('importInput');
  const show=enabled=>{toggle.checked=enabled;status.textContent=enabled?'功能已启用':'功能已停用 · 刷新游戏后完全生效';};
  async function request(message) {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id) throw new Error('请先切换到游戏标签页。');
    try {return await chrome.tabs.sendMessage(tab.id,message);}
    catch (_) {throw new Error('请切换到支持的游戏页面，刷新后重试。');}
  }
  chrome.storage.local.get('extensionEnabled').then(data=>show(data.extensionEnabled!==false))
    .catch(()=>{status.textContent='读取失败，请重试';});
  toggle.addEventListener('change',async()=>{
    const enabled=toggle.checked;
    toggle.disabled=true;
    try {
      await chrome.storage.local.set({extensionEnabled:enabled});
      show(enabled);
      try {await request({action:'updateExtensionStatus',enabled});} catch (_) {}
      status.textContent=enabled?'已启用 · 请刷新游戏':'已停用 · 请刷新游戏';
    } catch (_) {status.textContent='保存失败，请重试';toggle.checked=!enabled;}
    finally {toggle.disabled=false;}
  });
  document.getElementById('exportBtn').addEventListener('click',async()=>{
    try {
      const response=await request({action:'GM_export'});
      if(!response?.success) throw new Error(response?.error||'游戏配置导出失败');
      const url=URL.createObjectURL(new Blob([response.data],{type:'application/json'}));
      const link=document.createElement('a');
      link.href=url;link.download='wsmud_data_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='游戏配置已导出（外观单独保存在本机）';
    } catch(error) {status.textContent=error.message;}
  });
  document.getElementById('importBtn').addEventListener('click',()=>input.click());
  input.addEventListener('change',async()=>{
    const file=input.files[0];if(!file)return;
    try {
      const data=await file.text();const parsed=JSON.parse(data);
      if(!parsed||Array.isArray(parsed)||typeof parsed!=='object') throw new Error('请选择有效的游戏配置 JSON 文件。');
      const response=await request({action:'GM_import',data});
      if(!response?.success)throw new Error(response?.error||'游戏配置导入失败');
      status.textContent='游戏配置已导入，请刷新游戏';
    } catch(error) {status.textContent=error.message;}
    finally {input.value='';}
  });
})();
