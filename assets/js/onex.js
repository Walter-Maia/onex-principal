/* ONEX — comportamento das páginas (vanilla, sem bibliotecas). JavaScript só onde há interação:
   menu, modal de contato, barra fixa, abas/acordeão, diagnóstico, relógio, contadores, vídeo com fachada,
   formulários e banner de cookies. Sem JS tudo aparece e os links funcionam (tel:, WhatsApp, âncoras).
   Medição: cada CTA leva data-cta/data-secao/data-ref; um único ouvinte converte o clique em evento no
   dataLayer (o GTM só escuta os eventos). Nunca vão para o dataLayer nome, e-mail, telefone ou empresa. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var cfg = window.ONEX_CONFIG || {};
  var raiz = root.getAttribute('data-raiz') || '';
  var pagina = d.body.getAttribute('data-pagina') || '';
  var temIO = 'IntersectionObserver' in window;
  var mqDesktop = matchMedia('(min-width: 1024px)');   // lg: ligação abre o modal; barra fixa desligada
  var mqAbas = matchMedia('(min-width: 768px)');       // md+: abas; sm: acordeão
  var reduz = matchMedia('(prefers-reduced-motion: reduce)');
  function fx() { return root.classList.contains('fx'); }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function aoMudar(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn); }
  function rota(nome) { return raiz + nome + '/' + (location.protocol === 'file:' ? 'index.html' : ''); }
  aoMudar(reduz, function (e) { if (e.matches) root.classList.remove('fx'); });
  root.classList.add('js-pronto');

  /* =================== medição =================== */
  function evento(nome, params) {
    var o = { event: nome };
    for (var k in params) if (params[k] !== undefined && params[k] !== null && params[k] !== '') o[k] = params[k];
    (window.dataLayer = window.dataLayer || []).push(o);
  }
  window.onexEvento = evento;

  // O atributo data-pagina fica em todo CTA (padrão de marcação da especificação), a partir do <body>
  $$('[data-cta]').forEach(function (el) { if (!el.hasAttribute('data-pagina')) el.setAttribute('data-pagina', pagina); });

  var EVENTO_DO_CTA = { tel: 'click_tel', whatsapp: 'click_whatsapp', cta: 'click_cta', rota: 'click_rota', plano: 'click_plano', vcard: 'save_contact' };
  d.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-cta]');
    if (!el) return;
    var tipo = el.getAttribute('data-cta');
    var secao = el.getAttribute('data-secao') || '';
    // CTA de ligação: no celular o link tel: disca; no desktop abre o modal (ligação, WhatsApp, visita)
    if (tipo === 'tel' && mqDesktop.matches && !el.closest('.modal') && d.getElementById('modal-contato')) {
      e.preventDefault();
      evento('click_cta', { secao: secao, pagina: pagina, destino: 'modal-contato' });
      abrirModal('modal-contato', el);
      return;
    }
    var nome = EVENTO_DO_CTA[tipo];
    if (!nome) return;
    if (tipo === 'tel') evento(nome, { secao: secao, pagina: pagina });
    else if (tipo === 'whatsapp') evento(nome, { secao: secao, pagina: pagina, ref: el.getAttribute('data-ref') });
    else if (tipo === 'cta') evento(nome, { secao: secao, pagina: pagina, destino: el.getAttribute('data-destino') || (el.getAttribute('href') || '').replace(/^#/, '') });
    else if (tipo === 'rota') evento(nome, { rota: el.getAttribute('data-rota') });
    else if (tipo === 'plano') evento(nome, { plano: el.getAttribute('data-plano'), pagina: pagina });
    else evento(nome, { pagina: pagina });
  });

  // rolagem: 50% e 90% da página, uma vez cada
  var marcos = { 50: false, 90: false };
  function medirRolagem() {
    var total = d.documentElement.scrollHeight;
    if (total <= window.innerHeight) return;
    var p = (window.pageYOffset + window.innerHeight) / total * 100;
    for (var m in marcos) if (!marcos[m] && p >= +m) { marcos[m] = true; evento('scroll', { percent: +m, pagina: pagina }); }
  }

  /* =================== cabeçalho: sólido depois de 80 px =================== */
  var topo = $('[data-topo]');
  var fixoSolido = topo && topo.hasAttribute('data-topo-solido');
  var pedido = 0;
  function aoRolar() {
    pedido = 0;
    if (topo && !fixoSolido) topo.classList.toggle('is-solido', window.pageYOffset > 80);
    medirRolagem();
  }
  window.addEventListener('scroll', function () { if (!pedido) pedido = requestAnimationFrame(aoRolar); }, { passive: true });
  if (fixoSolido) topo.classList.add('is-solido');

  /* =================== menu do celular =================== */
  var botaoMenu = $('[data-menu-botao]'), menu = $('[data-menu]');
  function abrirMenu(abrir) {
    menu.hidden = !abrir;
    root.classList.toggle('menu-aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) { var primeiro = $('a', menu); if (primeiro) primeiro.focus(); }
  }
  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', function () { abrirMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) abrirMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { abrirMenu(false); botaoMenu.focus(); } });
    aoMudar(mqDesktop, function (e) { if (e.matches && !menu.hidden) abrirMenu(false); });
  }

  /* =================== modais (dialog nativo: foco preso e Esc; devolve o foco à origem) =================== */
  var origemModal = null;
  function abrirModal(id, origem) {
    var m = d.getElementById(id);
    if (!m || m.open) return;
    origemModal = origem || d.activeElement;
    if (typeof m.showModal === 'function') m.showModal(); else m.setAttribute('open', '');
    root.classList.add('modal-aberto');
  }
  function fecharModal(m, devolverFoco) {
    if (!devolverFoco) origemModal = null;
    if (typeof m.close === 'function') m.close(); else { m.removeAttribute('open'); m.dispatchEvent(new Event('close')); }
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('close', function () {
      root.classList.remove('modal-aberto');
      if (origemModal && origemModal.focus) origemModal.focus();
      origemModal = null;
    });
    m.addEventListener('click', function (e) {
      if (e.target === m) { fecharModal(m, true); return; }                    // clique no fundo
      if (e.target.closest('[data-fecha-modal]')) { fecharModal(m, true); return; }
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (href.charAt(0) === '#' && href.length > 1) {                         // ex.: "Agendar visita" → formulário
        e.preventDefault();
        fecharModal(m, false);
        irPara(href.slice(1));
      } else {
        fecharModal(m, true);                                                   // tel:, WhatsApp, vCard
      }
    });
  });
  function irPara(id) {
    var alvo = d.getElementById(id);
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: fx() ? 'smooth' : 'auto', block: 'start' });
    var campo = $('input:not([type="hidden"]):not([tabindex="-1"]), select', alvo);
    if (campo) setTimeout(function () { campo.focus({ preventScroll: true }); }, fx() ? 450 : 0);
  }

  // "Pedir proposta": abre o formulário de proposta com o produto da aba já escolhido
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-abre="proposta"]');
    if (!b || !d.getElementById('modal-proposta')) return;
    e.preventDefault();
    var sel = $('#modal-proposta select[name="produto"]');
    if (sel && b.getAttribute('data-produto')) { sel.value = b.getAttribute('data-produto'); limparErro(sel); }
    abrirModal('modal-proposta', b);
  });

  /* =================== barra fixa do celular: depois do hero, some com o formulário na tela =================== */
  var barra = $('[data-barra-fixa]'), hero = $('[data-hero]'), formVisita = d.getElementById('agendar-visita');
  if (barra) {
    var passouHero = !hero, formNaTela = false;
    var atualizaBarra = function () {
      var mostra = passouHero && !formNaTela && !mqDesktop.matches;
      barra.classList.toggle('is-visivel', mostra);
      barra.toggleAttribute('inert', !mostra);
      barra.setAttribute('aria-hidden', String(!mostra));
    };
    if (temIO) {
      if (hero) new IntersectionObserver(function (en) { passouHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; atualizaBarra(); }).observe(hero);
      if (formVisita) new IntersectionObserver(function (en) { formNaTela = en[0].isIntersecting; atualizaBarra(); }).observe(formVisita);
    } else { passouHero = true; }
    aoMudar(mqDesktop, atualizaBarra);
    atualizaBarra();
  }

  /* =================== entradas de seção (uma vez) =================== */
  var revelar = $$('[data-revela]');
  if (!fx() || !temIO) revelar.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var ioRevela = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); ioRevela.unobserve(x.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    revelar.forEach(function (el) { ioRevela.observe(el); });
  }

  /* =================== contadores da barra de prova (animam uma vez) =================== */
  $$('[data-contador]').forEach(function (el) {
    var alvo = parseInt(el.getAttribute('data-contador'), 10);
    if (isNaN(alvo) || !fx() || !temIO) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now(), dur = 400;
      (function passo(t) {
        var p = Math.min(1, (t - t0) / dur);
        el.textContent = String(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(passo);
      })(t0);
    });
    io.observe(el);
  });

  /* =================== seção 4: relógio de 14:00 até o fim do texto, uma vez =================== */
  var teste = $('[data-teste]');
  if (teste && fx() && temIO) {
    var relogio = $('.relogio', teste), hora = $('[data-relogio-hora]', teste);
    var passosOnex = $$('.passos--onex [data-passo]', teste), passosMassa = $$('.passos--massa [data-passo]', teste);
    var ok = $('.teste__ok', teste), nota = $('.teste__nota', teste);
    var MEIA_HORA = 30;
    var poe = function (min) {
      relogio.style.setProperty('--min', (min * 6) + 'deg');
      relogio.style.setProperty('--hora', (60 + min * .5) + 'deg');
      var h = 14 + Math.floor(min / 60), mm = min % 60;
      hora.textContent = h + ':' + (mm < 10 ? '0' : '') + mm;
    };
    relogio.classList.add('sem-transicao');
    teste.classList.add('is-armado');
    poe(0);
    void relogio.offsetWidth;
    relogio.classList.remove('sem-transicao');
    var ioTeste = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      ioTeste.disconnect();
      // ONEX resolve às 14:00; no provedor de massa cada passo custa meia hora
      passosOnex.forEach(function (li, i) { setTimeout(function () { li.classList.add('is-on'); }, i * 150); });
      setTimeout(function () { ok.classList.add('is-on'); }, passosOnex.length * 150 + 100);
      passosMassa.forEach(function (li, i) {
        setTimeout(function () { li.classList.add('is-on'); if (i) poe(i * MEIA_HORA); }, 700 + i * 550);
      });
      setTimeout(function () { poe(passosMassa.length * MEIA_HORA); nota.classList.add('is-on'); }, 700 + passosMassa.length * 550);
    }, { threshold: .4 });
    ioTeste.observe($('.teste__grade', teste));
  }

  /* =================== seção 6: diagnóstico (a opção 1 já vem marcada) =================== */
  var diag = $('[data-diag]');
  if (diag) {
    var opsDiag = $$('.diag__op', diag);
    diag.addEventListener('change', function (e) {
      if (!e.target || e.target.name !== 'desafio') return;
      diag.setAttribute('data-escolha', e.target.value);
      opsDiag.forEach(function (op) { op.classList.toggle('is-sel', op.contains(e.target)); });
      evento('diagnostico_opcao', { opcao: parseInt(e.target.value, 10) });
      var painel = $('[data-opcao="' + e.target.value + '"]', diag);
      if (painel && !mqDesktop.matches && painel.getBoundingClientRect().top > window.innerHeight * .75) {
        painel.scrollIntoView({ behavior: fx() ? 'smooth' : 'auto', block: 'start' });
      }
    });
  }

  /* =================== seção 7: soluções — abas (md+) e acordeão (sm) =================== */
  var sol = $('[data-solucoes]');
  if (sol) {
    var abas = $$('[role="tab"]', sol), produtos = $$('.produto', sol);
    var slugs = produtos.map(function (p) { return p.getAttribute('data-produto'); });
    var pedidoUrl = new URLSearchParams(location.search).get('produto');
    if (slugs.indexOf(pedidoUrl) < 0) pedidoUrl = null;
    var selecionado = pedidoUrl || slugs[0];   // aba ativa
    var aberto = pedidoUrl;                    // item aberto no acordeão (fechado por padrão)

    var desenhar = function () {
      var modoAbas = mqAbas.matches;
      abas.forEach(function (a) {
        var on = a.getAttribute('data-produto') === selecionado;
        a.setAttribute('aria-selected', String(on));
        a.tabIndex = on ? 0 : -1;
      });
      produtos.forEach(function (p) {
        var slug = p.getAttribute('data-produto');
        var painel = $('.produto__painel', p), botao = $('.produto__acordeao', p);
        var on = modoAbas ? slug === selecionado : slug === aberto;
        painel.hidden = !on;
        botao.setAttribute('aria-expanded', String(!modoAbas && on));
        if (modoAbas) { painel.setAttribute('role', 'tabpanel'); painel.setAttribute('aria-labelledby', 'aba-' + slug); painel.tabIndex = 0; }
        else { painel.setAttribute('role', 'region'); painel.setAttribute('aria-labelledby', 'acc-' + slug); painel.removeAttribute('tabindex'); }
      });
    };
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { selecionado = aba.getAttribute('data-produto'); desenhar(); });
      aba.addEventListener('keydown', function (e) {
        var n = abas.length, j = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j === null) return;
        e.preventDefault();
        selecionado = abas[j].getAttribute('data-produto');
        desenhar();
        abas[j].focus();
      });
    });
    produtos.forEach(function (p) {
      var slug = p.getAttribute('data-produto');
      $('.produto__acordeao', p).addEventListener('click', function () {
        aberto = aberto === slug ? null : slug;          // um aberto por vez (1 botão primário por seção)
        if (aberto) selecionado = aberto;
        desenhar();
      });
    });
    aoMudar(mqAbas, function (e) { if (!e.matches) aberto = selecionado; desenhar(); });
    desenhar();
  }

  /* =================== acordeão do FAQ (fechado por padrão) =================== */
  $$('[data-acordeao] .acordeao__botao').forEach(function (b) {
    b.addEventListener('click', function () {
      var abrir = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(abrir));
      d.getElementById(b.getAttribute('aria-controls')).hidden = !abrir;
    });
  });

  /* =================== vídeo com fachada: o player só carrega no clique; legendas obrigatórias =================== */
  $$('[data-video]').forEach(function (v) {
    var mp4 = v.getAttribute('data-mp4'), vtt = v.getAttribute('data-legendas'), yt = v.getAttribute('data-youtube');
    var botao = $('.video__play', v);
    if (mp4 && !vtt) { console.warn('[ONEX] vídeo sem arquivo de legendas (data-legendas): o player não é liberado.'); mp4 = ''; }
    var pronto = !!(mp4 || yt);
    if (!pronto) botao.setAttribute('aria-disabled', 'true');
    botao.addEventListener('click', function () {
      if (!pronto) return;
      evento('video_play', { pagina: pagina });
      var titulo = botao.getAttribute('aria-label') || 'Vídeo';
      var player;
      if (yt) {
        player = d.createElement('iframe');
        player.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&cc_load_policy=1&cc_lang_pref=pt&hl=pt-BR&rel=0';
        player.title = titulo;
        player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        player.allowFullscreen = true;
      } else {
        player = d.createElement('video');
        player.controls = true; player.autoplay = true; player.playsInline = true; player.preload = 'auto';
        player.setAttribute('aria-label', titulo);
        var src = d.createElement('source'); src.src = mp4; src.type = 'video/mp4'; player.appendChild(src);
        var tr = d.createElement('track'); tr.kind = 'captions'; tr.src = vtt; tr.srclang = 'pt-BR'; tr.label = 'Português'; tr.default = true; player.appendChild(tr);
      }
      var caixa = $('.video', v) || v;
      caixa.innerHTML = '';
      caixa.appendChild(player);
      player.focus();
    });
  });

  /* =================== formulários: visita e proposta =================== */
  // Microcopy provisória: trocar pelos textos do documento-mãe (Copy de conversão → Microcopy de formulário)
  var MSG = {
    nome: 'Informe seu nome.',
    empresa: 'Informe o nome da empresa.',
    whatsapp: 'Informe o WhatsApp com DDD: (00) 00000-0000.',
    whatsappInvalido: 'O WhatsApp precisa ter DDD e número: 10 ou 11 dígitos.',
    unidade: 'Escolha a unidade que você quer visitar.',
    produto: 'Escolha o produto de interesse.',
    revisar: 'Confira os campos destacados.',
    enviando: 'Enviando…'
  };
  var CAMPOS_ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

  function digitos(v) { return (v || '').replace(/\D/g, ''); }
  function mascararWhatsapp(v) {
    var n = digitos(v).slice(0, 11);
    if (n.length <= 2) return n.length ? '(' + n : '';
    var ddd = '(' + n.slice(0, 2) + ') ', resto = n.slice(2);
    if (resto.length <= 4) return ddd + resto;
    var corte = n.length === 11 ? 5 : 4;
    return ddd + resto.slice(0, corte) + '-' + resto.slice(corte);
  }
  function erroDo(campo) { return d.getElementById(campo.getAttribute('aria-describedby') && campo.getAttribute('aria-describedby').split(' ')[0]); }
  function mensagem(campo) {
    var v = (campo.value || '').trim();
    var nome = campo.name;
    if (!v) return MSG[nome] || 'Preencha este campo.';
    if (campo.getAttribute('data-mascara') === 'whatsapp') {
      var n = digitos(v).length;
      if (n < 10 || n > 11) return MSG.whatsappInvalido;
    }
    return '';
  }
  function mostrarErro(campo, texto) {
    var erro = erroDo(campo);
    campo.setAttribute('aria-invalid', 'true');
    if (erro) { $('span', erro).textContent = texto; erro.hidden = false; }
  }
  function limparErro(campo) {
    var erro = erroDo(campo);
    campo.removeAttribute('aria-invalid');
    if (erro) erro.hidden = true;
  }
  function validar(campo) {
    var m = mensagem(campo);
    if (m) mostrarErro(campo, m); else limparErro(campo);
    return !m;
  }
  function lerOrigem() { try { return JSON.parse(sessionStorage.getItem('onex-origem') || '{}') || {}; } catch (e) { return {}; } }

  $$('form[data-lead]').forEach(function (form) {
    var tipo = form.getAttribute('data-lead');
    var visiveis = $$('[required]', form);
    var status = $('.form__status', form), falha = $('.form__falha', form), botao = $('[type="submit"]', form);
    var textoBotao = botao.innerHTML;

    var origem = lerOrigem();
    CAMPOS_ORIGEM.forEach(function (k) { if (form.elements[k]) form.elements[k].value = origem[k] || ''; });
    if (form.elements.pagina) form.elements.pagina.value = pagina;

    $$('[data-mascara="whatsapp"]', form).forEach(function (inp) {
      inp.addEventListener('input', function () { inp.value = mascararWhatsapp(inp.value); });
    });
    visiveis.forEach(function (c) {
      // valida ao sair do campo; enquanto digita, só limpa o erro quando o valor fica correto
      c.addEventListener('blur', function () { validar(c); });
      c.addEventListener(c.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (c.getAttribute('aria-invalid') === 'true' && !mensagem(c)) limparErro(c);
        if (c.tagName === 'SELECT') validar(c);
      });
    });

    function ocupado(sim) {
      botao.disabled = sim;
      botao.setAttribute('aria-busy', String(sim));
      botao.innerHTML = sim ? MSG.enviando : textoBotao;
    }
    function mostrarFalha() { status.textContent = ''; falha.hidden = false; falha.focus(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (botao.disabled) return;
      falha.hidden = true;
      var invalidos = visiveis.filter(function (c) { return !validar(c); });
      if (invalidos.length) { status.textContent = MSG.revisar; invalidos[0].focus(); return; }
      status.textContent = '';
      if (form.elements.site && form.elements.site.value) return;              // honeypot preenchido: robô

      var dados = { tipo: tipo };                                               // "site" (honeypot) vai junto: o endpoint também recusa se vier preenchido
      $$('input, select', form).forEach(function (c) {
        if (!c.name) return;
        dados[c.name] = c.getAttribute('data-mascara') === 'whatsapp' ? digitos(c.value) : (c.value || '').trim();
      });
      var consent = $('.form__consentimento', form);
      dados.consentimento = {
        versao: form.getAttribute('data-consentimento') || cfg.versaoConsentimento,
        texto: consent ? consent.textContent.replace(/\s+/g, ' ').trim() : '',
        data_hora: new Date().toISOString(),
        pagina: location.pathname
      };

      if (!cfg.endpoint) {
        console.warn('[ONEX] Formulário sem endpoint: configure ONEX_CONFIG.endpoint em assets/js/inicio.js.');
        mostrarFalha();
        return;
      }
      ocupado(true);
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var limite = setTimeout(function () { if (ctrl) ctrl.abort(); }, cfg.tempoLimiteEnvio || 15000);
      fetch(cfg.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados), signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        clearTimeout(limite);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        try {
          sessionStorage.setItem('onex-lead', JSON.stringify({
            id: id, tipo: tipo, secao: dados.secao, pagina: pagina, produto: dados.produto || '', unidade: dados.unidade || ''
          }));
        } catch (err) {}
        location.assign(rota('obrigado-' + tipo) + '?s=' + id);
      }).catch(function () {
        clearTimeout(limite);
        ocupado(false);
        mostrarFalha();
      });
    });
  });

  /* =================== banner de cookies =================== */
  var CHAVE_CONSENT = 'onex-consentimento';
  function lerConsent() { try { return JSON.parse(localStorage.getItem(CHAVE_CONSENT) || 'null'); } catch (e) { return null; } }
  var banner = null;
  function montarBanner() {
    banner = d.createElement('section');
    banner.className = 'cookies';
    banner.setAttribute('aria-label', 'Preferências de cookies');
    banner.hidden = true;
    banner.innerHTML =
      '<p>Usamos cookies necessários e, com a sua permissão, de análise e de marketing. Veja a <a href="' + rota('privacidade') + '">Política de Privacidade</a>.</p>' +
      '<div class="cookies__opcoes" hidden>' +
        '<label><input type="checkbox" checked disabled> <span><strong>Necessários</strong><small>Sempre ativos.</small></span></label>' +
        '<label><input type="checkbox" name="analise"> <span><strong>Análise</strong><small>Google Analytics.</small></span></label>' +
        '<label><input type="checkbox" name="marketing"> <span><strong>Marketing</strong><small>Google Ads, Meta e Microsoft Clarity.</small></span></label>' +
      '</div>' +
      '<div class="cookies__acoes">' +
        '<button type="button" class="btn btn--primario" data-c="todos">Aceitar</button>' +
        '<button type="button" class="btn btn--secundario" data-c="nenhum" aria-label="Recusar (só os necessários)">Recusar</button>' +
        '<button type="button" class="btn btn--link" data-c="personalizar" aria-expanded="false">Personalizar</button>' +
      '</div>';
    d.body.appendChild(banner);
    var opcoes = $('.cookies__opcoes', banner), personalizar = $('[data-c="personalizar"]', banner);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]');
      if (!b) return;
      var acao = b.getAttribute('data-c');
      if (acao === 'todos') return salvarConsent(true, true);
      if (acao === 'nenhum') return salvarConsent(false, false);
      if (acao === 'salvar') return salvarConsent($('[name="analise"]', banner).checked, $('[name="marketing"]', banner).checked);
      if (opcoes.hidden) {
        opcoes.hidden = false;
        personalizar.setAttribute('aria-expanded', 'true');
        personalizar.textContent = 'Salvar escolhas';
        personalizar.setAttribute('data-c', 'salvar');
        var atual = lerConsent();
        if (atual) { $('[name="analise"]', banner).checked = !!atual.analise; $('[name="marketing"]', banner).checked = !!atual.marketing; }
      }
    });
  }
  function salvarConsent(analise, marketing) {
    var c = { analise: !!analise, marketing: !!marketing, versao: cfg.versaoConsentimento, data: new Date().toISOString() };
    try { localStorage.setItem(CHAVE_CONSENT, JSON.stringify(c)); } catch (e) {}
    if (window.onexAplicarConsentimento) window.onexAplicarConsentimento(c);
    banner.hidden = true;
  }
  function abrirBanner(focar) {
    if (!banner) montarBanner();
    banner.hidden = false;
    if (focar) { var b = $('button', banner); if (b) b.focus(); }
  }
  var consentAtual = lerConsent();
  if (!consentAtual || consentAtual.versao !== cfg.versaoConsentimento) abrirBanner(false);
  $$('[data-abre-cookies]').forEach(function (b) { b.addEventListener('click', function () { abrirBanner(true); }); });

  var ano = $('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();
  aoRolar();
})();
