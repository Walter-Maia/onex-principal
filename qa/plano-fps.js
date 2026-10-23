// Fluidez da hero animada: quadros por segundo e quadros longos durante 3 s (desktop e celular)
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const MEDIR = `new Promise(function(ok){var t=[],a=performance.now(),ini=a;function f(n){t.push(n-a);a=n;if(n-ini<3000)requestAnimationFrame(f);else{t.sort(function(x,y){return x-y});
  ok(JSON.stringify({fps:Math.round(t.length/3),mediana_ms:t[t.length>>1].toFixed(1),p95_ms:t[Math.floor(t.length*.95)].toFixed(1),acima_50ms:t.filter(function(x){return x>50}).length}))}}requestAnimationFrame(f)})`;
module.exports = async function (api) {
  for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
    await api.viewport(w, h, { mobile: m });
    await api.go(BASE + '?intro=0');
    await api.wait(4000); // entrada concluída: só os ciclos (LEDs, pulsos, ar) rodando
    console.log(w + 'px hero:', await api.eval(MEDIR));
  }
};
