# ONEX Data Centers — landing de infraestrutura

Reformulação do `index.html` segundo a **Especificação de Desenvolvimento — Novo Site ONEX Data Centers** (28/10/2026). HTML, CSS e JS puros (sem build, sem bibliotecas). Abra `index.html` direto no navegador ou sirva a pasta em qualquer servidor estático.

O `index.html` é a **landing de infraestrutura** do PDF (rota `/infraestrutura`, P1): as 14 seções do wireframe + rodapé. As notas do wireframe ("encurtar 50%", "sem lista e sem assinatura", "sai a arte ASCII") são mudanças sobre esta página. Por isso o canonical já aponta para `https://onexdc.com.br/infraestrutura`. A home institucional (`/`, copy H1–H10 do documento-mãe) ainda não existe; **no lançamento este arquivo vai para `/infraestrutura/`** e a home ocupa a raiz.

## Páginas deste repositório

| Página | Arquivo | Prioridade | Situação |
|---|---|---|---|
| Landing de infraestrutura | `index.html` | P1 | Pronta, com placeholders das pendências |
| Obrigado — visita | `obrigado-visita/index.html` | P1 | Pronta (guarda de sessão + `generate_lead`) |
| Obrigado — proposta | `obrigado-proposta/index.html` | P1 | Pronta (guarda de sessão + `generate_lead`) |
| Política de Privacidade / Termos | `privacidade/`, `termos/` | P1 | Estrutura pronta; texto do jurídico pendente |
| Home institucional | — | P1 | Falta a copy do documento-mãe |
| Presença digital, Telefonia, Obrigado — isca, Calculadora, Checklist | — | P2/P3 | Fora desta entrega |

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | landing, SVGs dos produtos, SEO (meta, Open Graph, JSON-LD), modais e barra fixa |
| `assets/css/onex.css` | design system (tokens no `:root`) e todos os componentes; mobile-first |
| `assets/js/inicio.js` | roda no `<head>` antes de tudo: **configuração do site**, Consent Mode v2, GTM, origem da campanha (`utm_*`/`gclid`), classes `js`/`fx` |
| `assets/js/onex.js` | comportamento: menu, modal, barra fixa, abas/acordeão, diagnóstico, relógio, contadores, vídeo, formulários, banner de cookies e eventos do `dataLayer` |
| `assets/fonts/` | Manrope 400/600/700/800 e JetBrains Mono 500 (subconjunto latino, licença OFL), servidas localmente |
| `assets/onex.vcf` | cartão de contato (evento `save_contact`) |
| `tools/whatsapp.json` + `tools/aplicar-whatsapp.js` | tabela de mensagens do WhatsApp (uma por `ref`) e o script que reescreve os links |
| `tools/gerar-faq-jsonld.js` | gera o JSON-LD `FAQPage` a partir do FAQ exibido |
| `qa/cdp.js` + `qa/plano-landing.js` | QA no Edge headless (capturas em `qa/capturas/v2/`) |

## Design system (p. 8–11 do PDF)

- **Cores**: `--onex-laranja #F87B1C` (só fundo de botão primário e detalhes; nunca texto sobre branco), `--onex-preto #1D1D1B`, `--onex-creme #F5EEE2`, `--onex-cinza #C6C6C6`, `--onex-branco`. Os tons de apoio são `color-mix` dessas cinco (contraste conferido: texto suave 6,7:1 no creme, 9,7:1 no preto; borda de campo ≥ 3:1). Nenhuma cor, fonte ou espaçamento solto fora do `:root`.
- **Tipografia**: Manrope local com `font-display: swap` e `preload` do 800 (H1). H1 56/64 → 32/40, H2 40/48 → 28/36, H3 22/30 → 20/28, corpo 18/30 → 16/26, eyebrow 13 → 12 px em maiúsculas com 0,08 em. **Caveat removida**; Google Fonts não é mais carregado.
- **Espaço e grid**: escala 4–128; 96 px entre seções no desktop e 64 no celular; container de 1200 px, 12 colunas, gutter 24; texto até 680 px.
- **Breakpoints**: sm 360–767 (1 coluna, abas viram acordeão, fotos viram carrossel, barra fixa), md 768–1023 (barra fixa), lg ≥ 1024 (CTA fixo no menu, barra fixa desligada), xl ≥ 1440 (container travado).
- **Componentes**: botão primário/secundário/link (56 px no desktop, 48 no celular, primário em largura total no celular, no máximo um por seção), card (raio 16, borda cinza, sem sombra), barra de prova 4 × 1 / 2 × 2 com contador que anima uma vez, acordeão com `button` + `aria-expanded`, abas com `role="tablist"` e setas, barra fixa, modal (`<dialog>`: foco preso, Esc, devolve o foco).
- **Movimento**: 200–400 ms, `ease-out`, só `opacity` e `transform`; entradas de seção uma vez; nada pisca. Saíram a intro "power on", a cena isométrica animada, os racks em ASCII e as animações contínuas. `prefers-reduced-motion` mostra a composição final.

