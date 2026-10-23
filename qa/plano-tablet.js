// Larguras intermediárias e menu do celular
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'tablet');
module.exports = async function (api) {
  for (const [w, h, mobile] of [[820, 1180, true], [1024, 768, false], [1920, 1080, false], [320, 640, true]]) {
    await api.viewport(w, h, { mobile });
    await api.go(BASE + '?intro=0');
    await api.wait(2400);
    await api.shot(path.join(OUT, w + '-hero.jpg'));
    await api.eval('document.querySelector(".explorador").scrollIntoView({behavior:"instant",block:"start"}); window.scrollBy({top:-80,behavior:"instant"})');
    await api.wait(2600);
    await api.shot(path.join(OUT, w + '-explorador.jpg'));
    console.log(w, await api.eval('JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth})'));
  }
  await api.viewport(390, 844, { mobile: true });
  await api.go(BASE + '?intro=0');
  await api.wait(800);
  await api.scroll(1400);
  await api.wait(500);
  await api.eval('document.querySelector("[data-menu-botao]").click()');
  await api.wait(800);
  await api.shot(path.join(OUT, '390-menu.jpg'));
};
