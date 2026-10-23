/* OneX — comportamento da página (vanilla, sem bibliotecas).
   Cabeçalho, menu, títulos linha a linha, cenas vetoriais (tocam ao entrar e voltam ao início ao sair),
   explorador de soluções (abas acessíveis), "terça-feira às 14h" (relógio conduzido pela rolagem no desktop),
   mosaico e foto com máscara. Tudo funciona sem JS; com movimento reduzido ou ?fx=0 fica a composição final. */
(function () {
  'use strict';
  var root = document.documentElement;
  var temIO = 'IntersectionObserver' in window;
  function fx() { return root.classList.contains('fx'); }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  var mqReduz = matchMedia('(prefers-reduced-motion: reduce)');
  var aoReduzir = function (e) { if (e.matches) root.classList.remove('fx'); };
  if (mqReduz.addEventListener) mqReduz.addEventListener('change', aoReduzir); else if (mqReduz.addListener) mqReduz.addListener(aoReduzir);

  var ano = $('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------------- cabeçalho ---------------- */
  var topo = $('[data-topo]'), hero = $('[data-hero]');
  var pedido = 0;
  function aoRolar() {
    pedido = 0;
    var limite = hero ? hero.offsetHeight - 90 : 40;
    topo.classList.toggle('is-solido', window.pageYOffset > limite);
    terca && tercaRolar();
  }
  window.addEventListener('scroll', function () { if (!pedido) pedido = requestAnimationFrame(aoRolar); }, { passive: true });

  /* ---------------- menu ---------------- */
  var botaoMenu = $('[data-menu-botao]'), menu = $('[data-menu]');
  function abrirMenu(abrir) {
    menu.hidden = !abrir;
    root.classList.toggle('menu-aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) { var primeiro = $('a', menu); primeiro && primeiro.focus(); }
  }
  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', function () { abrirMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) abrirMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { abrirMenu(false); botaoMenu.focus(); } });
    matchMedia('(min-width: 1140px)').addListener(function (e) { if (e.matches && !menu.hidden) abrirMenu(false); });
  }

  /* ---------------- revelações que acontecem uma vez ---------------- */
  var revelar = $$('.titulo-ln, .mosaico__item');
  if (!temIO || !fx()) {
    revelar.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ioRevela = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ioRevela.unobserve(en.target); }
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    revelar.forEach(function (el) { ioRevela.observe(el); });
    // se a rolagem parar com algo armado já na tela, revela (rede de segurança)
    setTimeout(function () {
      revelar.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 3500);
  }

  /* ---------------- cenas vetoriais: tocam ao entrar, rearmam ao sair ---------------- */
  var cenas = $$('[data-cena]');
  function tocar(cena) {
    if (!fx()) return;
    cena.classList.remove('is-on');
    void cena.getBoundingClientRect();
    cena.classList.add('is-on');
    var viajante = cena.querySelector('animateMotion');
    if (viajante && viajante.beginElementAt) { try { viajante.beginElementAt(1.4); } catch (e) {} }
  }
  if (temIO && fx()) {
    var ioCena = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var c = en.target;
        if (c.closest('[hidden]')) { c.classList.remove('is-on'); return; } // painel oculto (empilhado no desktop)
        if (en.isIntersecting && en.intersectionRatio >= .3) { if (!c.classList.contains('is-on')) tocar(c); }
        else if (!en.isIntersecting) c.classList.remove('is-on');
      });
    }, { threshold: [0, .3] });
    cenas.forEach(function (c) { ioCena.observe(c); });
  }

  /* ---------------- explorador de soluções (abas) ---------------- */
  var abas = $$('.explorador [role="tab"]');
  var listaAbas = $('.explorador__abas');
  var mqLargo = matchMedia('(min-width: 1024px)');
  function orientar() { if (listaAbas) listaAbas.setAttribute('aria-orientation', mqLargo.matches ? 'vertical' : 'horizontal'); }
  orientar();
  if (mqLargo.addListener) mqLargo.addListener(orientar);

  function ativar(aba, focar) {
    abas.forEach(function (a) {
      var on = a === aba;
      a.setAttribute('aria-selected', String(on));
      a.tabIndex = on ? 0 : -1;
      var painel = document.getElementById(a.getAttribute('aria-controls'));
      if (!painel) return;
      if (on) {
        painel.hidden = false;
        painel.classList.remove('is-entrando');
        void painel.offsetWidth;
        painel.classList.add('is-entrando');
        var cena = $('[data-cena]', painel);
        if (cena) { cena.classList.remove('is-on'); requestAnimationFrame(function () { tocar(cena); }); }
      } else {
        painel.hidden = true;
        var c = $('[data-cena]', painel);
        if (c) c.classList.remove('is-on');
      }
    });
    if (focar) aba.focus();
    if (listaAbas && !mqLargo.matches) {
      var alvo = aba.offsetLeft - (listaAbas.clientWidth - aba.offsetWidth) / 2;
      listaAbas.scrollTo({ left: alvo, behavior: fx() ? 'smooth' : 'auto' });
    }
  }
  abas.forEach(function (aba, i) {
    aba.addEventListener('click', function () { ativar(aba, false); });
    aba.addEventListener('keydown', function (e) {
      var n = abas.length, j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j !== null) { e.preventDefault(); ativar(abas[j], true); }
    });
  });

  /* ---------------- terça-feira às 14h ---------------- */
  var terca = $('[data-terca]');
  var tercaRolar = function () {};
  if (terca) {
    var trilho = $('.terca__trilho', terca);
    var relogio = $('.relogio', terca);
    var rotuloHora = $('figcaption', relogio);
    var passosOnex = $$('.trilha--onex li', terca);
    var passosGigante = $$('.trilha--gigante li', terca);
    var okOnex = $('.trilha__ok', terca);
    var espera = $('.trilha__espera', terca);
    var nota = $('.trilha__nota', terca);
    var mqPin = matchMedia('(min-width: 1024px) and (min-height: 640px)');

    var LIMIAR_ONEX = [.03, .08, .13];
    var LIMIAR_OK = .19;
    var LIMIAR_GIGANTE = [.07, .24, .41, .58, .75];
    var LIMIAR_ESPERA = .8, LIMIAR_NOTA = .88;

    function hora(minutos) {
      var h = 14 + Math.floor(minutos / 60), m = Math.floor(minutos % 60);
      return h + ':' + (m < 10 ? '0' : '') + m;
    }
    function aplicar(p) {
      var minutos = p * 150; // a rolagem inteira = duas horas e meia de espera
      relogio.style.setProperty('--min', (minutos * 6).toFixed(1) + 'deg');
      relogio.style.setProperty('--hora', (60 + minutos * .5).toFixed(1) + 'deg');
      rotuloHora.textContent = hora(minutos);
      passosOnex.forEach(function (li, i) { li.classList.toggle('is-on', p >= LIMIAR_ONEX[i]); });
      okOnex.classList.toggle('is-on', p >= LIMIAR_OK);
      passosGigante.forEach(function (li, i) { li.classList.toggle('is-on', p >= LIMIAR_GIGANTE[i]); });
      espera.classList.toggle('is-on', p >= LIMIAR_ESPERA);
      nota.classList.toggle('is-on', p >= LIMIAR_NOTA);
    }
    function modoPin() { return fx() && mqPin.matches; }

    tercaRolar = function () {
      if (!modoPin()) return;
      var r = trilho.getBoundingClientRect();
      var total = trilho.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      // os primeiros passos já aparecem quando a cena chega
      aplicar(Math.max(p, r.top < window.innerHeight * .5 ? .02 : 0));
    };

    // celular/tablet (sem pin): a sequência toca quando a grade entra na tela
    var sequenciaFeita = false;
    function sequencia() {
      if (sequenciaFeita) return;
      sequenciaFeita = true;
      relogio.classList.add('gira');
      var t0 = 0;
      passosOnex.forEach(function (li, i) { setTimeout(function () { li.classList.add('is-on'); }, t0 + i * 260); });
      setTimeout(function () { okOnex.classList.add('is-on'); }, 900);
      passosGigante.forEach(function (li, i) { setTimeout(function () { li.classList.add('is-on'); }, 300 + i * 650); });
      setTimeout(function () { espera.classList.add('is-on'); }, 3300);
      setTimeout(function () { nota.classList.add('is-on'); }, 3600);
      var inicio = performance.now();
      (function relogioTexto() {
        var t = Math.min(1, (performance.now() - inicio) / 3600);
        rotuloHora.textContent = hora(t * 150);
        if (t < 1) requestAnimationFrame(relogioTexto);
      })();
    }

    if (!fx()) {
      $$('.trilha li, .trilha__ok, .trilha__nota, .trilha__espera', terca).forEach(function (el) { el.classList.add('is-on'); });
    } else if (temIO) {
      var grade = $('.terca__grade', terca);
      new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting && !modoPin()) sequencia();
      }, { threshold: .35 }).observe(grade);
      tercaRolar();
    }
  }

  /* ---------------- hero: pausa fora da tela e com a aba oculta; parallax pelo ponteiro ---------------- */
  var visualHero = $('[data-hero-visual]');
  if (hero && visualHero) {
    var heroNaTela = true;
    var aplicarPausa = function () {
      hero.classList.toggle('is-pausado', !heroNaTela || document.hidden);
    };
    if (temIO) {
      new IntersectionObserver(function (en) { heroNaTela = en[0].isIntersecting; aplicarPausa(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', aplicarPausa);

    if (fx() && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var alvoX = 0, alvoY = 0, quadroParallax = 0;
      var moverParallax = function () {
        quadroParallax = 0;
        visualHero.style.setProperty('--mx', alvoX.toFixed(3));
        visualHero.style.setProperty('--my', alvoY.toFixed(3));
      };
      hero.addEventListener('pointermove', function (e) {
        if (!fx()) return;
        var r = hero.getBoundingClientRect();
        alvoX = ((e.clientX - r.left) / r.width - .5) * 2;
        alvoY = ((e.clientY - r.top) / r.height - .5) * 2;
        if (!quadroParallax) quadroParallax = requestAnimationFrame(moverParallax);
      });
      hero.addEventListener('pointerleave', function () { alvoX = alvoY = 0; if (!quadroParallax) quadroParallax = requestAnimationFrame(moverParallax); });
    }
  }

  aoRolar();
})();
