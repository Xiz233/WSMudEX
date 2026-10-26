/* Shared by the isolated content script and the extension popup. */
(() => {
  'use strict';
  const defaults = Object.freeze({enabled:true, theme:'ink', fontSize:15, fontFamily:'system', customFont:'', commandFont:'consolas', density:'comfortable', width:768, colors:true});
  const commandFamilies = Object.freeze({
    consolas:'Consolas,"Cascadia Mono","JetBrains Mono",monospace',
    jetbrains:'"JetBrains Mono",Consolas,"Cascadia Mono",monospace',
    cascadia:'"Cascadia Mono","Cascadia Code",Consolas,monospace',
    inherit:'inherit'
  });
  const fallback = '"Microsoft YaHei UI","PingFang SC","Noto Sans CJK SC",sans-serif';
  const families = Object.freeze({
    system:fallback,
    yahei:'"Microsoft YaHei","微软雅黑",'+fallback,
    song:'"SimSun","Songti SC","宋体",'+fallback,
    kai:'"KaiTi","STKaiti","楷体",'+fallback,
    sourcehan:'"Source Han Sans SC","Noto Sans CJK SC","思源黑体",'+fallback,
    wenkai:'"LXGW WenKai","LXGW WenKai GB","霞鹜文楷",'+fallback
  });
  function normalize(value) {
    const v = value && typeof value === 'object' ? value : {};
    return {
      enabled: typeof v.enabled === 'boolean' ? v.enabled : defaults.enabled,
      theme: ['ink','bamboo','blue'].includes(v.theme) ? v.theme : defaults.theme,
      fontSize: typeof v.fontSize === 'number' && Number.isFinite(v.fontSize) ? Math.min(19,Math.max(14,Math.round(v.fontSize))) : defaults.fontSize,
      fontFamily: v.fontFamily === 'custom' || Object.hasOwn(families,v.fontFamily) ? v.fontFamily : defaults.fontFamily,
      customFont: typeof v.customFont === 'string' ? v.customFont.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,100) : '',
      commandFont: Object.hasOwn(commandFamilies,v.commandFont) ? v.commandFont : defaults.commandFont,
      density: ['comfortable','compact'].includes(v.density) ? v.density : defaults.density,
      width: [768,900,1040].includes(v.width) ? v.width : defaults.width,
      colors: typeof v.colors === 'boolean' ? v.colors : defaults.colors
    };
  }
  function fontStack(raw) {
    const s=normalize(raw);
    // Treat the custom value as one quoted family, never as CSS source.
    return s.fontFamily === 'custom'
      ? (s.customFont ? JSON.stringify(s.customFont)+','+fallback : fallback)
      : families[s.fontFamily];
  }
  const commandFontStack=raw=>commandFamilies[normalize(raw).commandFont];
  globalThis.WXMInk = Object.freeze({defaults,normalize,fontStack,commandFontStack,key:'wxmInkSettings'});
})();
