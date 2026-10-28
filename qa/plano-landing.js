// QA da landing reformulada (especificação de 28/10/2026): 1ª dobra 375×667, páginas inteiras,
// estouro lateral 360–1440, modal, diagnóstico, abas/acordeão com ?produto=, formulário, obrigado e eventos.
// Uso: node qa/cdp.js qa/plano-landing.js
'use strict';
const path = require('path');
const raiz = path.resolve(__dirname, '..').replace(/\\/g, '/').replace(/ /g, '%20');
const BASE = 'file:///' + raiz + '/index.html';
const OUT = path.resolve(__dirname, 'capturas', 'v2');
const ok = (cond, msg) => console.log((cond ? '  ok   ' : '  FALHA ') + msg);
const consentir = `localStorage.setItem('onex-consentimento', JSON.stringify({analise:false,marketing:false,versao:'2026-10-28'}))`;
// rola a página em passos pelo lado do Node (os timers da aba ficam estrangulados no headless)
async function percorrer(api) {
  const alt = await api.eval('document.documentElement.scrollHeight');
  for (let y = 0; y <= alt; y += 400) { await api.eval('scrollTo({top:' + y + ',behavior:"instant"})'); await api.wait(90); }
  await api.wait(500);
  await api.eval('scrollTo({top:0,behavior:"instant"})');
  await api.wait(300);
}
const eventos = `JSON.stringify(dataLayer.filter(function(e){return e.event&&!/^gtm/.test(e.event)}).map(function(e){var o=Object.assign({},e);return o}))`;

