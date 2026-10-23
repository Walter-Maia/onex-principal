# OneX Data Centers — site principal

Nova home de https://onexdc.com.br/ em HTML, CSS e JS puros (sem build, sem bibliotecas). Abra `index.html` direto no navegador ou sirva a pasta em qualquer servidor estático.

## Parâmetros de teste

| URL | Efeito |
|---|---|
| `index.html` | intro 1x por sessão do navegador |
| `?intro=1` | força a intro (para revisar) |
| `?intro=0` | pula a intro |
| `?fx=0` | composição estática: sem intro e sem animações (a cena da hero aparece montada e parada) |

Movimento reduzido no sistema = mesma composição estática do `?fx=0`. Sem JavaScript, todo o conteúdo aparece e a cena da hero fica montada (é SVG no próprio HTML).

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | conteúdo, SVGs das cenas, SEO (meta, Open Graph, JSON-LD) |
| `assets/css/onex.css` | tokens da marca, layout, cenas vetoriais e roteiro da intro (comentado) |
| `assets/js/intro.js` | intro "power on" (infraestrutura da skill `efeito-de-intro`) |
| `assets/js/onex.js` | também controla a hero: botão de pausa, pausa fora da tela/aba oculta e parallax leve pelo cursor |
| `assets/js/onex.js` | cabeçalho, menu, revelações, cenas, abas de soluções, relógio da terça-feira |
| `assets/js/rack.js` | racks de servidores em ASCII da seção Sobre (também roda no Node para gerar o quadro estático) |
| `assets/img/` | logos oficiais, foto do depoimento (baixada do site atual), imagens ilustrativas geradas no Higgsfield, OG |
| `tools/gerar-hero-datacenter.js` | gera a cena isométrica da hero (geometria calculada, não desenhada à mão) e grava no HTML; rode depois de mexer nela |
| `tools/gerar-faq-jsonld.js` | gera o JSON-LD `FAQPage` a partir das perguntas visíveis (rode depois de editar o FAQ) |
| `tools/gerar-rack-estatico.js` | grava no HTML o quadro parado dos racks (sem JS, movimento reduzido, `?fx=0`); rode depois de mexer em `rack.js` |
| `robots.txt`, `sitemap.xml`, `llms.txt` | SEO e resumo para assistentes de IA (AEO) |
| `qa/` | planos de QA e capturas (não precisa subir para o servidor) |

## Identidade (extraída do site atual)

Laranja `#F9681C` · navy `#000B41` · ardósia `#464F7A` · branco `#FFFFFE`.

**Tipografia igual à da página OnexCloud** (onexdc.com.br/OnexCloud): **Manrope** em tudo — títulos 900 com -0,03 em e entrelinha ~1,05, subtítulos 800, menu 700, botões 800, texto 500/600 — e **Caveat** (manuscrita) só na anotação "seu servidor mora aqui" da hero. JetBrains Mono fica apenas no terminal da intro e nos racks em ASCII. Logo oficial em WebP (não redesenhado). O X da intro usa polígonos **medidos no alfa do PNG oficial** e termina com o PNG oficial por cima.

## Intro — roteiro (2,75 s + 0,5 s de dissolução)

| t (s) | Peça | Técnica |
|---|---|---|
| 0,00 + n·0,22 | três linhas de boot digitadas (`power --on`, `[ ok ] energia redundante`, `[ ok ] link · climatização · racks`) | texto em steps |
| 0,20 + n·0,12 | contorno das três peças do X | traço que se desenha (`pathLength=1`) |
| 0,95 + n·0,06 | peças acendem em laranja | contorno → preenchimento |
| 1,12–1,67 | faixa de luz varre o X (LED de rack) | recorte pelo próprio X |
| 1,30 + n·0,08 | letras oficiais o-n-e sobem | stagger |
| 1,55 | X oficial (PNG) por cima do vetor | troca para a arte oficial |
| 1,85–2,27 | "data center" digitado | clip em steps |
| 2,75 | overlay dissolve com zoom de 1,04 e os racks da hero sobem em sequência | dissolução |

Cabeçalho e textos da hero entram a partir de `--rise-start: 2,95 s`. Pular: Escape, Tab, Enter, roda, toque, clique, rolagem; aba oculta libera; failsafe CSS em 4,8 s.

## Hero — datacenter isométrico animado

Texto à esquerda e, à direita, uma cena isométrica em SVG: piso com grade técnica, duas fileiras de 6 racks, corredor frio com ladrilhos perfurados, calhas de fibra sobre os racks e um ponto de backbone. "Seu rack" tem contorno laranja e a anotação manuscrita "seu servidor mora aqui". Cartões de vidro por cima: **Operacional** (Ipatinga · BH, com linha de status), **Engenheiro na linha** (24/7 · na 1ª ligação) e **Energia redundante** (geradores + UPS).