## As 14 seções

| # | Seção | Fundo | CTA principal | `data-secao` |
|---|---|---|---|---|
| 1 | Navegação fixa (sólida após 80 px) | — | (31) 4040-4888 | `1-menu` |
| 2 | Hero: promessa + prova na 1ª dobra | preto | Ligar para engenheiro (celular) / Falar com engenheiro (desktop, abre o modal) | `2-hero` |
| 3 | Carta de abertura: dor em 3 frases | branco | — | — |
| 4 | Teste da terça, 14h: massa × ONEX, relógio 14:00 → 16:30 uma vez | creme | Quero esse atendimento (tel) | `4-teste` |
| 5 | Três diferenciais, cada card com o próprio link | branco | Agendar visita · Ligar agora · Ver soluções | `5-diferenciais` |
| 6 | Diagnóstico: 4 frases, a 1ª já marcada | creme | WhatsApp com a mensagem do caso | `6-diag-1` … `6-diag-4` |
| 7 | Soluções: 9 produtos, abas/acordeão, `?produto=` | branco | Pedir proposta (abre o formulário de proposta); OneXcloud leva ao site próprio | `7-solucoes` |
| 8 | A prova: vídeo de 60 s (fachada) + 4 fotos reais | preto | — | — |
| 9 | Clientes: logos + 3 depoimentos + case antes/depois | branco | — | — |
| 10 | Preço e garantia: ancoragem + 3 faixas + reversão de risco | creme | Quero diagnóstico e visita | `10-preco` |
| 11 | Quem somos: texto curto + foto da equipe | branco | — | — |
| 12 | FAQ em acordeão (sem citar concorrentes) + JSON-LD | branco | — | — |
| 13 | Fechamento + P.S. | preto | Agendar visita · (31) 4040-4888 · WhatsApp | `13-fechamento` |
| 14 | Formulário de visita `#agendar-visita` | creme | Agendar minha visita | `14-formulario` |

## Configuração antes de publicar (`assets/js/inicio.js`)

```js
gtm: 'GTM-XXXXXXX',   // ID real do container (com X o GTM não carrega)
endpoint: '',         // URL do endpoint no servidor que grava no CRM
versaoConsentimento: '2026-10-28'
```

**Vídeo do tour**: na seção 8 (e nas páginas de obrigado) preencher `data-mp4` + `data-legendas` (arquivo `.vtt`, obrigatório — sem ele o player não é liberado) ou `data-youtube` (ID; abre com legendas ativadas).

**Mensagens do WhatsApp**: editar `tools/whatsapp.json` com a tabela do documento-mãe e rodar `node tools/aplicar-whatsapp.js`. **FAQ**: depois de editar as perguntas, rodar `node tools/gerar-faq-jsonld.js`.

## Medição

Tudo passa por um único container do GTM; o site só envia eventos para o `dataLayer`, **sem dados pessoais**.

- **Consent Mode v2**: `ad_storage`, `analytics_storage`, `ad_user_data` e `ad_personalization` negados por padrão no `<head>`, antes do GTM. O banner (Aceitar / Recusar / Personalizar: análise e marketing) grava a escolha, envia `gtag('consent','update')` e o evento `consentimento_atualizado` (`consentimento_analise`, `consentimento_marketing`). "Preferências de cookies" no rodapé reabre o banner.
- **Origem da campanha**: `utm_*` e `gclid` da primeira página da sessão ficam em `sessionStorage` e vão nos campos ocultos dos formulários, com `pagina` e `secao`.
- **Cliques**: todo CTA tem `data-cta` (`tel`, `whatsapp`, `cta`, `vcard`), `data-secao`, `data-ref` (WhatsApp) ou `data-destino`; `data-pagina` é carimbado a partir do `<body>`. **Decisão:** um único ouvinte no site converte o clique no evento da tabela e envia ao `dataLayer`. No GTM, crie só **gatilhos de Evento personalizado** — não crie gatilho de clique, senão os cliques contam em dobro.
- **CTA de ligação no desktop**: abre o modal e envia `click_cta` com `destino: modal-contato`; `click_tel` só sai quando a pessoa escolhe "Ligar" no modal ou toca no link no celular.

