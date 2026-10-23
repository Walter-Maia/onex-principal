// Gera a cena isométrica do datacenter da hero e grava no index.html (entre os marcadores hero-cena).
// Uso: node tools/gerar-hero-datacenter.js   (Node 14+). Idempotente.
// Projeção isométrica: x e y no piso, z para cima; quem olha está do lado +x +y.
'use strict';
var fs = require('fs');
var path = require('path');

var C = Math.cos(Math.PI / 6), S = 0.5, U = 46;
var todos = [];
function P(x, y, z) { var p = [(x - y) * C * U, ((x + y) * S - z) * U]; todos.push(p); return p; }
function pt(p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }
function poli(lista) { return lista.map(function (q) { return pt(P(q[0], q[1], q[2])); }).join(' '); }
function linha(a, b) { var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); return 'M' + pt(p) + 'L' + pt(q); }
function caminho(lista) { return lista.map(function (q, i) { return (i ? 'L' : 'M') + pt(P(q[0], q[1], q[2])); }).join(''); }

// ---- mundo ----
var PISO = { x: 9.4, y: 7.2 };
var H = 3.1;                 // altura do rack
var LARG = 1.1, VAO = 0.12;  // largura do rack e vão entre racks
var N = 6, X0 = 0.9;
var FILAS = [{ y0: 0.9, y1: 2.2, fundo: true }, { y0: 4.3, y1: 5.6, fundo: false }];
var ZC = H + 0.55;           // altura das calhas
var XF = X0 + N * (LARG + VAO) + 0.3; // fim das calhas / cross-connect
var SEU = { fila: 1, i: 3 }; // "seu rack"

// LEDs: tempos pseudoaleatórios estáveis (o HTML gerado é sempre igual)
var semente = 7;
function rnd() { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; }

var out = [];
out.push('<svg class="hv-cena" viewBox="__VB__" role="img" aria-label="Ilustração animada de um datacenter: duas fileiras de racks com luzes acesas, calhas de fibra levando pulsos de dados, ar frio subindo pelo corredor e o seu rack destacado em laranja." focusable="false">');
out.push('<defs>' +
  '<linearGradient id="hv-g-piso" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A1817"/><stop offset="1" stop-color="#0D0C0C"/></linearGradient>' +
  '<linearGradient id="hv-g-frente" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2826"/><stop offset="1" stop-color="#1A1817"/></linearGradient>' +
  '<linearGradient id="hv-g-lado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141312"/><stop offset="1" stop-color="#0B0A0A"/></linearGradient>' +
  '<radialGradient id="hv-g-brilho"><stop offset="0" stop-color="#F9681C" stop-opacity=".55"/><stop offset="1" stop-color="#F9681C" stop-opacity="0"/></radialGradient>' +
  '</defs>');

// piso + grade
out.push('<g class="hv-chao">');
out.push('<polygon class="hv-piso" points="' + poli([[0, 0, 0], [PISO.x, 0, 0], [PISO.x, PISO.y, 0], [0, PISO.y, 0]]) + '"/>');
var grade = '';
for (var gx = 1; gx < PISO.x; gx++) grade += linha([gx, 0, 0], [gx, PISO.y, 0]);
for (var gy = 1; gy < PISO.y; gy++) grade += linha([0, gy, 0], [PISO.x, gy, 0]);
// (grade do piso removida a pedido: fundo limpo)
out.push('<path class="hv-borda d" pathLength="1" d="' + caminho([[0, PISO.y, 0], [PISO.x, PISO.y, 0], [PISO.x, 0, 0]]) + '"/>');
// corredor frio: ladrilhos perfurados entre as fileiras
var yA = FILAS[0].y1 + 0.35, yB = FILAS[1].y0 - 0.35;
for (var t = 0; t < N; t++) {
  var tx0 = X0 + t * (LARG + VAO), tx1 = tx0 + LARG;
  out.push('<polygon class="hv-ladrilho" points="' + poli([[tx0, yA, 0], [tx1, yA, 0], [tx1, yB, 0], [tx0, yB, 0]]) + '"/>');
}
out.push('</g>');

