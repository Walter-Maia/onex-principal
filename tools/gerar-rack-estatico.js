// Grava no index.html o quadro estático dos racks em ASCII (visto sem JS, com movimento reduzido e com ?fx=0).
// Uso: node tools/gerar-rack-estatico.js   (Node 14+). Idempotente: substitui o trecho entre os marcadores.
'use strict';
var fs = require('fs');
var path = require('path');
var rack = require(path.join(__dirname, '..', 'assets', 'js', 'rack.js'));
var arquivo = path.join(__dirname, '..', 'index.html');
var html = fs.readFileSync(arquivo, 'utf8');
var quadro = rack.quadro(rack.novoEstado());
var novo = html.replace(/<!-- rack:inicio -->[\s\S]*?<!-- rack:fim -->/, function () { return '<!-- rack:inicio -->' + quadro + '<!-- rack:fim -->'; });
if (novo === html && html.indexOf('<!-- rack:inicio -->') < 0) throw new Error('Marcadores do rack não encontrados');
fs.writeFileSync(arquivo, novo);
var texto = quadro.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').split('\n');
console.log(texto.length + ' linhas; larguras: ' + Array.from(new Set(texto.map(function (l) { return l.length; }))).join(', '));
console.log(texto.join('\n'));
