// Hero isométrica: entrada em quadros, estado final, parallax, celular, pausa e modo estático
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'hero-iso');
module.exports = async function (api) {
  await api.viewport(1440, 900);
  await api.go(BASE + '?intro=0');
  let t = 0;
  for (const alvo of [350, 800, 1300, 2000, 3500]) {
    await api.wait(alvo - t); t = alvo;
    await api.shot(path.join(OUT, '1440-entrada-' + String(alvo).padStart(4, '0') + '.jpg'));
  }
  await api.mouse(1300, 200); await api.wait(200); await api.mouse(1320, 210); await api.wait(1000);
  await api.shot(path.join(OUT, '1440-parallax.jpg'));
  console.log('fontes:', await api.eval('JSON.stringify({h1: getComputedStyle(document.querySelector("h1")).fontFamily, peso: getComputedStyle(document.querySelector("h1")).fontWeight, nota: getComputedStyle(document.querySelector(".hv-nota")).fontFamily, manrope: document.fonts.check("900 40px Manrope"), caveat: document.fonts.check("700 20px Caveat")})'));
  console.log("botão de pausa:", await api.eval("document.querySelector(\"[data-hv-pausa]\") ? \"ainda existe\" : \"removido\""));
  for (const [w, h, m] of [[1024, 768, false], [390, 844, true], [320, 640, true]]) {
    await api.viewport(w, h, { mobile: m });
    await api.go(BASE + '?intro=0');
    await api.wait(3200);
    await api.shot(path.join(OUT, w + '-hero.jpg'));
    if (m) { await api.scroll(Math.round(h * .55)); await api.wait(500); await api.shot(path.join(OUT, w + '-hero-visual.jpg')); }
    console.log(w, await api.eval('JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth, heroH: document.querySelector(".hero").offsetHeight})'));
  }
  await api.viewport(1440, 900);
  await api.go(BASE + '?fx=0');
  await api.wait(1200);
  await api.shot(path.join(OUT, '1440-fx0.jpg'));
};