function rack(fila, i, ordem) {
  var x0 = X0 + i * (LARG + VAO), x1 = x0 + LARG, y0 = fila.y0, y1 = fila.y1;
  var seu = (fila === FILAS[SEU.fila] && i === SEU.i);
  var g = ['<g class="hv-rack' + (fila.fundo ? ' hv-rack--fundo' : '') + (seu ? ' hv-rack--seu' : '') + '" style="--i:' + ordem + '">'];
  g.push('<polygon class="hv-sombra" points="' + poli([[x0 + .1, y0 + .1, 0], [x1 + .25, y0 + .1, 0], [x1 + .25, y1 + .25, 0], [x0 + .1, y1 + .25, 0]]) + '"/>');
  g.push('<polygon class="hv-lado" points="' + poli([[x1, y0, 0], [x1, y1, 0], [x1, y1, H], [x1, y0, H]]) + '"/>');
  g.push('<polygon class="hv-frente" points="' + poli([[x0, y1, 0], [x1, y1, 0], [x1, y1, H], [x0, y1, H]]) + '"/>');
  g.push('<polygon class="hv-topo" points="' + poli([[x0, y0, H], [x1, y0, H], [x1, y1, H], [x0, y1, H]]) + '"/>');
  var unidades = 8, d = '', gav = '', leds = '';
  for (var k = 0; k < unidades; k++) {
    var z = 0.22 + k * 0.35;
    if (k) d += linha([x0 + .07, y1, z - .03], [x1 - .07, y1, z - .03]);
    gav += '<polygon class="hv-gaveta" points="' + poli([[x0 + .12, y1, z + .06], [x0 + .62, y1, z + .06], [x0 + .62, y1, z + .22], [x0 + .12, y1, z + .22]]) + '"/>';
    var p = P(x1 - .17, y1, z + .14);
    var branco = rnd() < .22;
    leds += '<circle class="hv-led' + (branco ? ' hv-led--b' : '') + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.3" style="--t:' + (1.4 + rnd() * 2.6).toFixed(2) + 's;--d:' + (rnd() * 2).toFixed(2) + 's"/>';
  }
  g.push('<path class="hv-u" d="' + d + '"/>', gav, leds);
  if (seu) g.push('<polygon class="hv-contorno" points="' + poli([[x0, y1, 0], [x1, y1, 0], [x1, y1, H], [x0, y1, H]]) + '"/>');
  g.push('</g>');
  return g.join('');
}

function calha(fila) {
  var yc = (fila.y0 + fila.y1) / 2, s = '<g class="hv-calha">';
  s += '<polygon class="hv-calha-f" points="' + poli([[X0 - .3, yc - .24, ZC], [XF, yc - .24, ZC], [XF, yc + .24, ZC], [X0 - .3, yc + .24, ZC]]) + '"/>';
  var desc = '';
  for (var i = 0; i < N; i++) { var xc = X0 + i * (LARG + VAO) + LARG / 2; desc += linha([xc, yc, ZC], [xc, yc, H]); }
  s += '<path class="hv-desce" d="' + desc + '"/></g>';
  return s;
}

// fileira do fundo, calha do fundo, ar no corredor, fileira da frente, calha da frente
var ordem = 0;
FILAS.forEach(function (fila, f) {
  if (f === 1) {
    // ar frio subindo dos ladrilhos (desenhado antes da fileira da frente, que passa na frente dele)
    out.push('<g class="hv-ares">');
    for (var a = 0; a < 10; a++) {
      var ax = X0 + .4 + a * 0.72, ay = yA + .25 + (a % 2) * .6;
      out.push('<path class="hv-ar" style="--d:' + (a * .37).toFixed(2) + 's;--t:' + (2.6 + (a % 3) * .5).toFixed(1) + 's" d="' + linha([ax, ay, .12], [ax, ay, .62]) + '"/>');
    }
    out.push('</g>');
  }
  for (var i = 0; i < N; i++) out.push(rack(fila, i, ordem++));
  out.push(calha(fila));
});

