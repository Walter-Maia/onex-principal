/* ONEX — roda no <head>, antes da primeira pintura e antes de qualquer tag.
   1. Configuração do site (preencher antes do lançamento).
   2. Consent Mode v2: os quatro sinais negados por padrão; a escolha salva é reaplicada.
   3. Google Tag Manager (único container; o site só envia eventos para o dataLayer).
   4. Origem da campanha: utm_* e gclid da primeira visita da sessão, para os campos ocultos dos formulários.
   5. Classes js/fx no <html> (fx = movimento permitido). */
(function () {
  'use strict';
  var cfg = window.ONEX_CONFIG = {
    gtm: 'GTM-XXXXXXX',        // ID do container. Com "X" no lugar do ID o GTM não carrega (staging).
    endpoint: '',              // URL do endpoint no servidor (função serverless ou backend) que grava no CRM.
                               // Sem endpoint o formulário mostra a mensagem de falha com o telefone.
    versaoConsentimento: '2026-10-28',   // muda quando o texto de consentimento mudar (pede de novo)
    tempoLimiteEnvio: 15000
  };

  var d = document.documentElement;
  d.classList.add('js');
  try { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('fx'); } catch (e) {}

  var dl = window.dataLayer = window.dataLayer || [];
  function gtag() { dl.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // Aplica uma escolha (do banner ou salva antes). Análise → GA4; marketing → Ads, Meta, Clarity.
  window.onexAplicarConsentimento = function (c) {
    var mkt = c && c.marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: c && c.analise ? 'granted' : 'denied',
      ad_storage: mkt, ad_user_data: mkt, ad_personalization: mkt
    });
    dl.push({ event: 'consentimento_atualizado', consentimento_analise: !!(c && c.analise), consentimento_marketing: !!(c && c.marketing) });
  };
  try {
    var salvo = JSON.parse(localStorage.getItem('onex-consentimento') || 'null');
    if (salvo && salvo.versao === cfg.versaoConsentimento) window.onexAplicarConsentimento(salvo);
  } catch (e) {}

  if (/^GTM-[A-Z0-9]+$/.test(cfg.gtm) && !/X{4,}/.test(cfg.gtm)) {
    dl.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + cfg.gtm;
    document.head.appendChild(s);
  }

  try {
    if (!sessionStorage.getItem('onex-origem')) {
      var q = new URLSearchParams(location.search), o = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
        var v = q.get(k);
        if (v) o[k] = v.slice(0, 200);
      });
      sessionStorage.setItem('onex-origem', JSON.stringify(o));
    }
  } catch (e) {}
})();
