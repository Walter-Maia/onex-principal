// Racks em ASCII da seção Sobre, cena do telefone corrigida e hero sem a dica
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'rack');
module.exports = async function (api) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    await api.viewport(w, h, { mobile });
    await api.go(BASE + '?intro=0');
    await api.wait(1200);
    if (!mobile) await api.shot(path.join(OUT, w + '-hero.jpg'));
    await api.eval('(function(){var e=document.querySelector(".sobre__rack");window.scrollTo({top:e.getBoundingClientRect().top+scrollY-' + (mobile ? 90 : 120) + ',behavior:"instant"});})()');
    await api.wait(900);
    await api.shot(path.join(OUT, w + '-sobre-entrando.jpg'));
    await api.wait(2000);
    await api.shot(path.join(OUT, w + '-sobre-a.jpg'));
    if (!mobile) { await api.mouse(1000, 420); await api.wait(300); }
    await api.wait(700);
    await api.shot(path.join(OUT, w + '-sobre-b.jpg'));
    const larg = await api.eval('JSON.stringify({pre: document.querySelector(".rack-ascii").scrollWidth, caixa: document.querySelector(".rack-ascii").clientWidth, sw: document.documentElement.scrollWidth, iw: innerWidth})');
    console.log(w, 'larguras:', larg);
    await api.eval('(function(){var e=document.querySelectorAll(".pilar [data-cena]")[1];e.scrollIntoView({block:"center",behavior:"instant"});})()');
    await api.wait(2800);
    await api.shot(path.join(OUT, w + '-telefone.png'));
  }
  await api.viewport(1440, 900);
  await api.go(BASE + '?fx=0');
  await api.wait(800);
  await api.eval('document.querySelector(".sobre__rack").scrollIntoView({block:"center",behavior:"instant"})');
  await api.wait(500);
  await api.shot(path.join(OUT, '1440-sobre-fx0.jpg'));
};
