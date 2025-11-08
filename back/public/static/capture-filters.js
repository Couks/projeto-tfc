/**
 * InsightHouse Analytics (versão delegada + modular ES6 + sem jQuery)
 *
 * Melhorias:
 * - Delegação de eventos (menos listeners, melhor performance)
 * - Classe ES6 com estado encapsulado e API pública controlada
 * - Remoção de dependência implícita de jQuery/Bootstrap; sliders por eventos nativos
 * - Fila com flush por timer/tamanho/visibilitychange + sendBeacon + retry/backoff
 * - PÁGINA DE OBRIGADO com leitura de query params e conversão final
 */

class InsightHouseAnalytics {
  // ==========================
  // CONFIG
  // ==========================
  MAX_QUEUE_SIZE = 10;
  FLUSH_INTERVAL = 3000; // ms
  FAILED_LIMIT = 300; // máx eventos persistidos p/ retry
  BACKOFF_MAX = 30000;
  SESSION_TIMEOUT = 30 * 60 * 1000;

  // Storage keys
  LS_FAILED = 'ih_failed_events';
  LS_USER = 'ih_user_id';
  LS_SESSION = 'ih_session_id';
  LS_TIMEOUT = 'ih_session_timeout';
  LS_FIRST_TS = 'ih_first_page_time';
  LS_JOURNEY = 'ih_journey_pages';
  LS_FUNNEL = 'ih_funnel_stages';
  LS_NEW_SESS = 'ih_new_session_created';

  // Estado
  eventQueue = [];
  flushTimer = null;
  backoffMs = 1000;
  pageLoadTime = Date.now();

  constructor({ apiUrl, siteKey, debug = true } = {}) {
    const MyAnalytics = (window.MyAnalytics = window.MyAnalytics || {});
    this.debug = debug ?? MyAnalytics.debug ?? false;

    this.API_URL = apiUrl ?? window.IH_API_URL ?? '';
    this.SITE_KEY = siteKey ?? window.IH_SITE_KEY ?? '';

    if (!this.SITE_KEY) {
      console.error('[InsightHouse] SITE_KEY não configurada');
      this.disabled = true;
      return;
    }

    this.BATCH_ENDPOINT = `${this.API_URL}/api/events/track/batch`;
  }

  // ==========================
  // LOG & UTILS
  // ==========================
  log = (...args) => this.debug && console.log('[InsightHouse]', ...args);

  clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  safeJSONParse = (s, fallback) => {
    if (s == null) return fallback;
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };

  setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  getLS = (k, fallback) =>
    this.safeJSONParse(localStorage.getItem(k), fallback);

  byId = (id) => (id ? document.getElementById(id) : null);

