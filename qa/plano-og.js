// Gera assets/img/og-onex.jpg (1200×630) a partir da própria hero isométrica
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, '..', 'assets', 'img', 'og-onex.jpg');

module.exports = async function (api) {
  await api.viewport(1200, 630);
  await api.go(BASE + '?intro=0');
  await api.wait(1200); // o body precisa estar montado antes de injetar o logo
  await api.eval(`(function(){var s=document.createElement('style');s.textContent=
    '.topo,.hero__provas,.hero__texto,.hero__ctas,.caixa-sobe,.hv-card--energia{display:none!important}' +
    '.hero{min-height:630px;height:630px;padding:0}.hero__grade{padding:0 0 0 0;width:calc(100% - 112px);grid-template-columns:.9fr 1.1fr}' +
    '.hero__titulo{font-size:58px;margin-bottom:26px}.og-logo{position:absolute;left:56px;bottom:46px;width:170px;z-index:5}';
    document.head.appendChild(s);
    var i=document.createElement('img');i.src='assets/img/logo-onex-branco.webp';i.className='og-logo';i.style.cssText='position:absolute;left:56px;bottom:46px;width:170px;z-index:5';document.querySelector('.hero').appendChild(i);})()`);
  await api.wait(4200);
  console.log('logo:', await api.eval('JSON.stringify(document.querySelector(".og-logo").getBoundingClientRect())'), 'hero:', await api.eval('document.querySelector(".hero").offsetHeight'));
  await api.shot(OUT);
};
