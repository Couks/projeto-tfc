/**
 * InsightHouse Analytics (reformulado)
 *
 * Principais melhorias:
 * - Fila com flush por timer, por tamanho e por visibilitychange
 * - Fallback para navigator.sendBeacon em beforeunload/fechamento
 * - Retry com backoff e persistência no localStorage (limite configurável)
 * - Captura confiável de sliders: escuta change + slideStop (bootstrapSlider)
 * - Helpers resistentes (null-safe) e logs padronizados
 * - Pequenos guards de performance (Set, debounces leves) e limpeza de timers
 */

(() => {
  // ==========================
  // CONFIG & GLOBALS
  // ==========================
  const MyAnalytics = (window.MyAnalytics = window.MyAnalytics || {});
  MyAnalytics.debug = true;

  const API_URL  = window.IH_API_URL || '';
  const SITE_KEY = window.IH_SITE_KEY || '';

  if (!SITE_KEY) {
    console.error('[InsightHouse] SITE_KEY não configurada');
    return;
  }

  // Envio em lote
  const MAX_QUEUE_SIZE   = 10;
  const FLUSH_INTERVAL   = 3000; // ms
  const FAILED_LIMIT     = 300;  // max eventos persistidos p/ retry
  const BATCH_ENDPOINT   = `${API_URL}/api/events/track/batch`;

  // Chaves de storage
  const LS_FAILED   = 'ih_failed_events';
  const LS_USER     = 'ih_user_id';
  const LS_SESSION  = 'ih_session_id';
  const LS_TIMEOUT  = 'ih_session_timeout';
  const LS_FIRST_TS = 'ih_first_page_time';
  const LS_JOURNEY  = 'ih_journey_pages';
  const LS_FUNNEL   = 'ih_funnel_stages';
  const LS_NEW_SESS = 'ih_new_session_created';

  // Sessão
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Estado
  let eventQueue = [];
  let flushTimer = null;
  let backoffMs  = 1000;  // retry exponencial (1s, 2s, 4s... máx 30s)
  const BACKOFF_MAX = 30000;

  // ==========================
  // LOG & UTILS
  // ==========================
  const log = (...args) => MyAnalytics.debug && console.log('[InsightHouse]', ...args);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const safeJSONParse = (s, fallback) => {
    try { return JSON.parse(s); } catch { return fallback; }
  };

  const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const getLS = (k, fallback) => safeJSONParse(localStorage.getItem(k), fallback);

  const byId = (id) => (id ? document.getElementById(id) : null);
  const bySelAll = (sel) => (sel ? Array.from(document.querySelectorAll(sel)) : []);

  const safeOn = (el, ev, fn, opts = { passive: true }) => {
    if (el && typeof el.addEventListener === 'function') el.addEventListener(ev, fn, opts);
  };

  // ==========================
  // USER & SESSION
  // ==========================
  const getUserId = () => {
    let id = localStorage.getItem(LS_USER);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(LS_USER, id);
    }
    return id;
  };

  const getSessionId = () => {
    const now = Date.now();
    const last = parseInt(localStorage.getItem(LS_TIMEOUT) || '0', 10);
    let sid = localStorage.getItem(LS_SESSION);

    if (!sid || now - last > SESSION_TIMEOUT) {
      sid = `session_${now}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(LS_SESSION, sid);
      localStorage.setItem(LS_NEW_SESS, 'true');
    }
    localStorage.setItem(LS_TIMEOUT, String(now));
    return sid;
  };

  // Journey
  const trackPageView = () => {
    const journey = getLS(LS_JOURNEY, []);
    journey.push({ url: location.href, title: document.title, timestamp: Date.now() });
    if (journey.length > 20) journey.shift();
    setLS(LS_JOURNEY, journey);
    return journey;
  };

  const calculateTimeOnSite = () => {
    const firstTs = parseInt(localStorage.getItem(LS_FIRST_TS) || Date.now().toString(), 10);
    return Math.floor((Date.now() - firstTs) / 1000);
  };

  const getUserJourneyContext = () => {
    const journey = getLS(LS_JOURNEY, []);
    return {
      user_id: getUserId(),
      session_id: localStorage.getItem(LS_SESSION) || 'unknown',
      page_depth: journey.length,
      time_on_site: calculateTimeOnSite(),
      returning_visitor: journey.length > 1,
    };
  };

  if (!localStorage.getItem(LS_FIRST_TS)) {
    localStorage.setItem(LS_FIRST_TS, Date.now().toString());
  }
  trackPageView();

  // ==========================
  // QUEUE & DELIVERY
  // ==========================
  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushQueue, FLUSH_INTERVAL);
  };

  const queueEvent = (event) => {
    eventQueue.push(event);
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  };

  const persistFailed = (events) => {
    if (!events?.length) return;
    const cur = getLS(LS_FAILED, []);
    const merged = [...cur, ...events].slice(-FAILED_LIMIT);
    setLS(LS_FAILED, merged);
  };

  const sendWithBeacon = (events) => {
    try {
      if (!navigator.sendBeacon) return false;
      const ok = navigator.sendBeacon(
        BATCH_ENDPOINT,
        new Blob([JSON.stringify({ events })], { type: 'application/json' })
      );
      if (ok) log('Lote enviado via sendBeacon:', events.length);
      return ok;
    } catch {
      return false;
    }
  };

  const sendBatch = async (events) => {
    if (!events?.length) return;

    try {
      const res = await fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': SITE_KEY,
        },
        body: JSON.stringify({ events }),
        keepalive: true,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      log('Lote enviado com sucesso:', events.length);
      backoffMs = 1000; // reset backoff
    } catch (err) {
      log('Falha ao enviar lote, persistindo para retry:', err);
      persistFailed(events);
      backoffMs = clamp(backoffMs * 2, 1000, BACKOFF_MAX);
      setTimeout(retryFailedEvents, backoffMs);
    }
  };

  const flushQueue = () => {
    if (!eventQueue.length) return;
    const toSend = eventQueue.slice();
    eventQueue = [];
    sendBatch(toSend);
  };

  const retryFailedEvents = () => {
    const failed = getLS(LS_FAILED, []);
    if (!failed.length) return;
    setLS(LS_FAILED, []); // otimista
    sendBatch(failed);
  };

  // Reenvia ao carregar e quando voltar a ficar online
  retryFailedEvents();
  safeOn(window, 'online', retryFailedEvents);

  // Flush em visibilitychange (p/ abas que vão para background)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && eventQueue.length) {
      // tenta beacon primeiro
      const snapshot = eventQueue.slice();
      eventQueue = [];
      if (!sendWithBeacon(snapshot)) {
        persistFailed(snapshot);
      }
    }
  }, { passive: true });

  // Flush final
  window.addEventListener('beforeunload', () => {
    const snapshot = eventQueue.slice();
    eventQueue = [];
    if (!sendWithBeacon(snapshot)) {
      persistFailed(snapshot);
    }
  });

  // ==========================
  // CAPTURE
  // ==========================
  const capture = (eventName, properties = {}) => {
    try {
      const event = {
        name: eventName,
        properties: { ...properties, ...getUserJourneyContext() },
        context: {
          url: location.href,
          title: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screen: { width: screen.width, height: screen.height },
          viewport: { width: innerWidth, height: innerHeight },
        },
        ts: Date.now(),
      };
      queueEvent(event);
      log('Evento:', eventName, event.properties);
    } catch (e) {
      log('Erro ao capturar evento:', e);
    }
  };

  // ==========================
  // HELPERS DE FORM
  // ==========================
  const getVal = (id) => {
    const el = byId(id);
    return el && el.value ? String(el.value) : '';
  };

  const getMultiSelect = (id) => {
    const el = byId(id);
    if (!el || !el.selectedOptions) return [];
    return Array.from(el.selectedOptions).map((o) => o.value);
  };

  const getCheckedValues = (name) =>
    bySelAll(`input[name="${name}"]:checked`).map((el) => el.value);

  const getSliderRangeFromVal = (value) => {
    const [min, max] = String(value || '').split(',');
    return { min: min || '0', max: max || 'unlimited' };
  };

  const isChecked = (id) => {
    const el = byId(id);
    return !!(el && el.checked);
  };

  // ==========================
  // TRACKERS DE FILTROS
  // ==========================
  const onChange = (el, field) => {
    if (!el) return;
    safeOn(el, 'change', (e) => {
      let value = '';
      const t = e.target || el;
      if (t.type === 'checkbox' || t.type === 'radio') value = t.checked ? t.value : '';
      else if (t.multiple && t.selectedOptions)
        value = Array.from(t.selectedOptions).map((o) => o.value).join(',');
      else value = String(t.value || '');
      capture('search_filter_changed', { field, value, checked: !!t.checked || null });
    });
  };

  const trackCheckboxGroup = (name, displayName) => {
    bySelAll(`input[name="${name}"]`).forEach((el) => {
      safeOn(el, 'change', () => {
        const selected = bySelAll(`input[name="${name}"]:checked`).map((i) => i.value);
        capture('search_filter_group_changed', {
          field: displayName,
          selected,
          count: selected.length,
        });
      });
    });
  };

  const trackSlider = (sliderId, field) => {
    const slider = byId(sliderId);
    if (!slider) return;

    // 1) change no input
    safeOn(slider, 'change', () => {
      const value = slider.value || '';
      const range = getSliderRangeFromVal(value);
      capture('search_filter_range_changed', { field, ...range, raw_value: value });
    });

    // 2) bootstrapSlider: slideStop (se presente)
    // Suporta jQuery bootstrap-slider e variantes do tema
    const bindSlideStop = () => {
      try {
        const $ = window.jQuery || window.$;
        if (!$ || !$(slider).bootstrapSlider) return false;
        $(slider).bootstrapSlider().on('slideStop', (ev) => {
          const val = (ev?.value && Array.isArray(ev.value))
            ? ev.value.join(',')
            : (slider.value || '');
          const range = getSliderRangeFromVal(val);
          capture('search_filter_range_changed', { field, ...range, raw_value: val });
        });
        return true;
      } catch { return false; }
    };

    // Tenta imediatamente e mais tarde (caso plugin carregue depois)
    if (!bindSlideStop()) setTimeout(bindSlideStop, 1500);
  };

  const trackSwitch = (switchId, label) => {
    const el = byId(switchId);
    if (!el) return;
    safeOn(el, 'change', () => {
      capture('search_filter_toggle', {
        field: label,
        enabled: !!el.checked,
        value: el.value || 'Sim',
      });
    });
  };

  // ==========================
  // FUNIL
  // ==========================
  const trackFunnelStage = (stage) => {
    const funnel = getLS(LS_FUNNEL, []);
    const stageData = { stage, timestamp: Date.now(), url: location.href };
    funnel.push(stageData);
    setLS(LS_FUNNEL, funnel);

    capture('funnel_stage_reached', {
      stage,
      funnel_length: funnel.length,
      previous_stage: funnel[funnel.length - 2]?.stage || 'none',
    });
  };

  window.MyAnalytics.getFunnel = () => getLS(LS_FUNNEL, []);

  // ==========================
  // READY
  // ==========================
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  // ==========================
  // BUSCA - SUBMIT COMPLETO
  // ==========================
  const captureSearchSubmit = (source) => {
    const searchData = {
      source,
      timestamp: Date.now(),

      // Básicos
      finalidade: getVal('property-status'),
      tipos: getMultiSelect('residencial-property-type'),
      cidades: getMultiSelect('search-field-cidade'),
      bairros: getMultiSelect('search-field-cidadebairro'),

      // Avançados
      quartos: getCheckedValues('dormitorios[]'),
      suites: getCheckedValues('suites[]'),
      banheiros: getCheckedValues('banheiros[]'),
      vagas: getCheckedValues('vagas[]'),

      // Comerciais
      salas: getCheckedValues('salas[]'),
      galpoes: getCheckedValues('galpoes[]'),

      // Preço
      preco_venda: getSliderRangeFromVal(getVal('input-slider-valor-venda')),
      preco_aluguel: getSliderRangeFromVal(getVal('input-slider-valor-aluguel')),

      preco_min_manual: getVal('input-number-valor-min'),
      preco_max_manual: getVal('input-number-valor-max'),

      // Área
      area: getSliderRangeFromVal(getVal('input-slider-area')),
      area_min_manual: getVal('input-number-area-min'),
      area_max_manual: getVal('input-number-area-max'),

      // Switches
      mobiliado: isChecked('filtermobiliado'),
      semi_mobiliado: isChecked('filtersemimobiliado'),
      promocao: isChecked('filterpromocao'),
      imovel_novo: isChecked('filternovo'),
      na_planta: isChecked('filternaplanta'),
      em_construcao: isChecked('filterconstrucao'),
      aceita_permuta: isChecked('filterpermuta'),
      pet_friendly: isChecked('filterpet'),
      seguro_fianca: isChecked('filtersegfianca'),
      reservado: isChecked('filterproposta'),
      valor_total_pacote: isChecked('filterpacote'),

      // Comodidades
      comodidades: {
        ar_condicionado: isChecked('ArCondicionado-advanced'),
        lareira: isChecked('Lareira-advanced'),
        lavanderia: isChecked('Lavanderia-advanced'),
        sauna: isChecked('Sauna-advanced'),
        elevador: isChecked('Elevador-advanced'),
      },

      // Lazer
      lazer: {
        churrasqueira: isChecked('Churrasqueira-advanced'),
        piscina: isChecked('Piscina-advanced'),
        academia: isChecked('Academia-advanced'),
        playground: isChecked('Playground-advanced'),
        salao_festas: isChecked('SalaoFestas-advanced'),
        salao_jogos: isChecked('SalaoJogos-advanced'),
      },

      // Cômodos
      comodos: {
        area_servico: isChecked('AreaServico-advanced'),
        varanda: isChecked('Varanda-advanced'),
      },

      // Segurança
      seguranca: {
        alarme: isChecked('Alarme-advanced'),
        circuito_tv: isChecked('CircuitoFechadoTV-advanced'),
        interfone: isChecked('Interfone-advanced'),
        portaria_24h: isChecked('Portaria24Hrs-advanced'),
      },

      // Jornada
      journey_length: getLS(LS_JOURNEY, []).length,
    };

    capture('search_submit', searchData);
    trackFunnelStage('search_submitted');
  };

  // ==========================
  // RESULTADOS & AÇÕES
  // ==========================
  const extractCodigoFromUrl = (url) => {
    const m = String(url || '').match(/\/imovel\/(\d+)\//);
    return m ? m[1] : '';
  };

  const extractCodigoFromParent = (el) => {
    const box = el?.closest?.('.imovel-box-single');
    return (box && (box.getAttribute('data-codigo') || '')) || '';
  };

  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    const href = String(a.getAttribute('href') || '');

    if (!href) return;

    if (href.includes('/imovel/')) {
      const codigo = extractCodigoFromUrl(href);
      capture('results_item_click', { target: href, kind: 'imovel', codigo });
      trackFunnelStage('viewed_property');
    } else if (href.includes('/condominio/')) {
      capture('results_item_click', { target: href, kind: 'condominio' });
    } else if (a.classList.contains('button-info-panel')) {
      const codigo = extractCodigoFromParent(a);
      capture('results_saber_mais_click', { codigo, href });
      trackFunnelStage('clicked_saber_mais');
    }
  }, { passive: true });

  // Favoritos (lista)
  document.addEventListener('click', (e) => {
    const tgt = e.target;
    if (tgt?.classList?.contains('btn-favoritar') || tgt?.closest?.('.btn-favoritar')) {
      const btn = tgt.closest?.('.btn-favoritar') || tgt;
      const codigo = btn.getAttribute('data-codigo') || '';
      capture('favorite_toggle', {
        codigo,
        action: btn.classList.contains('favorited') ? 'remove' : 'add',
      });
      trackFunnelStage('favorited_property');
    }
  }, { passive: true });

  // Conversões de clique
  const trackConversion = (sel, eventName, label) => {
    bySelAll(sel).forEach((el) => {
      safeOn(el, 'click', () => {
        const codigo = extractCodigoFromParent(el);
        capture(eventName, { codigo, href: el.href || '' });
        trackFunnelStage(label);
      });
    });
  };

  // ==========================
  // PÁGINA DE PROPRIEDADE
  // ==========================
  const getPropertyCodeFromPage = () => {
    const m = location.pathname.match(/\/imovel\/(\d+)\//);
    if (m) return m[1];
    const formBtn = document.querySelector('a[href*="codigo_imovel="]');
    if (formBtn) {
      const href = formBtn.getAttribute('href') || '';
      const mm = href.match(/codigo_imovel=(\d+)/);
      if (mm) return mm[1];
    }
    return '';
  };

  // ==========================
  // TEMPO & SCROLL & BOUNCE
  // ==========================
  const pageLoadTime = Date.now();
  let maxScroll = 0;
  const scrollDepths = [25, 50, 75, 100];
  const trackedDepths = new Set();

  window.addEventListener('scroll', () => {
    const scrollHeight = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const scrolled = (window.scrollY / scrollHeight) * 100;
    if (scrolled > maxScroll) maxScroll = scrolled;

    scrollDepths.forEach((d) => {
      if (scrolled >= d && !trackedDepths.has(d)) {
        trackedDepths.add(d);
        capture('scroll_depth', { depth: d });
      }
    });
  }, { passive: true });

  const trackBounceIndicators = () => {
    const journey = getLS(LS_JOURNEY, []);
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    const isBounce = journey.length <= 1 && timeOnPage < 10;
    const isQuickExit = timeOnPage < 30 && maxScroll < 25;
    if (isBounce || isQuickExit) {
      capture('bounce_detected', {
        type: isBounce ? 'hard_bounce' : 'quick_exit',
        time_on_page: timeOnPage,
        max_scroll: Math.floor(maxScroll),
        page_depth: journey.length,
      });
    }
  };

  // ==========================
  // READY BINDINGS
  // ==========================
  onReady(() => {
    log('Inicializando analytics...');
    log('API URL:', API_URL);
    log('Site Key:', SITE_KEY);

    // Nova sessão?
    if (localStorage.getItem(LS_NEW_SESS) === 'true') {
      localStorage.removeItem(LS_NEW_SESS);
      capture('session_start', {
        session_id: getSessionId(),
        referrer: document.referrer,
        landing_page: location.href,
      });
    }

    // ===== FILTROS BÁSICOS =====
    onChange(byId('property-status'), 'finalidade');
    bySelAll('.finalidade-alias-button[data-value]').forEach((btn) => {
      safeOn(btn, 'click', () => {
        capture('search_filter_changed', { field: 'finalidade', value: btn.getAttribute('data-value') });
      });
    });

    onChange(byId('residencial-property-type'), 'tipo');

    const city = byId('search-field-cidade');
    onChange(city, 'cidade');
    safeOn(city, 'change', () => {
      const values = city?.selectedOptions ? Array.from(city.selectedOptions).map((o) => o.value) : [];
      if (values.length) capture('search_filter_city', { cidades: values });
    });

    const bairro = byId('search-field-cidadebairro');
    onChange(bairro, 'bairro');
    safeOn(bairro, 'change', () => {
      const values = bairro?.selectedOptions ? Array.from(bairro.selectedOptions).map((o) => o.value) : [];
      if (values.length) capture('search_filter_bairro', { bairros: values });
    });

    // ===== GRUPOS =====
    trackCheckboxGroup('dormitorios[]', 'quartos');
    trackCheckboxGroup('suites[]', 'suites');
    trackCheckboxGroup('banheiros[]', 'banheiros');
    trackCheckboxGroup('vagas[]', 'vagas');

    // Comerciais
    trackCheckboxGroup('salas[]', 'salas_comercial');
    trackCheckboxGroup('galpoes[]', 'galpoes');

    // ===== SLIDERS =====
    trackSlider('input-slider-valor-venda', 'preco_venda');
    trackSlider('input-slider-valor-aluguel', 'preco_aluguel');
    trackSlider('input-slider-area', 'area');

    // ===== INPUTS NUMÉRICOS =====
    const trackNumberInput = (inputId, field) => {
      const input = byId(inputId);
      if (!input) return;
      safeOn(input, 'blur', () => {
        if (String(input.value || '').trim()) {
          capture('search_filter_manual_input', { field, value: input.value });
        }
      });
    };
    trackNumberInput('input-number-valor-min', 'preco_min_manual');
    trackNumberInput('input-number-valor-max', 'preco_max_manual');
    trackNumberInput('input-number-area-min', 'area_min_manual');
    trackNumberInput('input-number-area-max', 'area_max_manual');

    // ===== SWITCHES =====
    [
      ['filtermobiliado', 'mobiliado'],
      ['filtersemimobiliado', 'semi_mobiliado'],
      ['filterpromocao', 'promocao_ofertas'],
      ['filternovo', 'imovel_novo'],
      ['filternaplanta', 'na_planta'],
      ['filterconstrucao', 'em_construcao'],
      ['filterpermuta', 'aceita_permuta'],
      ['filterpet', 'pet_friendly'],
      ['filtersegfianca', 'seguro_fianca'],
      ['filterproposta', 'reservado'],
      ['filterpacote', 'valor_total_pacote'],
    ].forEach(([id, label]) => trackSwitch(id, label));

    // Comodidades
    ['ArCondicionado','Lareira','Lavanderia','Sauna','Elevador']
      .forEach((k) => trackSwitch(`${k}-advanced`, `comodidade_${k.toLowerCase()}`));

    // Lazer
    ['Churrasqueira','Piscina','Academia','Playground','SalaoFestas','SalaoJogos']
      .forEach((k) => trackSwitch(`${k}-advanced`, `lazer_${k.toLowerCase()}`));

    // Cômodos
    ['AreaServico','Varanda']
      .forEach((k) => trackSwitch(`${k}-advanced`, `comodo_${k.toLowerCase()}`));

    // Segurança
    ['Alarme','CircuitoFechadoTV','Interfone','Portaria24Hrs']
      .forEach((k) => trackSwitch(`${k}-advanced`, `seguranca_${k.toLowerCase()}`));

    // Avançados toggle
    const advancedTrigger = byId('collapseAdvFilter-trigger');
    safeOn(advancedTrigger, 'click', () => {
      const isExpanded = !!byId('collapseAdvFilter')?.classList?.contains('show');
      capture('advanced_filters_toggle', { action: isExpanded ? 'collapse' : 'expand' });
    });

    // Ordenação
    bySelAll('.dropdown-orderby ul li a').forEach((link) => {
      safeOn(link, 'click', () => {
        capture('results_order_changed', { order_by: link.getAttribute('data-value') });
      });
    });

    // Submits
    safeOn(byId('submit-main-search-form'), 'click', () => captureSearchSubmit('main_form'));
    safeOn(byId('submit-main-search-form-codigo'), 'click', () => {
      const codigo = getVal('property-codigo');
      capture('search_submit', { source: 'codigo', codigo });
      trackFunnelStage('search_by_code');
    });
    bySelAll('.submit-sidebar-search-form').forEach((btn) =>
      safeOn(btn, 'click', () => captureSearchSubmit('sidebar_form'))
    );

    // Conversões (cliques de contato)
    trackConversion('a[href^="https://wa.me"],a[href*="api.whatsapp.com"]', 'conversion_whatsapp_click', 'contacted_whatsapp');
    trackConversion('a[href^="tel:"]', 'conversion_phone_click', 'contacted_phone');
    trackConversion('a[href^="mailto:"]', 'conversion_email_click', 'contacted_email');

    // ===== Página de propriedade =====
    const propertyCode = getPropertyCodeFromPage();
    if (propertyCode) {
      log('Página de propriedade detectada:', propertyCode);

      capture('property_page_view', { codigo: propertyCode, url: location.href, title: document.title });

      const propostaBtn = document.querySelector('.cadastro-proposta-cta');
      safeOn(propostaBtn, 'click', () => {
        capture('cta_fazer_proposta_click', { codigo: propertyCode, href: propostaBtn?.getAttribute('href') || '' });
        trackFunnelStage('clicked_fazer_proposta');
      });

      const alugarBtn = document.querySelector('.cadastro-inquilino-cta');
      safeOn(alugarBtn, 'click', () => {
        capture('cta_alugar_imovel_click', { codigo: propertyCode, href: alugarBtn?.getAttribute('href') || '' });
        trackFunnelStage('clicked_alugar_imovel');
      });

      const maisInfoBtn = document.querySelector('a[data-toggle="modal"][href="#imovel-contato"]');
      safeOn(maisInfoBtn, 'click', () => {
        capture('cta_mais_informacoes_click', { codigo: propertyCode });
        trackFunnelStage('opened_contact_form');
      });

      const shareBtn = document.querySelector('a[href="#modal-compartilhar"]');
      safeOn(shareBtn, 'click', () => capture('property_share_click', { codigo: propertyCode }));

      const favBtn = document.querySelector('.clb-form-fixed-fav a[data-codigo]');
      safeOn(favBtn, 'click', () => {
        const isFavorited = !!favBtn?.classList?.contains('favorited');
        capture('property_favorite_toggle', { codigo: propertyCode, action: isFavorited ? 'remove' : 'add' });
        trackFunnelStage('favorited_property');
      });

      // Formulário de contato no modal
      const calculateFormCompleteness = (fields) => {
        const total = Object.keys(fields).length;
        const filled = Object.values(fields).filter((v) => v && String(v).trim()).length;
        return Math.round((filled / total) * 100);
      };

      const trackContactForm = () => {
        const start = Date.now();
        const checkModal = setInterval(() => {
          const modal = byId('imovel-contato');
          const form = modal ? modal.querySelector('form') : null;
          // para o polling após 10s p/ não “pendurar”
          if (Date.now() - start > 10000) clearInterval(checkModal);
          if (!form) return;

          clearInterval(checkModal);
          log('Form de contato encontrado');

          const trackFormField = (selector, fieldName) => {
            const field = form.querySelector(selector);
            if (!field) return;
            safeOn(field, 'focus', () => capture('contact_form_field_focus', { codigo: propertyCode, field: fieldName }));
            safeOn(field, 'blur', () => {
              if (String(field.value || '').trim()) {
                capture('contact_form_field_filled', { codigo: propertyCode, field: fieldName, has_value: true });
              }
            });
          };

          trackFormField('input[name="nome"], input[type="text"]', 'nome');
          trackFormField('input[name="email"], input[type="email"]', 'email');
          trackFormField('input[name="celular"], input[name="telefone"], input[type="tel"]', 'telefone');
          trackFormField('textarea[name="mensagem"], textarea', 'mensagem');

          safeOn(form, 'submit', () => {
            const fd = new FormData(form);
            const nome = fd.get('nome') || '';
            const email = fd.get('email') || '';
            const telefone = fd.get('celular') || fd.get('telefone') || '';
            const mensagem = fd.get('mensagem') || '';
            capture('contact_form_submit', {
              codigo: propertyCode,
              has_nome: !!nome,
              has_email: !!email,
              has_telefone: !!telefone,
              has_mensagem: !!mensagem,
              form_completeness: calculateFormCompleteness({ nome, email, telefone, mensagem }),
            });
            trackFunnelStage('submitted_contact_form');
            capture('conversion_contact_form', {
              codigo: propertyCode,
              contact_type: 'form',
              user_id: getUserId(),
              session_id: getSessionId(),
            });
          });

          // Abandono
          let formStarted = false;
          form.querySelectorAll('input, textarea').forEach((field) => {
            safeOn(field, 'input', () => {
              if (!formStarted) {
                formStarted = true;
                capture('contact_form_started', { codigo: propertyCode });
              }
            });
          });

          const detectAbandonment = () => {
            if (!formStarted) return;
            const fd = new FormData(form);
            const hasAny = Array.from(fd.values()).some((v) => v && String(v).trim());
            if (hasAny) capture('contact_form_abandoned', { codigo: propertyCode, partial_data: true });
          };

          const closeBtn = modal.querySelector('[data-dismiss="modal"]');
          safeOn(modal, 'hidden.bs.modal', detectAbandonment);
          safeOn(closeBtn, 'click', detectAbandonment);
        }, 500);
      };
      trackContactForm();

      // Galeria
      bySelAll('.swiper-button-next, .swiper-button-prev').forEach((btn) => {
        safeOn(btn, 'click', () => {
          capture('property_gallery_navigation', {
            codigo: propertyCode,
            direction: btn.classList.contains('swiper-button-next') ? 'next' : 'prev',
          });
        });
      });
      bySelAll('.foto-imovel, .swiper-slide').forEach((slide) => {
        safeOn(slide, 'click', () => capture('property_image_click', { codigo: propertyCode }));
      });
    }

    // Tempo & saída
    safeOn(window, 'beforeunload', () => {
      const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
      capture('page_exit', { time_on_page: timeOnPage, max_scroll_depth: Math.floor(maxScroll) });
      trackBounceIndicators();
      flushQueue();
    });
  });

  // ==========================
  // EXPORT API
  // ==========================
  window.MyAnalytics = {
    ...MyAnalytics,
    capture,
    getUserId,
    getSessionId,
    getJourney: () => getLS(LS_JOURNEY, []),
    getFunnel: () => getLS(LS_FUNNEL, []),
    getPropertyCode: getPropertyCodeFromPage,
    clearJourney: () => {
      localStorage.removeItem(LS_JOURNEY);
      localStorage.removeItem(LS_FUNNEL);
      localStorage.removeItem(LS_FIRST_TS);
      localStorage.removeItem(LS_SESSION);
      localStorage.removeItem(LS_TIMEOUT);
    },
    flush: flushQueue,
    debug: MyAnalytics.debug,
  };

  log('Analytics avançado inicializado ✓');
  log('User ID:', getUserId());
  log('Session ID:', getSessionId());
})();