| Evento | Quando | Parâmetros | Conversão no GA4 |
|---|---|---|---|
| `click_tel` | link `tel:` no celular ou "Ligar" do modal | secao, pagina | Sim |
| `click_whatsapp` | link do WhatsApp | secao, pagina, ref | Sim |
| `click_cta` | demais CTAs | secao, pagina, destino | Não |
| `diagnostico_opcao` | troca de opção no diagnóstico | opcao (1–4) | Não |
| `scroll` | 50% e 90% da página | percent, pagina | Não (desligar o scroll da medição otimizada do GA4) |
| `video_play` | play no tour | pagina | Não |
| `save_contact` | download do vCard | pagina | Não |
| `generate_lead` | carregamento da página de obrigado | tipo, secao, pagina, produto, unidade | Sim |

No GTM: GA4 com consentimento de análise; Meta Pixel (`Lead` em `generate_lead`, `Contact` em `click_tel`/`click_whatsapp`), Google Ads (primária `generate_lead`, secundárias `click_tel`/`click_whatsapp`) e Clarity com consentimento de marketing (Clarity só com mídia ativa).

## Formulários

O GitHub Pages só serve arquivos estáticos: os formulários precisam de um **endpoint no servidor** (função serverless ou backend da ONEX) entre o site e o CRM. **Nenhuma chave de CRM, e-mail ou WhatsApp no navegador** — só no endpoint, em variável de ambiente.

O site envia `POST` JSON para `endpoint`:

```json
{ "tipo": "visita", "nome": "…", "empresa": "…", "whatsapp": "31987654321", "unidade": "ipatinga",
  "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_term": "", "utm_content": "", "gclid": "",
  "pagina": "infraestrutura", "secao": "14-formulario", "site": "",
  "consentimento": { "versao": "2026-10-28", "texto": "Ao enviar…", "data_hora": "2026-10-28T17:00:00.000Z", "pagina": "/infraestrutura" } }
```

Proposta troca `unidade` por `produto`. Resposta 2xx → página de obrigado com `?s=<id>`; qualquer erro ou 15 s sem resposta → mensagem de falha com o telefone. O endpoint deve repetir a validação, recusar se `site` (honeypot) vier preenchido, limitar envios por IP, gravar o consentimento junto com o lead e avisar o comercial em menos de 1 minuto. Se o spam persistir: Cloudflare Turnstile.

Validação no navegador: ao sair do campo, e o erro some assim que o valor fica correto (nunca a cada tecla); WhatsApp com máscara (00) 00000-0000 e 10 ou 11 dígitos; rótulos sempre visíveis; campos com 16 px. **A microcopy de erro, carregamento e falha é provisória** (objeto `MSG` em `onex.js`) até chegar a do documento-mãe.

As páginas de obrigado só abrem logo depois de um envio (sem o parâmetro de sessão voltam para a página inicial), têm `noindex, nofollow`, ficam fora do sitemap e do menu e disparam `generate_lead` uma vez.

## SEO, performance e acessibilidade

- Um `<h1>` por página, H2/H3 na ordem do wireframe; `lang="pt-BR"`; canonical absoluto; Open Graph e Twitter Card 1200 × 630.
- JSON-LD: `Organization`, dois `LocalBusiness` (Ipatinga e BH, com telefone), `WebPage`, `BreadcrumbList` e `FAQPage` gerado do FAQ exibido. Marca padronizada como **ONEX** e **OneXcloud**.
- **Staging com `noindex, nofollow` em todas as páginas.** No dia do lançamento: trocar para `index, follow` (exceto obrigado) e mover a landing para `/infraestrutura/`.
- Primeira carga ≈ 290 KB sem compressão (≈ 170 KB com gzip), sem imagens pesadas por enquanto. Quando as fotos reais chegarem: WebP/AVIF com `srcset`, `width`/`height`, `loading="lazy"` abaixo da dobra e `fetchpriority="high"` na do hero (o HTML tem o modelo comentado).
- Foco visível de 2 px, alvos de toque ≥ 48 px, ícones decorativos com `aria-hidden`, abas e acordeões com os papéis ARIA, modal com foco preso.