module.exports = async function (api) {
  // ---------- 1ª dobra no celular (375 × 667) ----------
  await api.viewport(375, 667, { mobile: true, dpr: 2 });
  await api.go(BASE);
  await api.wait(900);
  await api.shot(path.join(OUT, '375-dobra-banner.png'));
  await api.eval(consentir);
  await api.go(BASE);
  await api.wait(900);
  await api.shot(path.join(OUT, '375-dobra.png'));
  const dobra = JSON.parse(await api.eval(`JSON.stringify({h1:document.querySelector('h1').getBoundingClientRect().bottom, cta:document.querySelector('.hero .btn--primario').getBoundingClientRect().bottom, prova:document.querySelector('.prova-barra').getBoundingClientRect().bottom, txt:document.querySelector('.hero .btn--primario').innerText, href:document.querySelector('.hero .btn--primario').getAttribute('href')})`));
  console.log('1ª dobra 375×667:', JSON.stringify(dobra));
  ok(dobra.h1 <= 667 && dobra.cta <= 667, 'H1 e CTA primário sem rolar');
  ok(dobra.prova <= 667, 'barra de prova antes do primeiro scroll (wireframe)');
  ok(dobra.txt.trim() === 'Ligar para engenheiro' && dobra.href === 'tel:+553140404888', 'CTA do celular é tel: "Ligar para engenheiro"');
  ok(await api.eval(`!document.querySelector('[data-barra-fixa]').classList.contains('is-visivel')`), 'barra fixa escondida no hero');
  await api.eval('scrollTo({top:900,behavior:"instant"})'); await api.wait(500);
  ok(await api.eval(`document.querySelector('[data-barra-fixa]').classList.contains('is-visivel')`), 'barra fixa aparece depois do hero');
  await api.eval(`document.getElementById('agendar-visita').scrollIntoView({behavior:'instant'})`); await api.wait(500);
  ok(await api.eval(`!document.querySelector('[data-barra-fixa]').classList.contains('is-visivel')`), 'barra fixa some com o formulário na tela');
  ok(await api.eval(`getComputedStyle(document.body).paddingBottom === '64px'`), 'body com padding-bottom de 64 px (barra não cobre o rodapé)');

  // ---------- páginas inteiras + estouro lateral (capturas em movimento reduzido: composição final;
  // a captura longa do headless reinicia as transições e deixaria as seções em branco) ----------
  await api.reducedMotion(true);
  for (const [w, h, mob] of [[360, 740, true], [390, 844, true], [768, 1024, true], [1024, 768, false], [1440, 900, false]]) {
    await api.viewport(w, h, { mobile: mob });
    await api.go(BASE);
    await api.wait(700);
    await percorrer(api);
    const estouro = await api.eval(`JSON.stringify([].slice.call(document.querySelectorAll('body *')).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1&&!e.closest('.fotos,.sprite,.barra-fixa,dialog')}).slice(0,6).map(function(e){return (e.className&&e.className.baseVal===undefined?e.className:e.tagName)+' → '+Math.round(e.getBoundingClientRect().right)}))`);
    ok(estouro === '[]', w + ' px sem rolagem horizontal ' + (estouro === '[]' ? '' : estouro));
    await api.shot(path.join(OUT, w + '-pagina.jpg'), { full: true });
  }

  await api.reducedMotion(false);

  // ---------- desktop: modal de contato, foco, eventos ----------
  await api.viewport(1440, 900);
  await api.go(BASE);
  await api.wait(700);
  ok(await api.eval(`getComputedStyle(document.querySelector('.topo')).position === 'fixed' && !document.querySelector('.topo').classList.contains('is-solido')`), 'menu transparente no topo');
  await api.eval('scrollTo({top:120,behavior:"instant"})'); await api.wait(300); await api.eval('new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})');
  ok(await api.eval(`document.querySelector('.topo').classList.contains('is-solido')`), 'menu sólido depois de 80 px');
  await api.eval('scrollTo({top:0,behavior:"instant"})'); await api.wait(200);
  await api.eval(`document.querySelector('.hero .btn--primario').focus(); document.querySelector('.hero .btn--primario').click()`);
  await api.wait(400);
  ok(await api.eval(`document.getElementById('modal-contato').open`), 'desktop: CTA de ligação abre o modal');
  await api.shot(path.join(OUT, '1440-modal.png'));
  await api.eval(`document.getElementById('modal-contato').close()`);
  await api.wait(100);
  ok(await api.eval(`document.activeElement === document.querySelector('.hero .btn--primario')`), 'ao fechar, o foco volta ao botão de origem');

  // diagnóstico
  ok(await api.eval(`getComputedStyle(document.querySelector('[data-opcao="1"]')).display === 'block'`), 'diagnóstico: opção 1 já selecionada');
  await api.eval(`document.querySelector('input[name="desafio"][value="3"]').click()`);
  await api.wait(200);
  ok(await api.eval(`getComputedStyle(document.querySelector('[data-opcao="3"]')).display === 'block' && getComputedStyle(document.querySelector('[data-opcao="1"]')).display === 'none'`), 'diagnóstico: troca o painel sem recarregar');

  // relógio da terça
  await api.eval(`document.getElementById('teste').scrollIntoView({behavior:'instant'})`);
  await api.wait(4200);
  console.log('  relógio:', await api.eval(`document.querySelector('[data-relogio-hora]').textContent + ' ' + document.querySelector('.teste').className + ' ' + document.querySelectorAll('.teste .is-on').length`));
  ok(await api.eval(`document.querySelector('[data-relogio-hora]').textContent`) === '16:30', 'relógio vai de 14:00 até 16:30 ao entrar na tela');
  await api.shot(path.join(OUT, '1440-teste.png'), { seletor: '#teste' });

  // abas
  await api.eval(`document.getElementById('aba-voip').click()`);
  await api.wait(300);
  ok(await api.eval(`!document.getElementById('painel-voip').hidden && document.getElementById('painel-colocation').hidden`), 'abas: troca de painel');
  await api.shot(path.join(OUT, '1440-solucoes.png'), { seletor: '#solucoes' });

  // eventos
  await api.eval(`document.querySelector('[data-ref="diag-3"]').addEventListener('click', function(e){e.preventDefault()}); document.querySelector('[data-ref="diag-3"]').click()`);
  await api.eval(`document.querySelector('.diferencial .btn--link').click()`);
  await api.eval(`window.scrollTo({top: document.documentElement.scrollHeight, behavior: "instant"})`);
  await api.wait(400);
  const ev = JSON.parse(await api.eval(eventos));
  console.log('dataLayer:', ev.map((e) => e.event + JSON.stringify(Object.assign({}, e, { event: undefined }))).join('\n           '));
  ok(ev.some((e) => e.event === 'click_cta' && e.destino === 'modal-contato' && e.secao === '2-hero'), 'click_cta (modal) com secao');
  ok(ev.some((e) => e.event === 'diagnostico_opcao' && e.opcao === 3), 'diagnostico_opcao com opcao');
  ok(ev.some((e) => e.event === 'click_whatsapp' && e.ref === 'diag-3' && e.secao === '6-diag-3' && e.pagina === 'infraestrutura'), 'click_whatsapp com ref, secao e pagina');
  ok(ev.some((e) => e.event === 'scroll' && e.percent === 50) && ev.some((e) => e.event === 'scroll' && e.percent === 90), 'scroll 50% e 90%');
  ok(!JSON.stringify(ev).match(/@|\(\d\d\)/), 'nenhum dado pessoal nos eventos');

  // ---------- ?produto= ----------
  await api.go(BASE + '?produto=vps#solucoes');
  await api.wait(700);
  ok(await api.eval(`document.getElementById('aba-vps').getAttribute('aria-selected') === 'true' && !document.getElementById('painel-vps').hidden`), 'desktop: ?produto=vps abre a aba certa');
  await api.viewport(390, 844, { mobile: true });
  await api.go(BASE + '?produto=voip#solucoes');
  await api.wait(700);
  ok(await api.eval(`document.getElementById('acc-voip').getAttribute('aria-expanded') === 'true' && [].filter.call(document.querySelectorAll('.produto__painel'), function(p){return p.offsetHeight > 0}).length === 1`), 'celular: acordeão abre só o ?produto=voip');
  await api.shot(path.join(OUT, '390-solucoes.png'), { seletor: '#solucoes' });

  // ---------- formulário ----------
  await api.go(BASE + '#agendar-visita');
  await api.wait(600);
  await api.eval(`var f=document.querySelector('form[data-lead="visita"]'); f.querySelector('#v-nome').focus(); f.querySelector('#v-nome').blur();`);
  ok(await api.eval(`!document.getElementById('v-nome-erro').hidden`), 'erro aparece ao sair do campo vazio');
  await api.eval(`var n=document.getElementById('v-nome'); n.value='Teste'; n.dispatchEvent(new Event('input'))`);
  ok(await api.eval(`document.getElementById('v-nome-erro').hidden`), 'erro some assim que o valor fica correto');
  await api.eval(`var w=document.getElementById('v-whatsapp'); w.focus(); w.value='3198765'; w.dispatchEvent(new Event('input')); w.blur()`);
  ok(await api.eval(`document.getElementById('v-whatsapp').value === '(31) 9876-5' && !document.getElementById('v-whatsapp-erro').hidden`), 'máscara (00) 00000-0000 e erro com menos de 10 dígitos');
  await api.eval(`var w=document.getElementById('v-whatsapp'); w.value='31987654321'; w.dispatchEvent(new Event('input'))`);
  ok(await api.eval(`document.getElementById('v-whatsapp').value === '(31) 98765-4321'`), 'máscara com 11 dígitos');
  await api.eval(`document.querySelector('form[data-lead="visita"] [type="submit"]').click()`);
  await api.wait(200);
  ok(await api.eval(`!document.getElementById('v-empresa-erro').hidden && document.activeElement.id === 'v-empresa'`), 'envio com campos vazios: foco no primeiro inválido');
  await api.eval(`document.getElementById('v-empresa').value='ACME'; document.getElementById('v-unidade').value='ipatinga'; document.querySelector('form[data-lead="visita"] [type="submit"]').click()`);
  await api.wait(300);
  ok(await api.eval(`!document.querySelector('form[data-lead="visita"] .form__falha').hidden && /4040-4888/.test(document.querySelector('form[data-lead="visita"] .form__falha').textContent)`), 'sem endpoint: mensagem de falha com o telefone');
  await api.shot(path.join(OUT, '390-formulario.png'), { seletor: '#agendar-visita' });

  // ---------- páginas de obrigado ----------
  await api.go('file:///' + raiz + '/obrigado-visita/index.html');
  await api.wait(600);
  ok(await api.eval(`/\\/index\\.html$/.test(location.pathname) && !/obrigado/.test(location.pathname)`), 'obrigado sem parâmetro de sessão volta para a página inicial');
  await api.eval(`sessionStorage.setItem('onex-lead', JSON.stringify({id:'qa1',tipo:'visita',secao:'14-formulario',pagina:'infraestrutura',produto:'',unidade:'ipatinga'}))`);
  await api.go('file:///' + raiz + '/obrigado-visita/index.html?s=qa1');
  await api.wait(700);
  const evOb = JSON.parse(await api.eval(eventos));
  ok(evOb.some((e) => e.event === 'generate_lead' && e.tipo === 'visita' && e.unidade === 'ipatinga'), 'generate_lead no carregamento do obrigado');
  await api.shot(path.join(OUT, '390-obrigado.png'), { full: true });

  // ---------- movimento reduzido ----------
  await api.reducedMotion(true);
  await api.viewport(1440, 900);
  await api.go(BASE);
  await api.wait(600);
  ok(await api.eval(`!document.documentElement.classList.contains('fx') && [].every.call(document.querySelectorAll('[data-revela]'), function(e){return getComputedStyle(e).opacity === '1'})`), 'movimento reduzido: tudo visível, sem animação');
};
