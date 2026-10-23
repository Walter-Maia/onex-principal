/* OneX — racks de servidores em ASCII (seção "Sobre").
   Texto puro num <pre>, redesenhado a ~8 quadros/s: LEDs piscam, barras de uso oscilam, ventoinhas giram,
   portas do switch e o tráfego andam, a bateria do UPS pulsa e uma faixa de luz percorre os racks
   (no desktop ela segue o cursor). Entra linha a linha ao aparecer; pausa fora da tela e com a aba oculta.
   Sem JS, movimento reduzido ou ?fx=0: fica o quadro estático gravado no HTML por tools/gerar-rack-estatico.js.
   O mesmo arquivo roda no Node (module.exports) para gerar esse quadro. */
(function () {
  'use strict';

  var MIOLO = 28;   // largura interna de cada rack (entre as bordas "|")
  var VAO = '    '; // espaço entre os dois racks
  var FAN = ['|', '/', '-', '\\'];

  function repete(c, n) { var s = ''; while (n-- > 0) s += c; return s; }
  function ajusta(s, n) { s = String(s); while (s.length < n) s += ' '; return s.slice(0, n); }

  // Unidades de cada rack. [tipo, rótulo, índice de estado, destaque]
  var RACKS = [
    { nome: 'RACK 07', cidade: 'IPATINGA', unidades: [
      ['switch', '', 0], ['patch'], ['sep'],
      ['srv', 'web-01', 0], ['srv', 'web-02', 1], ['discos', '', 0], ['sep'],
      ['rotulo', '> seu servidor'], ['srv', 'erp-01', 2, true], ['discos', '', 1, true], ['sep'],
      ['srv', 'db-01', 3], ['srv', 'db-02', 4], ['discos', '', 2], ['sep'],
      ['vazio'], ['srv', 'mail-1', 5], ['srv', 'voip-1', 6], ['sep'],
      ['vazio'], ['vazio'], ['ups', '', 0], ['ups', '', 1]
    ] },
    { nome: 'RACK 03', cidade: 'BELO HORIZONTE', unidades: [
      ['switch', '', 1], ['patch'], ['sep'],
      ['srv', 'vm-01', 7], ['srv', 'vm-02', 8], ['srv', 'vm-03', 9], ['discos', '', 3], ['sep'],
      ['srv', 'bkp-01', 10], ['discos', '', 4], ['discos', '', 5], ['sep'],
      ['srv', 'cloud1', 11], ['srv', 'cloud2', 12], ['sep'],
      ['vazio'], ['srv', 'dns-01', 13], ['srv', 'vps-01', 14], ['sep'],
      ['vazio'], ['vazio'], ['ups', '', 2], ['ups', '', 3]
    ] }
  ];

  // Estado com valores determinísticos (o quadro estático é sempre o mesmo)
  function novoEstado() {
    var e = { quadro: 0, leds: [], carga: [], discos: [], portas: [], trafego: 0, bateria: 0 };
    for (var i = 0; i < 16; i++) { e.leds.push([i % 3 !== 1, i % 2 === 0]); e.carga.push(3 + ((i * 7) % 6)); }
    for (var d = 0; d < 6; d++) { var a = []; for (var k = 0; k < 6; k++) a.push((d + k) % 3 === 0); e.discos.push(a); }
    for (var s = 0; s < 2; s++) { var p = []; for (var q = 0; q < 16; q++) p.push((q + s) % 3 !== 0); e.portas.push(p); }
    return e;
  }
  function avanca(e, aleatorio) {
    var r = aleatorio || Math.random;
    e.quadro++;
    e.leds.forEach(function (par) { if (r() < .22) par[0] = !par[0]; if (r() < .35) par[1] = !par[1]; });
    e.carga = e.carga.map(function (c) { c += (r() - .48) * 2.4; return c < 1 ? 1 : c > 10 ? 10 : c; });
    e.discos.forEach(function (a) { for (var k = 0; k < a.length; k++) if (r() < .3) a[k] = !a[k]; });
    e.portas.forEach(function (p) { for (var k = 0; k < p.length; k++) if (r() < .18) p[k] = !p[k]; });
    e.trafego = (e.trafego + 1) % 4;
    e.bateria = (e.bateria + 1) % 12;
  }

  // Cada linha é uma lista de segmentos [classe, texto]; classes: f moldura, t texto, d apagado,
  // l LED aceso, b barra de uso, w ventoinha, o laranja (destaque), c bateria
  function led(on, destaque) { return on ? ['l', '*'] : [destaque ? 'o' : 'd', 'o']; }

  function unidade(u, e) {
    var tipo = u[0], i = u[2], destaque = !!u[3];
    var corTexto = destaque ? 'o' : 't';
    switch (tipo) {
      case 'sep': return [['f', '|' + repete('-', MIOLO) + '|']];
      case 'vazio': return [['f', '| '], ['d', repete('- ', 13)], ['f', ' |']];
      case 'rotulo': return [['f', '| '], ['o', ajusta(u[1], 26)], ['f', ' |']];
      case 'patch': {
        var pp = '';
        for (var k = 0; k < 23; k++) pp += (k % 4 === 3) ? '|' : ':';
        return [['f', '| '], ['t', 'PP '], ['d', pp], ['f', ' |']];
      }
      case 'srv': {
        var n = Math.round(e.carga[i]);
        return [['f', '| '], [corTexto, '['], led(e.leds[i][0], destaque), led(e.leds[i][1], destaque), [corTexto, '] '],
          [corTexto, ajusta(u[1], 6)], [corTexto, ' ['], [destaque ? 'o' : 'b', repete('#', n)], ['d', repete('.', 10 - n)],
          [corTexto, '] '], ['w', FAN[(e.quadro + i) % 4]], ['f', ' |']];
      }
      case 'discos': {
        var segs = [['f', '| '], [corTexto, '|']];
        e.discos[i].forEach(function (ativo) { segs.push(ativo ? [destaque ? 'o' : 'b', '#'] : ['d', '=']); segs.push([corTexto, '|']); });
        segs.push(['t', '  ']);
        e.discos[i].forEach(function (ativo, k) { segs.push(led(ativo, destaque)); if (k < 5) segs.push(['t', ' ']); });
        segs.push(['f', ' |']);
        return segs;
      }
      case 'switch': {
        var s = [['f', '| '], ['t', 'SW [']];
        e.portas[i].forEach(function (on) { s.push(on ? ['l', '*'] : ['d', 'o']); });
        var tr = repete(' ', e.trafego) + '>' + repete(' ', 3 - e.trafego);
        s.push(['t', '] '], ['l', tr], ['f', ' |']);
        return s;
      }
      case 'ups': {
        var bat = '';
        for (var b = 0; b < 12; b++) bat += '=';
        var pos = (e.bateria + i * 5) % 12;
        return [['f', '| '], ['t', 'UPS ['], ['c', bat.slice(0, pos)], ['w', '='], ['c', bat.slice(pos + 1)], ['t', '] '],
          ['t', 'AC ok'], ['f', '   |']];
      }
    }
    return [['f', '|' + repete(' ', MIOLO) + '|']];
  }

  function linhasDoRack(rack, e) {
    var cab = rack.nome + repete(' ', 26 - rack.nome.length - rack.cidade.length) + rack.cidade;
    var linhas = [
      [['f', '.' + repete('-', MIOLO) + '.']],
      [['f', '| '], ['t', cab], ['f', ' |']],
      [['f', '|' + repete('=', MIOLO) + '|']]
    ];
    rack.unidades.forEach(function (u) { linhas.push(unidade(u, e)); });
    linhas.push([['f', "'" + repete('-', MIOLO) + "'"]]);
    linhas.push([['d', '  [__]' + repete(' ', MIOLO - 10) + '[__]  ']]);
    return linhas;
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // HTML do quadro: os dois racks lado a lado + piso. visiveis = linhas já "ligadas" na entrada.
  function quadro(e, opcoes) {
    opcoes = opcoes || {};
    var a = linhasDoRack(RACKS[0], e), b = linhasDoRack(RACKS[1], e);
    var total = a.length + 1;
    var visiveis = opcoes.visiveis == null ? total : opcoes.visiveis;
    var html = [];
    for (var j = 0; j < total; j++) {
      var segs = j < a.length ? a[j].concat([['t', VAO]], b[j]) : [['d', repete('_', MIOLO * 2 + 4 + VAO.length)]];
      var largura = segs.reduce(function (s, g) { return s + g[1].length; }, 0);
      if (j >= visiveis) { html.push('<span class="r-ln">' + repete(' ', largura) + '</span>'); continue; }
      var partes = [], atual = null, buf = '';
      segs.forEach(function (g) {
        if (g[0] === atual) { buf += g[1]; return; }
        if (atual !== null) partes.push('<span class="r-' + atual + '">' + esc(buf) + '</span>');
        atual = g[0]; buf = g[1];
      });
      partes.push('<span class="r-' + atual + '">' + esc(buf) + '</span>');
      html.push('<span class="r-ln' + (j === opcoes.luz ? ' is-luz' : '') + '">' + partes.join('') + '</span>');
    }
    return html.join('\n');
  }

  var api = { quadro: quadro, novoEstado: novoEstado, avanca: avanca, linhas: function () { return RACKS[0].unidades.length + 6; } };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // ---------------- navegador ----------------
  var pre = document.querySelector('[data-rack]');
  if (!pre) return;
  var root = document.documentElement;
  var figura = pre.closest('figure') || pre.parentNode;
  function animado() { return root.classList.contains('fx'); }

  var estado = novoEstado(), total = api.linhas(), visiveis = total;
  var rodando = false, visivel = false, timer = 0, entrando = false;
  var luz = -1, luzManual = -1, luzMov = 0;

  function desenhar() { pre.innerHTML = quadro(estado, { visiveis: visiveis, luz: luzManual >= 0 ? luzManual : luz }); }

  function passo() {
    timer = 0;
    if (!rodando) return;
    avanca(estado);
    if (entrando) { visiveis = Math.min(total, visiveis + 2); if (visiveis >= total) entrando = false; }
    // faixa de luz: desce uma linha por quadro e descansa um pouco antes de recomeçar
    luz = (estado.quadro % (total + 14)) - 4;
    if (luzManual >= 0 && performance.now() - luzMov > 2500) luzManual = -1;
    desenhar();
    timer = setTimeout(passo, 125);
  }
  function atualizar() {
    var pode = visivel && !document.hidden && animado();
    if (pode && !rodando) { rodando = true; passo(); }
    else if (!pode && rodando) { rodando = false; clearTimeout(timer); timer = 0; }
  }

  if (animado() && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var antes = visivel;
      visivel = en[0].isIntersecting;
      if (visivel && !antes) { visiveis = 0; entrando = true; } // liga linha a linha toda vez que reaparece
      atualizar();
    }, { threshold: .15 }).observe(figura);
    document.addEventListener('visibilitychange', atualizar);
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    var aoMudar = function () { setTimeout(atualizar, 0); };
    if (mq.addEventListener) mq.addEventListener('change', aoMudar); else if (mq.addListener) mq.addListener(aoMudar);

    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      figura.addEventListener('pointermove', function (ev) {
        var r = pre.getBoundingClientRect();
        var alturaLinha = r.height / total;
        luzManual = Math.max(0, Math.min(total - 1, Math.floor((ev.clientY - r.top) / alturaLinha)));
        luzMov = performance.now();
      });
      figura.addEventListener('pointerleave', function () { luzManual = -1; });
    }
  }
})();
