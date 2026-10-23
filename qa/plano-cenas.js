// Verifica cada cena vetorial no meio da animação e no quadro final (node cdp.js qa/plano-cenas.js)
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'cenas');
const LARG = Number(process.env.LARG || 1440);

module.exports = async function (api) {
  await api.viewport(LARG, 900, { mobile: LARG < 700 });
  await api.go(BASE + '?intro=0');
  await api.wait(800);
  const n = await api.eval('document.querySelectorAll(".pilar [data-cena], .rota [data-cena]").length');
  for (let i = 0; i < n; i++) {
    await api.eval('(function(){var c=document.querySelectorAll(".pilar [data-cena], .rota [data-cena]")[' + i + '];c.setAttribute("data-qa","1");c.scrollIntoView({block:"center"});})()');
    await api.wait(900);
    await api.shot(path.join(OUT, LARG + '-pilar' + i + '-meio.png'), { seletor: '[data-qa]' });
    await api.wait(1700);
    await api.shot(path.join(OUT, LARG + '-pilar' + i + '-fim.png'), { seletor: '[data-qa]' });
    await api.eval('document.querySelector("[data-qa]").removeAttribute("data-qa")');
  }
  const abas = await api.eval('document.querySelectorAll(".explorador [role=tab]").length');
  await api.eval('document.querySelector(".explorador").scrollIntoView({block:"start"}); window.scrollBy(0,-90)');
  await api.wait(600);
  for (let i = 0; i < abas; i++) {
    await api.eval('document.querySelectorAll(".explorador [role=tab]")[' + i + '].click()');
    await api.wait(2700);
    await api.shot(path.join(OUT, LARG + '-aba' + i + '.png'), { seletor: '.painel:not([hidden])' });
  }
};
