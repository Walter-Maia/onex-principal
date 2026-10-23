// Terça-feira (pin + relógio na rolagem), explorador no celular, movimento reduzido e ?fx=0
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'extra');

module.exports = async function (api) {
  await api.viewport(1440, 900);
  await api.go(BASE + '?intro=0');
  await api.wait(800);
  const topo = await api.eval('document.querySelector(".terca__trilho").getBoundingClientRect().top + scrollY');
  const alt = await api.eval('document.querySelector(".terca__trilho").offsetHeight - innerHeight');
  for (const p of [0, .3, .65, 1]) {
    await api.scroll(Math.round(topo + alt * p));
    await api.wait(700);
    await api.shot(path.join(OUT, 'terca-' + Math.round(p * 100) + '.jpg'));
  }
  // explorador: troca de aba sem pulo de altura
  const h = [];
  await api.eval('document.querySelector(".explorador").scrollIntoView({block:"start"}); window.scrollBy(0,-90)');
  for (let i = 0; i < 9; i++) {
    await api.eval('document.querySelectorAll(".explorador [role=tab]")[' + i + '].click()');
    await api.wait(120);
    h.push(await api.eval('document.querySelector(".explorador__paineis").offsetHeight'));
  }
  console.log('alturas do explorador por aba:', h.join(','));
  await api.wait(2500);
  await api.shot(path.join(OUT, '1440-explorador-backup.jpg'));

  await api.viewport(390, 844, { mobile: true });
  await api.go(BASE + '?intro=0');
  await api.wait(600);
  await api.eval('document.querySelector(".explorador").scrollIntoView({block:"start"}); window.scrollBy(0,-70)');
  await api.wait(300);
  await api.eval('document.querySelectorAll(".explorador [role=tab]")[7].click()');
  await api.wait(2600);
  await api.shot(path.join(OUT, '390-explorador-voip.jpg'));
  await api.eval('document.querySelector("#diferenciais .pilar").scrollIntoView({block:"start"}); window.scrollBy(0,-70)');
  await api.wait(2600);
  await api.shot(path.join(OUT, '390-pilar.jpg'));
  await api.eval('document.querySelector(".terca__grade").scrollIntoView({block:"center"})');
  await api.wait(4200);
  await api.shot(path.join(OUT, '390-terca.jpg'));
  await api.eval('document.querySelector("[data-menu-botao]").click()');
  await api.wait(800);
  await api.shot(path.join(OUT, '390-menu.jpg'));

  await api.viewport(1440, 900);
  await api.reducedMotion(true);
  await api.go(BASE);
  await api.wait(1500);
  await api.shot(path.join(OUT, '1440-reduzido.jpg'));
  const intro = await api.eval('!!document.querySelector(".intro") || document.documentElement.classList.contains("intro-active")');
  console.log('intro com movimento reduzido:', intro);
  await api.eval('document.querySelector("#diferenciais .pilar").scrollIntoView({block:"center"})');
  await api.wait(500);
  await api.shot(path.join(OUT, '1440-reduzido-pilar.jpg'));
  await api.reducedMotion(false);
  await api.go(BASE + '?fx=0');
  await api.wait(1500);
  await api.shot(path.join(OUT, '1440-fx0.jpg'));
};