- **Entrada** (a partir de `--rise-start`): piso aparece, racks sobem um a um (55 ms entre eles), fibras se desenham, cartões e anotação entram.
- **Ciclos**: LEDs piscam em ritmos diferentes, pulsos de dados correm pelas fibras (backbone → fileira do fundo, backbone → seu rack, fileira da frente → backbone), ar frio sobe do corredor, o backbone emite um anel.
- **Controle**: pausa sozinha fora da tela e com a aba oculta; parallax leve da cena e dos cartões pelo cursor (só ponteiro fino). **Decisão (pedido do cliente):** o botão de pausar foi retirado. Pela WCAG 2.2.2, movimento automático com mais de 5 s ao lado de conteúdo pede um jeito de pausar; sem o botão, quem não ativou "reduzir movimento" no sistema não tem como parar os ciclos enquanto está no topo. Não reintroduzir sem pedido.
- Medido no Edge headless: **60 quadros por segundo** estáveis em 1440 e 390 px, nenhum quadro acima de 50 ms (`qa/plano-fps.js`).

## Animações vetoriais

- **Por que a OneX** (3 cenas): porta do datacenter se abre para o seu rack · ligação vai direto ao engenheiro e a nota da "música de espera" é riscada · cinco serviços se ligam ao X e viram "1 contrato · 1 nota fiscal".
- **Soluções** (9 cenas, uma por aba): servidor entra no rack com energia A/B e ar frio · vizinhos somem e CPU/memória/disco vão a 100% · terminal da VPS digitando · camadas da virtualização se empilham · arquivos entram na nuvem com pino em MG · site se monta e liga ao pino de MG · e-mail passa pelo escudo e o spam ricocheteia · voz viaja e o PABX distribui ramais · cópias diárias se empilham e restauram.
- **Terça-feira às 14h**: no desktop a cena fica fixa e a rolagem gira o relógio (14:00 → 16:30); a coluna da OneX termina nos primeiros segundos, a do provedor gigante vai se arrastando. No celular a sequência toca ao entrar na tela.
- **Sobre**: dois racks em ASCII (Ipatinga e Belo Horizonte, 64 colunas que se ajustam à largura) — ligam linha a linha ao aparecer; LEDs piscam, barras de uso oscilam, ventoinhas giram, o tráfego anda no switch, o UPS pulsa e uma faixa de luz percorre os racks (no desktop segue o cursor); "seu servidor" fica em laranja. Texto num `<pre>` a ~8 quadros/s, pausado fora da tela. Por cima, a rota Belo Horizonte ↔ Ipatinga. **Contato**: as três peças do X se montam.

As cenas tocam ao entrar na tela e rearmam ao sair (tocam de novo ao voltar). O quadro final é a composição estática.

## Imagens geradas no Higgsfield

Fibra óptica, frente de rack, climatização e sala de energia (mosaico "O que tem do outro lado da porta"). Essas fotos **não são do datacenter da OneX**: a página diz "Imagens ilustrativas. Para ver a estrutura real, agende uma visita." Troque por fotos reais quando houver.

## Pendências a confirmar com a OneX

- Uptime: a home atual diz 99,9%; as páginas de produto dizem 99,99% em SLA. Usei 99,9%.
- Endereços completos dos dois datacenters (para `PostalAddress` e Google Business).
- Preço da VPS Linux, do e-mail e da OnexCloud (no site atual aparecem só especificações).
- Canonical: `https://onexdc.com.br/` assume que esta página substitui a home atual.

## Verificado

Edge headless via DevTools Protocol, com o harness `qa/cdp.js` (Node 14+, sem dependências; precisa do Microsoft Edge instalado). Rode da pasta do projeto: `node qa/cdp.js qa/plano-hero.js` (troque pelo plano desejado; as capturas vão para `qa/capturas/`). Verificado: hero e intro quadro a quadro em 1440 e 390 px, as 13 cenas no meio e no fim, troca das 9 abas (altura estável de 711 px no desktop), terça-feira em 0/30/65/100% da rolagem, página inteira em 1440 e 390 sem estouro lateral, menu do celular, movimento reduzido (sem intro, composição final) e `?fx=0`, console sem erros, larguras 320/390/820/1024/1440/1920 sem estouro lateral.

Hero isométrica: entrada em quadros, 320/390/1024/1440 px, `?fx=0` e fluidez (`qa/plano-hero.js`, `qa/plano-fps.js`).

**Não verificado**: Safari/iOS, Firefox e celular físico.
