// Gera o JSON-LD FAQPage a partir das perguntas visíveis no index.html (fonte única).
// Uso: node tools/gerar-faq-jsonld.js   (Node 14+). Idempotente: substitui o bloco entre os marcadores.
'use strict';
var fs = require('fs');
var path = require('path');
var arquivo = path.join(__dirname, '..', 'index.html');
var html = fs.readFileSync(arquivo, 'utf8');

function limpar(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
var lista = html.split('data-faq>')[1];
if (!lista) throw new Error('Lista do FAQ (data-faq) não encontrada');
lista = lista.split('</section>')[0];
var re = /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="faq__resp">([\s\S]*?)<\/div>\s*<\/details>/g;
var itens = [], m;
while ((m = re.exec(lista))) {
  itens.push({ '@type': 'Question', name: limpar(m[1]), acceptedAnswer: { '@type': 'Answer', text: limpar(m[2]) } });
}
if (!itens.length) throw new Error('Nenhuma pergunta encontrada');
var json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', '@id': 'https://onexdc.com.br/#faq', mainEntity: itens }, null, 2);
var bloco = '<!-- faq-jsonld:inicio -->\n<script type="application/ld+json">\n' + json + '\n</script>\n<!-- faq-jsonld:fim -->';
var novo = html.replace(/<!-- faq-jsonld:inicio -->[\s\S]*?<!-- faq-jsonld:fim -->/, bloco);
fs.writeFileSync(arquivo, novo);
console.log('FAQPage com ' + itens.length + ' perguntas gravado em index.html');