// rede: fibras (base fraca) e pulsos que correm por elas
var ycF = (FILAS[0].y0 + FILAS[0].y1) / 2, ycT = (FILAS[1].y0 + FILAS[1].y1) / 2;
var R = [XF, ycF, H + 2.35];
var xSeu = X0 + SEU.i * (LARG + VAO) + LARG / 2;
var rotas = [
  [R, [XF, ycF, ZC], [X0 - .3, ycF, ZC]],
  [R, [XF, ycF, ZC], [XF, ycT, ZC], [xSeu, ycT, ZC], [xSeu, ycT, H]],
  [[X0 - .3, ycT, ZC], [XF, ycT, ZC], [XF, ycF, ZC], R]
];
out.push('<g class="hv-rede">');
out.push('<path class="hv-fibra d" pathLength="1" d="' + caminho([R, [XF, ycF, ZC], [XF, ycT, ZC]]) + '" style="--d:.9s"/>');
out.push('<path class="hv-fibra d" pathLength="1" d="' + caminho([[XF, ycF, ZC], [X0 - .3, ycF, ZC]]) + '" style="--d:1.05s"/>');
out.push('<path class="hv-fibra d" pathLength="1" d="' + caminho([[XF, ycT, ZC], [X0 - .3, ycT, ZC]]) + '" style="--d:1.15s"/>');
rotas.forEach(function (r, n) {
  out.push('<path class="hv-pulso" pathLength="1" d="' + caminho(r) + '" style="--d:' + (1.8 + n * 1.1).toFixed(1) + 's;--t:' + (3.2 + n * .4).toFixed(1) + 's"/>');
});
var pR = P(R[0], R[1], R[2]);
out.push('<circle class="hv-no-brilho" cx="' + pR[0].toFixed(1) + '" cy="' + pR[1].toFixed(1) + '" r="30" fill="url(#hv-g-brilho)"/>');
out.push('<circle class="hv-no-anel" cx="' + pR[0].toFixed(1) + '" cy="' + pR[1].toFixed(1) + '" r="11"/>');
out.push('<circle class="hv-no" cx="' + pR[0].toFixed(1) + '" cy="' + pR[1].toFixed(1) + '" r="5.5"/>');
out.push('<text class="hv-rotulo" x="' + (pR[0] + 18).toFixed(1) + '" y="' + (pR[1] + 4).toFixed(1) + '">backbone</text>');
out.push('</g></svg>');

// viewBox justo com folga
var minX = Math.min.apply(null, todos.map(function (p) { return p[0]; })) - 24;
var maxX = Math.max.apply(null, todos.map(function (p) { return p[0]; })) + 110;
var minY = Math.min.apply(null, todos.map(function (p) { return p[1]; })) - 40;
var maxY = Math.max.apply(null, todos.map(function (p) { return p[1]; })) + 24;
var vb = [minX, minY, maxX - minX, maxY - minY].map(function (n) { return n.toFixed(1); }).join(' ');
var svg = out.join('\n').replace('__VB__', vb);

// âncora da anotação manuscrita: canto de cima da frente do "seu rack", em % do viewBox
var xs0 = X0 + SEU.i * (LARG + VAO);
var ancora = P(xs0 + LARG * .2, FILAS[1].y1, H);
var ax = ((ancora[0] - minX) / (maxX - minX) * 100).toFixed(1), ay = ((ancora[1] - minY) / (maxY - minY) * 100).toFixed(1);

var arquivo = path.join(__dirname, '..', 'index.html');
var html = fs.readFileSync(arquivo, 'utf8');
if (html.indexOf('<!-- hero-cena:inicio -->') < 0) throw new Error('Marcadores hero-cena não encontrados');
html = html.replace(/<!-- hero-cena:inicio -->[\s\S]*?<!-- hero-cena:fim -->/, function () { return '<!-- hero-cena:inicio -->\n' + svg + '\n<!-- hero-cena:fim -->'; });
html = html.replace(/(<p class="hv-nota"[^>]*style=")[^"]*(")/, function (m, a, b) { return a + '--ax:' + ax + '%;--ay:' + ay + '%' + b; });
fs.writeFileSync(arquivo, html);
console.log('viewBox', vb, '| âncora do "seu rack":', ax + '%', ay + '%', '| proporção', ((maxX - minX) / (maxY - minY)).toFixed(3));
