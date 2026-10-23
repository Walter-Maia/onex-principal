// Plano de QA do site principal (rode com o harness cdp.js: node cdp.js qa/plano-qa.js)
// Gera capturas em qa/capturas/. Ajuste ETAPAS pela linha de comando: ETAPAS=intro,hero,pagina,movimento
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas');
const ETAPAS = (process.env.ETAPAS || 'hero,intro,pagina,movimento').split(',');

async function percorrer(api, passo) {
  const altura = await api.eval('document.documentElement.scrollHeight');
  for (let y = 0; y < altura; y += passo) { await api.scroll(y); await api.wait(260); }
  await api.wait(400);
}

module.exports = async function (api) {
  if (ETAPAS.includes('hero')) {
    for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
      await api.viewport(w, h, { mobile });
      await api.go(BASE + '?intro=0');
      await api.wait(2600);
      await api.shot(path.join(OUT, w + '-hero.png'));
      if (!mobile) { await api.mouse(980, 420); await api.wait(200); await api.mouse(1010, 430); await api.wait(700); await api.shot(path.join(OUT, w + '-hero-lanterna.png')); }
      const info = await api.eval('JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth})');
      console.log(w, 'overflow:', info);
    }
  }
  if (ETAPAS.includes('intro')) {
    for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
      await api.viewport(w, h, { mobile });
      await api.go(BASE + '?intro=1');
      let t = 0;
      for (const alvo of [250, 700, 1150, 1600, 2100, 2600, 3100, 3700, 4500]) {
        await api.wait(alvo - t); t = alvo;
        await api.shot(path.join(OUT, 'intro-' + w + '-' + String(alvo).padStart(4, '0') + '.jpg'));
      }
    }
  }
  if (ETAPAS.includes('pagina')) {
    for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
      await api.viewport(w, h, { mobile });
      await api.go(BASE + '?intro=0');
      await api.wait(1500);
      await percorrer(api, Math.round(h * 0.6));
      await api.shot(path.join(OUT, w + '-pagina.jpg'), { full: true, scale: mobile ? 0.6 : 0.5 });
      const info = await api.eval('JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth})');
      console.log(w, 'overflow:', info);
    }
  }
  if (ETAPAS.includes('movimento')) {
    await api.viewport(1440, 900);
    await api.reducedMotion(true);
    await api.go(BASE);
    await api.wait(1200);
    await api.shot(path.join(OUT, '1440-reduzido-hero.png'));
    await api.go(BASE + '?fx=0');
    await api.wait(1200);
    await api.shot(path.join(OUT, '1440-fx0.jpg'), { full: true, scale: 0.4 });
    await api.reducedMotion(false);
  }
};