  // ==========================
  // USER & SESSION
  // ==========================
  getUserId = () => {
    let id = localStorage.getItem(this.LS_USER);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(this.LS_USER, id);
    }
    return id;
  };

  getSessionId = () => {
    const now = Date.now();
    const last = parseInt(localStorage.getItem(this.LS_TIMEOUT) || '0', 10);
    let sid = localStorage.getItem(this.LS_SESSION);

    if (!sid || now - last > this.SESSION_TIMEOUT) {
      sid = `session_${now}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(this.LS_SESSION, sid);
      localStorage.setItem(this.LS_NEW_SESS, 'true');
    }
    localStorage.setItem(this.LS_TIMEOUT, String(now));
    return sid;
  };

  trackPageView = () => {
    const journey = this.getLS(this.LS_JOURNEY, []);
    const safeJourney = Array.isArray(journey) ? journey : [];
    safeJourney.push({
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
    });
    if (safeJourney.length > 20) safeJourney.shift();
    this.setLS(this.LS_JOURNEY, safeJourney);
    return safeJourney;
  };

  ensureFirstTs = () => {
    if (!localStorage.getItem(this.LS_FIRST_TS)) {
      localStorage.setItem(this.LS_FIRST_TS, Date.now().toString());
    }
  };

  calculateTimeOnSite = () => {
    const firstTs = parseInt(
      localStorage.getItem(this.LS_FIRST_TS) || Date.now().toString(),
      10,
    );
    return Math.floor((Date.now() - firstTs) / 1000);
  };

  getUserJourneyContext = () => {
    const journey = this.getLS(this.LS_JOURNEY, []);
    const safeJourney = Array.isArray(journey) ? journey : [];
    return {
      user_id: this.getUserId(),
      session_id: localStorage.getItem(this.LS_SESSION) || 'unknown',
      page_depth: safeJourney.length,
      time_on_site: this.calculateTimeOnSite(),
      returning_visitor: safeJourney.length > 1,
    };
  };

  // ==========================
  // QUEUE & DELIVERY
  // ==========================
  scheduleFlush = () => {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(this.flushQueue, this.FLUSH_INTERVAL);
  };

  queueEvent = (event) => {
    this.eventQueue.push(event);
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueue();
    } else {
      this.scheduleFlush();
    }
  };

  persistFailed = (events) => {
    if (!events?.length) return;
    const cur = this.getLS(this.LS_FAILED, []);
    const safeCur = Array.isArray(cur) ? cur : [];
    const merged = [...safeCur, ...events].slice(-this.FAILED_LIMIT);
    this.setLS(this.LS_FAILED, merged);
  };

  sendWithBeacon = (events) => {
    try {
      if (!navigator.sendBeacon) return false;
      const ok = navigator.sendBeacon(
        this.BATCH_ENDPOINT,
        new Blob([JSON.stringify({ events })], { type: 'application/json' }),
      );
      if (ok) this.log('Lote enviado via sendBeacon:', events.length);
      return ok;
    } catch {
      return false;
    }
  };

  sendBatch = async (events) => {
    if (!events?.length) return;
    try {
      const res = await fetch(this.BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': this.SITE_KEY,
        },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.log('Lote enviado com sucesso:', events.length);
      this.backoffMs = 1000;
    } catch (err) {
      this.log('Falha ao enviar lote, persistindo para retry:', err);
      this.persistFailed(events);
      this.backoffMs = this.clamp(this.backoffMs * 2, 1000, this.BACKOFF_MAX);
      setTimeout(this.retryFailedEvents, this.backoffMs);
    }
  };

  flushQueue = () => {
    if (!this.eventQueue.length) return;
    const toSend = this.eventQueue.slice();
    this.eventQueue = [];
    this.sendBatch(toSend);
  };

  retryFailedEvents = () => {
    const failed = this.getLS(this.LS_FAILED, []);
    if (!failed || !Array.isArray(failed) || !failed.length) return;
    this.setLS(this.LS_FAILED, []); // otimista
    this.sendBatch(failed);
  };

  // ==========================
  // CAPTURE
  // ==========================
  capture = (eventName, properties = {}) => {
    if (this.disabled) return;
    try {
      const event = {
        name: eventName,
        properties: { ...properties, ...this.getUserJourneyContext() },
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
      this.queueEvent(event);
      this.log('Evento:', eventName, event.properties);
    } catch (e) {
      this.log('Erro ao capturar evento:', e);
    }
  };

  // ==========================
  // FUNIL
  // ==========================
  trackFunnelStage = (stage) => {
    const funnel = this.getLS(this.LS_FUNNEL, []);
    const safeFunnel = Array.isArray(funnel) ? funnel : [];
    const stageData = { stage, timestamp: Date.now(), url: location.href };
    safeFunnel.push(stageData);
    this.setLS(this.LS_FUNNEL, safeFunnel);

    this.capture('funnel_stage_reached', {
      stage,
      funnel_length: safeFunnel.length,
      previous_stage: safeFunnel[safeFunnel.length - 2]?.stage || 'none',
    });
  };

  // ==========================
  // THANK YOU / CONTEXTO
  // ==========================
  isThankYouPage = () => {
    const p = (location.pathname || '').toLowerCase();
    const t = (document.title || '').toLowerCase();
    return p.includes('/obrigado') || t.includes('obrigado -');
  };

  getThankYouParams = () => {
    const u = new URL(location.href);
    const q = u.searchParams;
    const toNumber = (v) => {
      if (v == null) return null;
      const s = String(v).replace(/\./g, '').replace(/,/g, '.').trim();
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const get = (k) => q.get(k) || '';
    return {
      target: get('target') || 'imovel',
      interesse: get('interesse') || '',
      codigo: get('codigo') || '',
      categoria: get('categoria') || '',
      tipo: get('tipo') || '',
      cidade: get('cidade') || '',
      bairro: get('bairro') || '',
      empreendimento: get('empreendimento') || '',
      valor_venda: toNumber(get('valor_venda')),
      valor_aluguel: toNumber(get('valor_aluguel')),
      dormitorios: toNumber(get('dormitorios')),
      vagas: toNumber(get('vagas')),
      titulo_anuncio: get('titulo_anuncio') || '',
      lancamento: get('lancamento') || '',
      agenciacodigo: get('agenciacodigo') || '',
      agencianome: get('agencianome') || '',
      thank_you_url: location.href,
    };
  };

  getPropertyCodeFromPage = () => {
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
  // DELEGAÇÃO DE EVENTOS
  // ==========================
  on = (type, selector, handler, opts) => {
    document.addEventListener(
      type,
      (ev) => {
        const el = ev.target && (ev.target.closest?.(selector) || null);
        if (!el) return;
        handler(ev, el);
      },
      opts,
    );
  };

  // ==========================
  // BINDINGS PRINCIPAIS
  // ==========================
  bindGlobalLifecycle = () => {
    // Retry inicial e quando voltar online
    this.retryFailedEvents();
    window.addEventListener('online', this.retryFailedEvents);

    // Flush em visibilitychange
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden' && this.eventQueue.length) {
          const snapshot = this.eventQueue.slice();
          this.eventQueue = [];
          if (!this.sendWithBeacon(snapshot)) {
            this.persistFailed(snapshot);
          }
        }
      },
      { passive: true },
    );

    // Flush final
    window.addEventListener('beforeunload', () => {
      const snapshot = this.eventQueue.slice();
      this.eventQueue = [];
      if (!this.sendWithBeacon(snapshot)) {
        this.persistFailed(snapshot);
      }
    });

    // Saída (page_exit)
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.floor((Date.now() - this.pageLoadTime) / 1000);
      this.capture('page_exit', { time_on_page: timeOnPage });
      this.flushQueue();
    });
  };

  bindThankYouPage = () => {
    if (!this.isThankYouPage()) return;
    const ty = this.getThankYouParams();

    // Diagnóstico
    this.capture('thank_you_page_view', ty);

    // Conversão final confirmada
    this.capture('conversion_complete', {
      ...ty,
      confirmation_source: 'thank_you_page',
      user_id: this.getUserId(),
      session_id: this.getSessionId(),
    });

    // Estágio final
    this.trackFunnelStage('conversion_confirmed');

    // Pós-conversão: cliques (delegação)
    this.on(
      'click',
      'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
      (_e, a) => {
        this.capture('conversion_whatsapp_click', {
          codigo: ty.codigo || '',
          href: a.href || '',
          post_conversion: true,
          source: 'thank_you_page',
        });
        this.trackFunnelStage('contacted_whatsapp');
      },
      { passive: true },
    );

    this.on(
      'click',
      'a[href^="tel:"]',
      (_e, a) => {
        this.capture('conversion_phone_click', {
          codigo: ty.codigo || '',
          href: a.href || '',
          post_conversion: true,
          source: 'thank_you_page',
        });
        this.trackFunnelStage('contacted_phone');
      },
      { passive: true },
    );

    this.on(
      'click',
      'a[href^="mailto:"]',
      (_e, a) => {
        this.capture('conversion_email_click', {
          codigo: ty.codigo || '',
          href: a.href || '',
          post_conversion: true,
          source: 'thank_you_page',
        });
        this.trackFunnelStage('contacted_email');
      },
      { passive: true },
    );
  };

  bindSessionStart = () => {
    if (localStorage.getItem(this.LS_NEW_SESS) === 'true') {
      localStorage.removeItem(this.LS_NEW_SESS);
      this.capture('session_start', {
        session_id: this.getSessionId(),
        referrer: document.referrer,
        landing_page: location.href,
      });
    }
  };

  // ====== BUSCA (submit completo) ======
  getVal = (id) => {
    const el = this.byId(id);
    return el && el.value ? String(el.value) : '';
  };

  getMultiSelect = (id) => {
    const el = this.byId(id);
    if (!el || !el.selectedOptions) return [];
    return Array.from(el.selectedOptions).map((o) => o.value);
  };

  getCheckedValues = (name) =>
    Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (el) => el.value,
    );

  getSliderRangeFromVal = (value) => {
    const [min, max] = String(value || '').split(',');
    return { min: min || '0', max: max || 'unlimited' };
  };

  isChecked = (id) => {
    const el = this.byId(id);
    return !!(el && el.checked);
  };

  captureSearchSubmit = (source) => {
    const searchData = {
      source,
      timestamp: Date.now(),
      // Básicos
      finalidade: this.getVal('property-status'),
      tipos: this.getMultiSelect('residencial-property-type'),
      cidades: this.getMultiSelect('search-field-cidade'),
      bairros: this.getMultiSelect('search-field-cidadebairro'),
      // Avançados
      quartos: this.getCheckedValues('dormitorios[]'),
      suites: this.getCheckedValues('suites[]'),
      banheiros: this.getCheckedValues('banheiros[]'),
      vagas: this.getCheckedValues('vagas[]'),
      // Comerciais
      salas: this.getCheckedValues('salas[]'),
      galpoes: this.getCheckedValues('galpoes[]'),
      // Preço
      preco_venda: this.getSliderRangeFromVal(
        this.getVal('input-slider-valor-venda'),
      ),
      preco_aluguel: this.getSliderRangeFromVal(
        this.getVal('input-slider-valor-aluguel'),
      ),
      preco_min_manual: this.getVal('input-number-valor-min'),
      preco_max_manual: this.getVal('input-number-valor-max'),
      // Área
      area: this.getSliderRangeFromVal(this.getVal('input-slider-area')),
      area_min_manual: this.getVal('input-number-area-min'),
      area_max_manual: this.getVal('input-number-area-max'),
      // Switches
      mobiliado: this.isChecked('filtermobiliado'),
      semi_mobiliado: this.isChecked('filtersemimobiliado'),
      promocao: this.isChecked('filterpromocao'),
      imovel_novo: this.isChecked('filternovo'),
      na_planta: this.isChecked('filternaplanta'),
      em_construcao: this.isChecked('filterconstrucao'),
      aceita_permuta: this.isChecked('filterpermuta'),
      pet_friendly: this.isChecked('filterpet'),
      seguro_fianca: this.isChecked('filtersegfianca'),
      reservado: this.isChecked('filterproposta'),
      valor_total_pacote: this.isChecked('filterpacote'),
      // Comodidades
      comodidades: {
        ar_condicionado: this.isChecked('ArCondicionado-advanced'),
        lareira: this.isChecked('Lareira-advanced'),
        lavanderia: this.isChecked('Lavanderia-advanced'),
        sauna: this.isChecked('Sauna-advanced'),
        elevador: this.isChecked('Elevador-advanced'),
      },
      // Lazer
      lazer: {
        churrasqueira: this.isChecked('Churrasqueira-advanced'),
        piscina: this.isChecked('Piscina-advanced'),
        academia: this.isChecked('Academia-advanced'),
        playground: this.isChecked('Playground-advanced'),
        salao_festas: this.isChecked('SalaoFestas-advanced'),
        salao_jogos: this.isChecked('SalaoJogos-advanced'),
      },
      // Cômodos
      comodos: {
        area_servico: this.isChecked('AreaServico-advanced'),
        varanda: this.isChecked('Varanda-advanced'),
      },
      // Segurança
      seguranca: {
        alarme: this.isChecked('Alarme-advanced'),
        circuito_tv: this.isChecked('CircuitoFechadoTV-advanced'),
        interfone: this.isChecked('Interfone-advanced'),
        portaria_24h: this.isChecked('Portaria24Hrs-advanced'),
      },
      // Jornada
      journey_length: (() => {
        const journey = this.getLS(this.LS_JOURNEY, []);
        return Array.isArray(journey) ? journey.length : 0;
      })(),
    };

    this.capture('search_submit', searchData);
    this.trackFunnelStage('search_submitted');
  };

  // ==========================
  // BINDINGS DE PÁGINAS/AÇÕES
  // ==========================
  bindResultsAndActions = () => {
    // Itens de resultado (todos links)
    this.on(
      'click',
      'a',
      (e, a) => {
        const href = String(a.getAttribute('href') || '');
        if (!href) return;

        if (href.includes('/imovel/')) {
          const m = href.match(/\/imovel\/(\d+)\//);
          const codigo = m ? m[1] : '';
          this.capture('results_item_click', {
            target: href,
            kind: 'imovel',
            codigo,
          });
          this.trackFunnelStage('viewed_property');
        } else if (href.includes('/condominio/')) {
          this.capture('results_item_click', {
            target: href,
            kind: 'condominio',
          });
        } else if (a.classList.contains('button-info-panel')) {
          const box = a.closest('.imovel-box-single');
          const codigo = box?.getAttribute('data-codigo') || '';
          this.capture('results_saber_mais_click', { codigo, href });
          this.trackFunnelStage('clicked_saber_mais');
        }
      },
      { passive: true },
    );

    // Favoritos (lista/página)
    this.on(
      'click',
      '.btn-favoritar, .btn-favoritar *',
      (_e, el) => {
        const btn = el.closest('.btn-favoritar');
        const codigo = btn?.getAttribute('data-codigo') || '';
        this.capture('favorite_toggle', {
          codigo,
          action: btn?.classList?.contains('favorited') ? 'remove' : 'add',
        });
        this.trackFunnelStage('favorited_property');
      },
      { passive: true },
    );

    // Conversões (WhatsApp / Telefone / Email)
    this.on(
      'click',
      'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
      (_e, a) => {
        const codigo =
          a.closest('.imovel-box-single')?.getAttribute('data-codigo') || '';
        this.capture('conversion_whatsapp_click', {
          codigo,
          href: a.href || '',
        });
        this.trackFunnelStage('contacted_whatsapp');
      },
      { passive: true },
    );

    this.on(
      'click',
      'a[href^="tel:"]',
      (_e, a) => {
        const codigo =
          a.closest('.imovel-box-single')?.getAttribute('data-codigo') || '';
        this.capture('conversion_phone_click', { codigo, href: a.href || '' });
        this.trackFunnelStage('contacted_phone');
      },
      { passive: true },
    );

    this.on(
      'click',
      'a[href^="mailto:"]',
      (_e, a) => {
        const codigo =
          a.closest('.imovel-box-single')?.getAttribute('data-codigo') || '';
        this.capture('conversion_email_click', { codigo, href: a.href || '' });
        this.trackFunnelStage('contacted_email');
      },
      { passive: true },
    );

    // Ordenação (dropdown)
    this.on(
      'click',
      '.dropdown-orderby ul li a',
      (_e, link) => {
        const order = link.getAttribute('data-value');
        this.capture('results_order_changed', { order_by: order });
      },
      { passive: true },
    );

    // Submits dos formulários de busca
    const mainSubmit = this.byId('submit-main-search-form');
    if (mainSubmit)
      mainSubmit.addEventListener(
        'click',
        () => this.captureSearchSubmit('main_form'),
        { passive: true },
      );

    const codeSubmit = this.byId('submit-main-search-form-codigo');
    if (codeSubmit)
      codeSubmit.addEventListener(
        'click',
        () => {
          const codigo = this.getVal('property-codigo');
          this.capture('search_submit', { source: 'codigo', codigo });
          this.trackFunnelStage('search_by_code');
        },
        { passive: true },
      );

    document.querySelectorAll('.submit-sidebar-search-form').forEach((btn) => {
      btn.addEventListener(
        'click',
        () => this.captureSearchSubmit('sidebar_form'),
        { passive: true },
      );
    });
  };

  bindFiltersDelegated = () => {
    // Filtros básicos via change/input delegados
    document.addEventListener(
      'change',
      (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;

        // Grupos (checkbox/radio)
        if (
          t.matches('input[type="checkbox"][name], input[type="radio"][name]')
        ) {
          const name = t.getAttribute('name');
          const selected = Array.from(
            document.querySelectorAll(`input[name="${name}"]:checked`),
          ).map((i) => i.value);
          this.capture('search_filter_group_changed', {
            field: name,
            selected,
            count: selected.length,
          });
          return;
        }

        // Selects
        if (t.matches('select')) {
          const values = t.multiple
            ? Array.from(t.selectedOptions)
                .map((o) => o.value)
                .join(',')
            : String(t.value || '');
          this.capture('search_filter_changed', {
            field: t.id || t.name || 'select',
            value: values,
          });
          // Cidades e Bairros com eventos dedicados
          if (t.id === 'search-field-cidade' && t.selectedOptions?.length) {
            const cidades = Array.from(t.selectedOptions).map((o) => o.value);
            this.capture('search_filter_city', { cidades });
          }
          if (
            t.id === 'search-field-cidadebairro' &&
            t.selectedOptions?.length
          ) {
            const bairros = Array.from(t.selectedOptions).map((o) => o.value);
            this.capture('search_filter_bairro', { bairros });
          }
          return;
        }

        // Sliders nativos (range) ou inputs com valor "min,max"
        if (t.matches('input[type="range"], input[data-slider="range"]')) {
          const [min, max] = String(t.value || '').split(',');
          this.capture('search_filter_range_changed', {
            field: t.id || 'range',
            min: min || '0',
            max: max || 'unlimited',
            raw_value: t.value || '',
          });
        }
      },
      { passive: true },
    );

    document.addEventListener(
      'input',
      (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;

        // Campos numéricos manuais
        if (
          t.matches(
            '#input-number-valor-min, #input-number-valor-max, #input-number-area-min, #input-number-area-max',
          )
        ) {
          const field = t.id.replace('input-number-', '');
          if (String(t.value || '').trim()) {
            this.capture('search_filter_manual_input', {
              field,
              value: t.value,
            });
          }
        }
      },
      { passive: true },
    );

    // Botões de finalidade alias
    this.on(
      'click',
      '.finalidade-alias-button[data-value]',
      (_e, btn) => {
        this.capture('search_filter_changed', {
          field: 'finalidade',
          value: btn.getAttribute('data-value'),
        });
      },
      { passive: true },
    );

    // Toggle de avançados
    const advancedTrigger = this.byId('collapseAdvFilter-trigger');
    if (advancedTrigger) {
      advancedTrigger.addEventListener(
        'click',
        () => {
          const isExpanded =
            !!this.byId('collapseAdvFilter')?.classList?.contains('show');
          this.capture('advanced_filters_toggle', {
            action: isExpanded ? 'collapse' : 'expand',
          });
        },
        { passive: true },
      );
    }

    // Sliders específicos (fallback compat)
    // Tenta ouvir eventos nativos; se o plugin custom disparar 'slideStop', também captura.
    const bindSlider = (id, field) => {
      const el = this.byId(id);
      if (!el) return;
      const emit = (raw) => {
        const val = raw ?? el.value ?? '';
        const [min, max] = String(val).split(',');
        this.capture('search_filter_range_changed', {
          field,
          min: min || '0',
          max: max || 'unlimited',
          raw_value: String(val),
        });
      };
      el.addEventListener('input', () => emit(), { passive: true });
      el.addEventListener('change', () => emit(), { passive: true });

      // Se o plugin emitir CustomEvent('slideStop', {detail:{value:[min,max]}}) ou em ev.value
      ['slideStop', 'slidestop'].forEach((evt) => {
        el.addEventListener(
          evt,
          (ev) => {
            const v =
              ev?.detail?.value ??
              (Array.isArray(ev?.value) ? ev.value.join(',') : el.value);
            emit(v);
          },
          { passive: true },
        );
      });
    };
    bindSlider('input-slider-valor-venda', 'preco_venda');
    bindSlider('input-slider-valor-aluguel', 'preco_aluguel');
    bindSlider('input-slider-area', 'area');
  };

  bindPropertyPage = () => {
    const propertyCode = this.getPropertyCodeFromPage();
    if (!propertyCode) return;

    this.log('Página de propriedade detectada:', propertyCode);
    this.capture('property_page_view', {
      codigo: propertyCode,
      url: location.href,
      title: document.title,
    });

    // CTAs
    const propostaBtn = document.querySelector('.cadastro-proposta-cta');
    if (propostaBtn)
      propostaBtn.addEventListener(
        'click',
        () => {
          this.capture('cta_fazer_proposta_click', {
            codigo: propertyCode,
            href: propostaBtn?.getAttribute('href') || '',
          });
          this.trackFunnelStage('clicked_fazer_proposta');
        },
        { passive: true },
      );

    const alugarBtn = document.querySelector('.cadastro-inquilino-cta');
    if (alugarBtn)
      alugarBtn.addEventListener(
        'click',
        () => {
          this.capture('cta_alugar_imovel_click', {
            codigo: propertyCode,
            href: alugarBtn?.getAttribute('href') || '',
          });
          this.trackFunnelStage('clicked_alugar_imovel');
        },
        { passive: true },
      );

    const maisInfoBtn = document.querySelector(
      'a[data-toggle="modal"][href="#imovel-contato"]',
    );
    if (maisInfoBtn)
      maisInfoBtn.addEventListener(
        'click',
        () => {
          this.capture('cta_mais_informacoes_click', { codigo: propertyCode });
          this.trackFunnelStage('opened_contact_form');
        },
        { passive: true },
      );

    const shareBtn = document.querySelector('a[href="#modal-compartilhar"]');
    if (shareBtn)
      shareBtn.addEventListener(
        'click',
        () => {
          this.capture('property_share_click', { codigo: propertyCode });
        },
        { passive: true },
      );

    const favBtn = document.querySelector('.clb-form-fixed-fav a[data-codigo]');
    if (favBtn)
      favBtn.addEventListener(
        'click',
        () => {
          const isFavorited = !!favBtn?.classList?.contains('favorited');
          this.capture('property_favorite_toggle', {
            codigo: propertyCode,
            action: isFavorited ? 'remove' : 'add',
          });
          this.trackFunnelStage('favorited_property');
        },
        { passive: true },
      );

    // Form de contato (modal) - rastreio robusto
    const calculateFormCompleteness = (fields) => {
      const total = Object.keys(fields).length;
      const filled = Object.values(fields).filter(
        (v) => v && String(v).trim(),
      ).length;
      return Math.round((filled / total) * 100);
    };

    const trackContactForm = () => {
      const start = Date.now();
      const checkModal = setInterval(() => {
        const modal = this.byId('imovel-contato');
        const form = modal ? modal.querySelector('form') : null;
        if (Date.now() - start > 10000) clearInterval(checkModal);
        if (!form) return;

        clearInterval(checkModal);
        this.log('Form de contato encontrado');

        const trackField = (selector, fieldName) => {
          const field = form.querySelector(selector);
          if (!field) return;

          // usar focusin/out pois borbulham
          field.addEventListener(
            'focus',
            () =>
              this.capture('contact_form_field_focus', {
                codigo: propertyCode,
                field: fieldName,
              }),
            { passive: true, capture: true },
          );
          field.addEventListener(
            'blur',
            () => {
              if (String(field.value || '').trim()) {
                this.capture('contact_form_field_filled', {
                  codigo: propertyCode,
                  field: fieldName,
                  has_value: true,
                });
              }
            },
            { passive: true, capture: true },
          );
        };

        trackField('input[name="nome"], input[type="text"]', 'nome');
        trackField('input[name="email"], input[type="email"]', 'email');
        trackField(
          'input[name="celular"], input[name="telefone"], input[type="tel"]',
          'telefone',
        );
        trackField('textarea[name="mensagem"], textarea', 'mensagem');

        form.addEventListener(
          'submit',
          () => {
            const fd = new FormData(form);
            const nome = fd.get('nome') || '';
            const email = fd.get('email') || '';
            const telefone = fd.get('celular') || fd.get('telefone') || '';
            const mensagem = fd.get('mensagem') || '';
            this.capture('contact_form_submit', {
              codigo: propertyCode,
              has_nome: !!nome,
              has_email: !!email,
              has_telefone: !!telefone,
              has_mensagem: !!mensagem,
              form_completeness: calculateFormCompleteness({
                nome,
                email,
                telefone,
                mensagem,
              }),
            });
            this.trackFunnelStage('submitted_contact_form');
            this.capture('conversion_contact_form', {
              codigo: propertyCode,
              contact_type: 'form',
              user_id: this.getUserId(),
              session_id: this.getSessionId(),
            });
          },
          { passive: true },
        );

        // Abandono
        let formStarted = false;
        form.querySelectorAll('input, textarea').forEach((field) => {
          field.addEventListener(
            'input',
            () => {
              if (!formStarted) {
                formStarted = true;
                this.capture('contact_form_started', { codigo: propertyCode });
              }
            },
            { passive: true },
          );
        });

        const detectAbandonment = () => {
          if (!formStarted) return;
          const fd = new FormData(form);
          const hasAny = Array.from(fd.values()).some(
            (v) => v && String(v).trim(),
          );
          if (hasAny)
            this.capture('contact_form_abandoned', {
              codigo: propertyCode,
              partial_data: true,
            });
        };

        const closeBtn = modal.querySelector('[data-dismiss="modal"]');
        // Suporte Bootstrap modal (se presente)
        modal.addEventListener('hidden.bs.modal', detectAbandonment, {
          passive: true,
        });
        if (closeBtn)
          closeBtn.addEventListener('click', detectAbandonment, {
            passive: true,
          });
      }, 500);
    };
    trackContactForm();

    // Galeria
    document
      .querySelectorAll('.swiper-button-next, .swiper-button-prev')
      .forEach((btn) => {
        btn.addEventListener(
          'click',
          () => {
            this.capture('property_gallery_navigation', {
              codigo: propertyCode,
              direction: btn.classList.contains('swiper-button-next')
                ? 'next'
                : 'prev',
            });
          },
          { passive: true },
        );
      });
    document
      .querySelectorAll('.foto-imovel, .swiper-slide')
      .forEach((slide) => {
        slide.addEventListener(
          'click',
          () => this.capture('property_image_click', { codigo: propertyCode }),
          { passive: true },
        );
      });
  };

  // ==========================
  // INIT
  // ==========================
  init = () => {
    if (this.disabled) return;

    // Inicialização
    this.ensureFirstTs();
    this.trackPageView();

    // Logs
    this.log('Inicializando analytics...');
    this.log('API URL:', this.API_URL);
    this.log('Site Key:', this.SITE_KEY);

    // Nova sessão?
    this.getSessionId(); // garante timeout atualizado
    this.bindSessionStart();

    // Bindings
    this.bindGlobalLifecycle();
    this.bindThankYouPage();
    this.bindFiltersDelegated();
    this.bindResultsAndActions();
    this.bindPropertyPage();

    // API pública
    window.MyAnalytics = {
      ...window.MyAnalytics,
      capture: this.capture,
      getUserId: this.getUserId,
      getSessionId: this.getSessionId,
      getJourney: () => this.getLS(this.LS_JOURNEY, []),
      getFunnel: () => this.getLS(this.LS_FUNNEL, []),
      getPropertyCode: this.getPropertyCodeFromPage,
      clearJourney: () => {
        localStorage.removeItem(this.LS_JOURNEY);
        localStorage.removeItem(this.LS_FUNNEL);
        localStorage.removeItem(this.LS_FIRST_TS);
        localStorage.removeItem(this.LS_SESSION);
        localStorage.removeItem(this.LS_TIMEOUT);
      },
      flush: this.flushQueue,
      debug: this.debug,
    };

    this.log('Analytics avançado inicializado ✓');
    this.log('User ID:', this.getUserId());
    this.log('Session ID:', this.getSessionId());
  };
}

// ==========================
// BOOT
// ==========================
(() => {
  const analytics = new InsightHouseAnalytics({
    apiUrl: window.IH_API_URL,
    siteKey: window.IH_SITE_KEY,
    debug: true,
  });

  // DOM Ready helper
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => analytics.init());
})();