## Pendências de conteúdo (ficam visíveis entre colchetes e bloqueiam o lançamento)

| Pendência (tabela do PDF) | Onde está o placeholder | Responsável |
|---|---|---|
| Plantão 24/7 e tempo médio de atendimento | modal (`[tempo médio]`), P.S. marcado como pendente | Operação (Kayo) |
| SLA, autonomia do gerador, operadoras, certificação | barra de prova (`[X]%`), fotos da prova (`[X] horas`, `[operadoras]`), FAQ (autonomia e certificação) | Operação (Kayo) |
| Número de clientes e anos de operação | barra de prova (`[N]`, `[N] anos`) | Comercial |
| Fotos reais dos dois data centers e da equipe | hero, 4 fotos da prova, quem somos | Marketing |
| Vídeo de 60 s do tour (com legendas) | seção 8 e páginas de obrigado | Marketing |
| 3 depoimentos, logos e 1 case, com autorização | seção 9 (o depoimento do Guilherme Cruz é o do site atual; falta a autorização por escrito) | Comercial + Marketing |
| Política de Privacidade e Termos | `privacidade/`, `termos/` | Jurídico |
| CRM e credenciais da integração | `endpoint` em `inicio.js` | Comercial + DEV |
| Preços "a partir de" | abas de colocation, dedicados, VPS, virtualização, OneXcloud, e-mail e backup | Comercial |
| Prazo de retorno de visita, proposta e WhatsApp | seção 14, modais e páginas de obrigado | Comercial |
| PDF do checklist (isca 2) | páginas de obrigado | Marketing (P3) |

**Copy**: a regra do PDF é que nenhum texto seja escrito pelo DEV. Sem acesso ao documento-mãe, reaproveitei a copy da versão anterior (encurtando a carta para 3 frases, tirando a pergunta que citava concorrentes e o "99,9% de uptime" não validado) e usei textos funcionais mínimos onde não havia nada (microcopy de formulário, banner de cookies, páginas de obrigado, eyebrows novos). **Tudo precisa ser conferido com o documento-mãe**, assim como título e descrição da página e as mensagens do WhatsApp.

## Redirecionamentos 301 (lista inicial — completar a partir do sitemap atual antes da troca de domínio)

| De | Para |
|---|---|
| `/produtos/onex-data-center/` | `/infraestrutura?produto=colocation#solucoes` |
| `/produtos/servidores-dedicados/` | `/infraestrutura?produto=servidores-dedicados#solucoes` |
| `/produtos/virtualizacao/` | `/infraestrutura?produto=virtualizacao#solucoes` |
| `/produtos/solucoes-em-nuvem/` | `/infraestrutura?produto=onexcloud#solucoes` |
| `/produtos/telefonia-voip/` | `/telefonia` (P2; até lá `/infraestrutura?produto=voip#solucoes`) |
| `/politicas-de-privacidade/` | `/privacidade` |

## QA

`node qa/cdp.js qa/plano-landing.js` (Node 14+, Microsoft Edge instalado). Verifica: H1, CTA e barra de prova na 1ª dobra em 375 × 667; barra fixa depois do hero e escondida com o formulário; sem rolagem horizontal em 360/390/768/1024/1440; menu sólido após 80 px; modal com foco devolvido; diagnóstico; relógio até 16:30; abas e acordeão com `?produto=`; validação, máscara e falha com telefone; guarda e `generate_lead` da página de obrigado; eventos sem dados pessoais; movimento reduzido. Último resultado: **36 de 36**. As capturas de página inteira saem em movimento reduzido (a captura longa do headless reinicia as transições).

**Não verificado**: Safari/iOS, Firefox, celular físico, PageSpeed Insights, DebugView do GA4 (precisa do container) e o envio real ao CRM (precisa do endpoint).
