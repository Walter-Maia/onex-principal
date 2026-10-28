// Reescreve os links do WhatsApp a partir de tools/whatsapp.json (fonte única das mensagens).
// Cada link é um <a ... data-ref="X" href="https://wa.me/..."> e recebe ?text= com a mensagem do ref X.
// Uso: node tools/aplicar-whatsapp.js   (Node 14+). Idempotente; avisa sobre refs sem mensagem.
'use strict';
var fs = require('fs');
var path = require('path');
var raiz = path.join(__dirname, '..');
var tabela = JSON.parse(fs.readFileSync(path.join(__dirname, 'whatsapp.json'), 'utf8'));
var paginas = ['index.html', 'obrigado-visita/index.html', 'obrigado-proposta/index.html'];
var faltando = {};

paginas.forEach(function (rel) {
  var arquivo = path.join(raiz, rel);
  if (!fs.existsSync(arquivo)) return;
  var html = fs.readFileSync(arquivo, 'utf8');
  var n = 0;
  html = html.replace(/<a\b[^>]*>/g, function (tag) {
    if (!/href="https:\/\/wa\.me\//.test(tag)) return tag;
    var ref = (tag.match(/data-ref="([^"]+)"/) || [])[1];
    if (!ref) { faltando['(sem data-ref) ' + rel] = 1; return tag; }
    var msg = tabela.mensagens[ref];
    if (!msg) { faltando[ref] = 1; return tag; }
    n++;
    var url = 'https://wa.me/' + tabela.numero + '?text=' + encodeURIComponent(msg);
    return tag.replace(/href="https:\/\/wa\.me\/[^"]*"/, 'href="' + url + '"');
  });
  fs.writeFileSync(arquivo, html);
  console.log(rel + ': ' + n + ' links do WhatsApp atualizados');
});
var f = Object.keys(faltando);
if (f.length) { console.error('Sem mensagem na tabela: ' + f.join(', ')); process.exitCode = 1; }
