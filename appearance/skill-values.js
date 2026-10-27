/* Highlight description text only; never rewrite commands or game HTML. */
(() => {
  'use strict';
  const selector = '.dialog-skills > pre, .dialog-master > pre, .wxm-skill-description';
  const token = /[+＋\-−]?\d+(?:,\d{3})*(?:\.\d+)?(?:[%％]|毫秒|秒|分钟|小时|万|亿|次)?/g;
  let observer = null;
  function kind(value, before) {
    if (/(?:消耗|耗费|需要内力)\s*[:：]?\s*$/.test(before)) return 'cost';
    if (/(?:毫秒|秒|分钟|小时)$/.test(value) || /(?:冷却|出招|持续)时间\s*[:：]?\s*$/.test(before)) return 'time';
    if (/^[\-−]/.test(value)) return 'cost';
    if (/^[+＋]/.test(value) || /[%％]$/.test(value)) return 'bonus';
    return 'number';
  }
  function decorate(pre) {
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest('.wxm-skill-value, [cmd], [command], a, button, input, textarea, script, style, [contenteditable]')) nodes.push(node);
    }
    for (const node of nodes) {
      const text = node.data;
      const matches = [...text.matchAll(token)];
      if (!matches.length) continue;
      const fragment = document.createDocumentFragment();
      let end = 0;
      for (const match of matches) {
        fragment.append(document.createTextNode(text.slice(end, match.index)));
        const span = document.createElement('span');
        span.className = 'wxm-skill-value wxm-skill-' + kind(match[0], text.slice(0, match.index));
        span.textContent = match[0];
        fragment.append(span);
        end = match.index + match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(end)));
      node.replaceWith(fragment);
    }
  }
  function observe() {
    observer.observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  }
  function update(records) {
    const targets = new Set();
    if (!records) document.querySelectorAll(selector).forEach(pre => targets.add(pre));
    else for (const record of records) {
      const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      const pre = element?.closest(selector);
      if (pre) targets.add(pre);
      for (const node of record.addedNodes || []) {
        if (node.nodeType !== 1) continue;
        if (node.matches(selector)) targets.add(node);
        node.querySelectorAll(selector).forEach(pre => targets.add(pre));
      }
    }
    observer.disconnect();
    try { targets.forEach(pre => { if (pre.isConnected) decorate(pre); }); }
    finally { observe(); }
  }
  globalThis.WXMInkSkillValues = {
    start() {
      if (observer || !document.documentElement) return;
      observer = new MutationObserver(update);
      update();
    },
    stop() {
      if (observer) observer.disconnect();
      observer = null;
      document.querySelectorAll('.wxm-skill-value').forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
    }
  };
})();
