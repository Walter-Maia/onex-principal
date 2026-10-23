// Fluxo de carta de vendas: hero, carta, diagnóstico (com escolha), oferta, fechamento e CTA fixo no celular
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'copy');
const ir = (id, desc) => '(function(){var e=document.getElementById("' + id + '");window.scrollTo({top:e.getBoundingClientRect().top+scrollY-' + desc + ',behavior:"instant"});})()';
module.exports = async function (api) {
  for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
    await api.viewport(w, h, { mobile: m });
    await api.go(BASE + '?intro=0');
    await api.wait(3600);
    await api.shot(path.join(OUT, w + '-1-hero.jpg'));
    for (const [id, nome] of [['carta', '2-carta'], ['desafio', '3-desafio'], ['oferta', '5-oferta'], ['contato', '6-fechamento']]) {
      await api.eval(ir(id, m ? 64 : 76));
      await api.wait(1600);
      await api.shot(path.join(OUT, w + '-' + nome + '.jpg'));
    }
    // escolhe uma frase do diagnóstico
    await api.eval(ir('desafio', m ? 64 : 76));
    await api.wait(800);
    await api.eval('document.querySelector(".quiz input[value=suporte]").click()');
    await api.wait(1200);
    await api.shot(path.join(OUT, w + '-4-desafio-escolhido.jpg'));
    console.log(w, 'escolha:', await api.eval('document.querySelector("[data-quiz]").getAttribute("data-escolha") + " / resultado visível: " + (getComputedStyle(document.querySelector("[data-res=suporte]")).display)'));
    if (m) {
      await api.eval(ir('diferenciais', 64));
      await api.wait(900);
      await api.shot(path.join(OUT, w + '-7-cta-fixo.jpg'));
      console.log('cta fixo visível no meio:', await api.eval('document.querySelector("[data-cta-fixo]").classList.contains("is-visivel")'));
    }
    console.log(w, await api.eval('JSON.stringify({sw: document.documentElement.scrollWidth, iw: innerWidth})'));
  }
};
