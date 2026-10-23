/* OneX — intro "power on" (1x por sessão).
   Infraestrutura da skill efeito-de-intro: decisão no <head>, cobertura com failsafe em CSS,
   dois rAF antes de tocar, finish(true) no tempo previsto e finish(false) como trava,
   pular por Escape/Tab/roda/toque/clique/rolagem, aba oculta libera na hora.
   Ao sair, o overlay dissolve com zoom de 1,04 e a hero entra em seguida (--rise-start): os racks
   da cena isométrica sobem em sequência. O evento "onex:intro-fim" fica disponível para quem precisar. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('intro-active')) return;

  var DURACAO = 2750;     // fim da coreografia (ms); --rise-start = 2,95 s
  var LIBERA_HERO = 1500; // quanto depois da saída a hero termina de entrar
  var LOGO = 'assets/img/logo-onex-branco.webp';
  var overlay = null, done = false, timers = [];

  try { sessionStorage.setItem('onex-intro', '1'); } catch (e) {}

  function release() { root.classList.remove('intro-active', 'intro-leaving'); }
  function cleanup() {
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('visibilitychange', onHidden);
    document.removeEventListener('wheel', onGesture, true);
    document.removeEventListener('touchstart', onGesture, true);
    document.removeEventListener('pointerdown', onGesture, true);
    window.removeEventListener('scroll', onGesture);
  }
  function avisar(natural, rect) {
    var detalhe = { natural: natural, rect: rect };
    window.__onexIntroFim = detalhe;
    try { document.dispatchEvent(new CustomEvent('onex:intro-fim', { detail: detalhe })); } catch (e) {}
  }
  function finish(natural) {
    if (done) return;
    done = true;
    cleanup();
    var rect = null;
    if (natural && overlay) {
      var svg = overlay.querySelector('.intro__logo');
      if (svg) { var r = svg.getBoundingClientRect(); rect = { left: r.left, top: r.top, width: r.width, height: r.height }; }
    }
    avisar(natural, rect);
    if (natural) { root.classList.add('intro-leaving'); root.classList.remove('intro-active'); } else release();
    if (!overlay) return;
    if (overlay.contains(document.activeElement)) document.activeElement.blur();
    overlay.classList.add('is-leaving'); // segue capturando cliques até sair do DOM
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, natural ? 520 : 300);
    if (natural) setTimeout(release, LIBERA_HERO);
  }

  var ROLAGEM = { ' ': 1, PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, End: 1, Home: 1 };
  function onKey(e) {
    if (ROLAGEM[e.key]) { e.preventDefault(); finish(false); }
    else if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter') finish(false);
  }
  function onHidden() { if (document.hidden) finish(false); }
  function onGesture(e) {
    if (e.type === 'pointerdown' && e.pointerType === 'touch') return;
    if (e.cancelable && (e.type === 'wheel' || e.type === 'touchstart')) e.preventDefault();
    finish(false);
  }

  // Polígonos do X medidos no alfa do PNG oficial (viewBox 541×458), posicionados sobre o X do logo (866×250).
  var PECAS = [
    'M1.5 69 L134.5 69 L284.5 243 L151.5 243 Z',
    'M414 0 L542 0 L331 244 L265 168 Z',
    'M156.6 273 L309.5 273 L465 458 L335 458 L233 339 L132 458 L0 458 Z'
  ];
  var X_POS = 'translate(639 0) scale(.418 .43)';

  function montar() {
    function img() { return '<image href="' + LOGO + '" width="866" height="250"/>'; }
    var fills = '', strokes = '', clip = '';
    PECAS.forEach(function (d, n) {
      fills += '<path class="il-fill" style="--n:' + n + '" d="' + d + '"/>';
      strokes += '<path class="il-stroke" pathLength="1" style="--n:' + n + '" d="' + d + '"/>';
      clip += '<path transform="' + X_POS + '" d="' + d + '"/>'; // <clipPath> não aceita <g>

    });
    var letras = [['il-co', 0], ['il-cn', 1], ['il-ce', 2]].map(function (l) {
      return '<g class="il-l" style="--n:' + l[1] + '" clip-path="url(#' + l[0] + ')">' + img() + '</g>';
    }).join('');

    return '' +
      '<div class="intro__palco">' +
        '<div class="intro__boot">' +
          '<p class="ib-l" style="--n:0;--c:28"><span class="ib-p">onex@ipatinga:~$</span> power --on</p>' +
          '<p class="ib-l" style="--n:1;--c:25"><span class="ib-ok">[ ok ]</span> energia redundante</p>' +
          '<p class="ib-l" style="--n:2;--c:33"><span class="ib-ok">[ ok ]</span> link · climatização · racks</p>' +
        '</div>' +
        '<svg class="intro__logo" viewBox="0 0 866 250" aria-hidden="true" focusable="false">' +
          '<defs>' +
            '<linearGradient id="il-grad" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<clipPath id="il-co"><rect x="0" y="28" width="206" height="140"/></clipPath>' +
            '<clipPath id="il-cn"><rect x="218" y="28" width="204" height="140"/></clipPath>' +
            '<clipPath id="il-ce"><rect x="440" y="28" width="182" height="140"/></clipPath>' +
            '<clipPath id="il-cx"><rect x="626" y="0" width="240" height="197"/></clipPath>' +
            '<clipPath id="il-ct"><rect x="378" y="197" width="460" height="53"/></clipPath>' +
            '<clipPath id="il-cxv">' + clip + '</clipPath>' +
          '</defs>' +
          letras +
          '<g class="il-x" transform="' + X_POS + '">' + fills + strokes + '</g>' +
          '<g clip-path="url(#il-cxv)"><rect class="il-scan" x="620" y="-24" width="260" height="22"/></g>' +
          '<g class="il-xof" clip-path="url(#il-cx)">' + img() + '</g>' +
          '<g clip-path="url(#il-ct)"><image class="il-tag" href="' + LOGO + '" width="866" height="250"/></g>' +
        '</svg>' +
      '</div>';
  }

  try {
    if (performance.now() > 3500 || window.pageYOffset > 4) throw new Error('tarde');
    overlay = document.createElement('div');
    overlay.className = 'intro';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = montar();
    document.body.appendChild(overlay);

    document.addEventListener('keydown', onKey, true);
    document.addEventListener('visibilitychange', onHidden);
    document.addEventListener('wheel', onGesture, { capture: true, passive: false });
    document.addEventListener('touchstart', onGesture, { capture: true, passive: false });
    document.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('scroll', onGesture, { passive: true });

    var comecar = function () {
      if (done || overlay.classList.contains('is-playing')) return;
      overlay.classList.add('is-playing');
      timers.push(setTimeout(function () { finish(true); }, DURACAO));
      timers.push(setTimeout(function () { finish(false); }, DURACAO + 2000));
    };
    requestAnimationFrame(function () { requestAnimationFrame(comecar); });
    timers.push(setTimeout(comecar, 250));              // reserva: abas em que o rAF não roda
    timers.push(setTimeout(function () { if (!overlay.classList.contains('is-playing')) finish(false); }, 1500));
  } catch (err) {
    finish(false);
  }
})();
