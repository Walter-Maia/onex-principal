// Lista elementos que passam da largura da tela (estouro lateral) em larguras pequenas
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
module.exports = async function (api) {
  for (const w of [320, 390]) {
    await api.viewport(w, 800, { mobile: false });
    await api.go(BASE + '?intro=0');
    await api.wait(1500);
    console.log(w, await api.eval(`JSON.stringify([].slice.call(document.querySelectorAll('body *')).filter(function(e){var r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&!e.closest('.contato__x,.hero__visual,svg,.explorador__abas')}).map(function(e){var r=e.getBoundingClientRect();return (e.className&&e.className.baseVal===undefined?e.className:e.tagName)+(e.tagName==='IMG'?'['+e.getAttribute('src')+' pai='+e.parentNode.className+']':'')+' → '+Math.round(r.right)+'px: '+(e.innerText||'').trim().slice(0,40)}).slice(0,15))`));
  }
};
