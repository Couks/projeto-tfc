/**
 * Script de Analytics InsightHouse
 *
 * Funcionalidades:
 * - Captura TODOS os filtros de busca (quartos, suites, banheiros, vagas, valores, switches)
 * - Rastreamento de jornada do usuário com ID persistente
 * - Rastreamento de sessão
 * - Funil de conversão
 * - Envio de eventos em lote com keepalive
 * - Retry automático em caso de falha
 */

(() => {
  // Inicializa o objeto global MyAnalytics
  const MyAnalytics = window.MyAnalytics || (window.MyAnalytics = {});
  MyAnalytics.debug = true;

  // Configuração - Atualize estes valores
  const API_URL = window.IH_API_URL || '';
  const SITE_KEY = window.IH_SITE_KEY || '';

  // Verifica se a chave do site está configurada
  if (!SITE_KEY) {
    console.error('[InsightHouse] SITE_KEY não configurada');
    return;
  }

  // =========================================
  // FILA DE EVENTOS E ENVIO EM LOTE
  // =========================================

  // Fila de eventos para envio em lote
  let eventQueue = [];
  const MAX_QUEUE_SIZE = 10; // Tamanho máximo da fila
  const FLUSH_INTERVAL = 3000; // 3 segundos
  let flushTimer = null;

  /**
   * Função envia eventos em lote para o backend NestJS
   */
  const sendBatch = async (events) => {
    if (!events || events.length === 0) return;

    try {
      // Faz requisição POST para o endpoint de eventos em lote
      const response = await fetch(`${API_URL}/api/events/track/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': SITE_KEY, // Chave do site para autenticação
        },
        body: JSON.stringify({ events }),
        keepalive: true, // Mantém conexão viva
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      log('Lote enviado com sucesso:', events.length, 'eventos');
    } catch (error) {
      log('Falha ao enviar lote:', error);
      // Armazena eventos falhados no localStorage para retry
      const failedEvents = JSON.parse(
        localStorage.getItem('ih_failed_events') || '[]',
      );
      failedEvents.push(...events);
      localStorage.setItem(
        'ih_failed_events',
        JSON.stringify(failedEvents.slice(-100)),
      ); // Mantém últimos 100
    }
  };

  /**
   * Função esvazia a fila de eventos
   */
  const flushQueue = () => {
    if (eventQueue.length === 0) return;

    const eventsToSend = [...eventQueue];
    eventQueue = [];
    sendBatch(eventsToSend);
  };

  /**
   * Função agenda o esvaziamento da fila
   */
  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushQueue, FLUSH_INTERVAL);
  };

  /**
   * Função adiciona evento à fila
   */
  const queueEvent = (event) => {
    eventQueue.push(event);

    // Esvazia se a fila estiver cheia
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  };

  // Função de log para debug
  const log = (...args) => {
    if (MyAnalytics.debug) console.log('[InsightHouse]', ...args);
  };

  /**
   * Função tenta reenviar eventos falhados no carregamento da página
   */
  const retryFailedEvents = () => {
    const failedEvents = JSON.parse(
      localStorage.getItem('ih_failed_events') || '[]',
    );
    if (failedEvents.length > 0) {
      log('Tentando reenviar', failedEvents.length, 'eventos falhados');
      sendBatch(failedEvents);
      localStorage.removeItem('ih_failed_events');
    }
  };

  // Tenta reenviar eventos falhados no carregamento
  retryFailedEvents();

  // Esvazia fila quando a página for fechada
  window.addEventListener('beforeunload', () => {
    flushQueue();
  });

  // =========================================
  // FUNÇÕES AUXILIARES
  // =========================================

  // Função adiciona event listener de forma segura
  const safeOn = (el, ev, fn) => {
    if (el) el.addEventListener(ev, fn, { passive: true });
  };

  /**
   * Função captura evento - agora adiciona à fila para envio em lote
   */
  const capture = (eventName, properties = {}) => {
    try {
      // Enriquece propriedades com contexto da jornada do usuário
      const enrichedProps = {
        ...properties,
        ...getUserJourneyContext(),
      };

      // Cria objeto do evento com todas as informações
      const event = {
        name: eventName,
        properties: enrichedProps,
        context: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
        ts: Date.now(),
      };

      queueEvent(event);
      log('Evento adicionado à fila:', eventName, enrichedProps);
    } catch (e) {
      log('Erro ao capturar evento:', e);
    }
  };

  // Funções auxiliares para seleção de elementos
  const byId = (id) => document.getElementById(id);
  const bySelAll = (sel) => Array.from(document.querySelectorAll(sel));

  // =========================================
  // RASTREAMENTO DE JORNADA DO USUÁRIO
  // =========================================

  /**
   * Função obtém ou cria ID persistente do usuário
   * Armazenado no localStorage para rastreamento entre sessões
   */
  const getUserId = () => {
    const STORAGE_KEY = 'ih_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
  };

  /**
   * Função obtém ou cria ID da sessão
   * Expira após 30 minutos de inatividade
   */
  const getSessionId = () => {
    const STORAGE_KEY = 'ih_session_id';
    const TIMEOUT_KEY = 'ih_session_timeout';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

    const now = Date.now();
    const lastActivity = parseInt(localStorage.getItem(TIMEOUT_KEY) || '0');

    let sessionId = localStorage.getItem(STORAGE_KEY);

    // Cria nova sessão se expirou ou não existe
    if (!sessionId || now - lastActivity > SESSION_TIMEOUT) {
      sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);

      // Marca que uma nova sessão foi criada (sem chamar capture para evitar loop)
      localStorage.setItem('ih_new_session_created', 'true');
    }

    // Atualiza última atividade
    localStorage.setItem(TIMEOUT_KEY, now.toString());

    return sessionId;
  };

  /**
   * Função rastreia página na jornada do usuário
   */
  const trackPageView = () => {
    const journeyKey = 'ih_journey_pages';
    const journey = JSON.parse(localStorage.getItem(journeyKey) || '[]');

    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
    };

    journey.push(pageData);

    // Mantém apenas as últimas 20 páginas
    if (journey.length > 20) journey.shift();

    localStorage.setItem(journeyKey, JSON.stringify(journey));

    return journey;
  };

  /**
   * Função obtém contexto da jornada do usuário (adicionado a todos os eventos)
   */
  const getUserJourneyContext = () => {
    const journey = JSON.parse(
      localStorage.getItem('ih_journey_pages') || '[]',
    );

    return {
      user_id: getUserId(),
      session_id: localStorage.getItem('ih_session_id') || 'unknown',
      page_depth: journey.length,
      time_on_site: calculateTimeOnSite(),
      returning_visitor: journey.length > 1,
    };
  };

  /**
   * Função calcula tempo no site
   */
  const calculateTimeOnSite = () => {
    const firstPageTime = parseInt(
      localStorage.getItem('ih_first_page_time') || Date.now().toString(),
    );
    return Math.floor((Date.now() - firstPageTime) / 1000); // segundos
  };

  // Inicializa rastreamento da jornada
  if (!localStorage.getItem('ih_first_page_time')) {
    localStorage.setItem('ih_first_page_time', Date.now().toString());
  }

  // Rastreia visualização da página no carregamento
  trackPageView();

  // =========================================
  // RASTREAMENTO AVANÇADO DE FILTROS
  // =========================================

  /**
   * Função genérica para capturar mudanças com extração de valores
   */
  const onChange = (el, field) => {
    if (!el) return;

    safeOn(el, 'change', (e) => {
      let value = '';

      // Trata diferentes tipos de input
      if (el.type === 'checkbox' || el.type === 'radio') {
        value = el.checked ? el.value : '';
      } else if (el.multiple && el.selectedOptions) {
        value = Array.from(el.selectedOptions)
          .map((opt) => opt.value)
          .join(',');
      } else {
        value = ((e.target && e.target.value) || '').toString();
      }

      capture('search_filter_changed', {
        field: field,
        value: value,
        checked: el.checked || null,
      });
    });
  };

  /**
   * Função rastreia grupos de checkbox (quartos, suites, etc.)
   */
  const trackCheckboxGroup = (name, displayName) => {
    bySelAll(`input[name="${name}"]`).forEach((el) => {
      safeOn(el, 'change', () => {
        const selected = bySelAll(`input[name="${name}"]:checked`).map(
          (input) => input.value,
        );

        capture('search_filter_group_changed', {
          field: displayName,
          selected: selected,
          count: selected.length,
        });
      });
    });
  };

  /**
   * Função rastreia slider com valores de range
   */
  const trackSlider = (sliderId, field) => {
    const slider = byId(sliderId);
    if (!slider) return;

    safeOn(slider, 'change', () => {
      const value = slider.value || '';
      const [min, max] = value.split(',');

      capture('search_filter_range_changed', {
        field: field,
        min: min || '0',
        max: max || 'unlimited',
        raw_value: value,
      });
    });
  };

  /**
   * Função rastreia switches/toggles (todos os checkboxes nos filtros)
   */
  const trackSwitch = (switchId, label) => {
    const switchEl = byId(switchId);
    if (!switchEl) return;

    safeOn(switchEl, 'change', () => {
      capture('search_filter_toggle', {
        field: label,
        enabled: switchEl.checked,
        value: switchEl.value || 'Sim',
      });
    });
  };

  // =========================================
  // INICIALIZA RASTREAMENTO QUANDO DOM ESTIVER PRONTO
  // =========================================

  // Função aguarda DOM estar pronto
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => {
    log('Inicializando analytics avançado...');
    log('API URL:', API_URL);
    log('Site Key:', SITE_KEY);

    // Verifica se uma nova sessão foi criada e envia evento uma única vez
    if (localStorage.getItem('ih_new_session_created') === 'true') {
      localStorage.removeItem('ih_new_session_created');
      capture('session_start', {
        session_id: getSessionId(),
        referrer: document.referrer,
        landing_page: window.location.href,
      });
    }

    // ===== FILTROS BÁSICOS =====

    // Finalidade (Venda/Aluguel)
    onChange(byId('property-status'), 'finalidade');
    bySelAll('.finalidade-alias-button[data-value]').forEach((btn) => {
      safeOn(btn, 'click', () => {
        capture('search_filter_changed', {
          field: 'finalidade',
          value: btn.getAttribute('data-value'),
        });
      });
    });

    // Tipos de Imóvel (seleção múltipla)
    onChange(byId('residencial-property-type'), 'tipo');

    // Cidade(s)
    const city = byId('search-field-cidade');
    onChange(city, 'cidade');
    safeOn(city, 'change', () => {
      const values =
        city && city.selectedOptions
          ? Array.from(city.selectedOptions).map((opt) => opt.value)
          : [];
      if (values.length > 0) {
        capture('search_filter_city', { cidades: values });
      }
    });

    // Bairro / Condomínio
    const bairro = byId('search-field-cidadebairro');
    onChange(bairro, 'bairro');
    safeOn(bairro, 'change', () => {
      const values =
        bairro && bairro.selectedOptions
          ? Array.from(bairro.selectedOptions).map((opt) => opt.value)
          : [];
      if (values.length > 0) {
        capture('search_filter_bairro', { bairros: values });
      }
    });

    // ===== FILTROS AVANÇADOS (AGORA RASTREADOS) =====

    // Quartos (checkboxes - seleção múltipla)
    trackCheckboxGroup('dormitorios[]', 'quartos');

    // Suítes (radio buttons - seleção única)
    trackCheckboxGroup('suites[]', 'suites');

    // Banheiros (radio buttons - seleção única)
    trackCheckboxGroup('banheiros[]', 'banheiros');

    // Vagas (radio buttons - seleção única)
    trackCheckboxGroup('vagas[]', 'vagas');

    // ===== SLIDERS (RANGES) =====

    // Valor de Venda (R$)
    trackSlider('input-slider-valor-venda', 'preco_venda');

    // Valor de Aluguel (R$)
    trackSlider('input-slider-valor-aluguel', 'preco_aluguel');

    // Área (m²)
    trackSlider('input-slider-area', 'area');

    // ===== INPUTS NUMÉRICOS MANUAIS (NOVO) =====

    // Função rastreia inputs numéricos manuais
    const trackNumberInput = (inputId, field) => {
      const input = byId(inputId);
      if (!input) return;

      safeOn(input, 'blur', () => {
        if (input.value) {
          capture('search_filter_manual_input', {
            field: field,
            value: input.value,
          });
        }
      });
    };

    trackNumberInput('input-number-valor-min', 'preco_min_manual');
    trackNumberInput('input-number-valor-max', 'preco_max_manual');
    trackNumberInput('input-number-area-min', 'area_min_manual');
    trackNumberInput('input-number-area-max', 'area_max_manual');

    // ===== SWITCHES/TOGGLES =====

    // Switches básicos
    trackSwitch('filtermobiliado', 'mobiliado');
    trackSwitch('filtersemimobiliado', 'semi_mobiliado');
    trackSwitch('filterpromocao', 'promocao_ofertas');
    trackSwitch('filternovo', 'imovel_novo');
    trackSwitch('filternaplanta', 'na_planta');
    trackSwitch('filterconstrucao', 'em_construcao');
    trackSwitch('filterpermuta', 'aceita_permuta');
    trackSwitch('filterpet', 'pet_friendly');
    trackSwitch('filtersegfianca', 'seguro_fianca');
    trackSwitch('filterproposta', 'reservado');
    trackSwitch('filterpacote', 'valor_total_pacote');

    // ===== FILTROS COMERCIAIS (NOVO) =====

    // Salas (comercial)
    trackCheckboxGroup('salas[]', 'salas_comercial');

    // Galpões (comercial)
    trackCheckboxGroup('galpoes[]', 'galpoes');

    // ===== COMODIDADES (NOVO) =====

    const comodidades = [
      'ArCondicionado',
      'Lareira',
      'Lavanderia',
      'Sauna',
      'Elevador',
    ];

    comodidades.forEach((comodidade) => {
      trackSwitch(
        `${comodidade}-advanced`,
        `comodidade_${comodidade.toLowerCase()}`,
      );
    });

    // ===== LAZER E ESPORTE (NOVO) =====

    const lazer = [
      'Churrasqueira',
      'Piscina',
      'Academia',
      'Playground',
      'SalaoFestas',
      'SalaoJogos',
    ];

    lazer.forEach((item) => {
      trackSwitch(`${item}-advanced`, `lazer_${item.toLowerCase()}`);
    });

    // ===== CÔMODOS (NOVO) =====

    const comodos = ['AreaServico', 'Varanda'];

    comodos.forEach((comodo) => {
      trackSwitch(`${comodo}-advanced`, `comodo_${comodo.toLowerCase()}`);
    });

    // ===== SEGURANÇA (NOVO) =====

    const seguranca = [
      'Alarme',
      'CircuitoFechadoTV',
      'Interfone',
      'Portaria24Hrs',
    ];

    seguranca.forEach((item) => {
      trackSwitch(`${item}-advanced`, `seguranca_${item.toLowerCase()}`);
    });

    log('Todos os filtros inicializados ✓');
  });

  // =========================================
  // RASTREAMENTO DE SUBMISSÃO DE BUSCA (APRIMORADO)
  // =========================================

  /**
   * Função captura estado completo da busca no submit
   */
  const captureSearchSubmit = (source) => {
    // Função obtém valor de campo
    const getVal = (id) => {
      const el = byId(id);
      return el && el.value ? el.value : '';
    };

    // Função obtém valores de seleção múltipla
    const getMultiSelect = (id) => {
      const el = byId(id);
      if (!el || !el.selectedOptions) return [];
      return Array.from(el.selectedOptions).map((opt) => opt.value);
    };

    // Função obtém valores de checkboxes marcados
    const getCheckedValues = (name) => {
      return bySelAll(`input[name="${name}"]:checked`).map((el) => el.value);
    };

    // Função obtém range de slider
    const getSliderRange = (id) => {
      const value = getVal(id);
      const [min, max] = value.split(',');
      return { min: min || '0', max: max || 'unlimited' };
    };

    // Função verifica se checkbox está marcado
    const isChecked = (id) => {
      const el = byId(id);
      return el ? el.checked : false;
    };

    // Constrói payload completo da busca
    const searchData = {
      // Origem da busca
      source: source,
      timestamp: Date.now(),

      // Filtros básicos
      finalidade: getVal('property-status'),
      tipos: getMultiSelect('residencial-property-type'),
      cidades: getMultiSelect('search-field-cidade'),
      bairros: getMultiSelect('search-field-cidadebairro'),

      // Filtros avançados - QUARTOS, SUITES, BANHEIROS, VAGAS
      quartos: getCheckedValues('dormitorios[]'),
      suites: getCheckedValues('suites[]'),
      banheiros: getCheckedValues('banheiros[]'),
      vagas: getCheckedValues('vagas[]'),

      // Filtros comerciais
      salas: getCheckedValues('salas[]'),
      galpoes: getCheckedValues('galpoes[]'),

      // Faixas de preço
      preco_venda: getSliderRange('input-slider-valor-venda'),
      preco_aluguel: getSliderRange('input-slider-valor-aluguel'),

      // Inputs manuais de preço
      preco_min_manual: getVal('input-number-valor-min'),
      preco_max_manual: getVal('input-number-valor-max'),

      // Faixa de área
      area: getSliderRange('input-slider-area'),
      area_min_manual: getVal('input-number-area-min'),
      area_max_manual: getVal('input-number-area-max'),

      // Switches/Toggles
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

      // Contexto da jornada
      journey_length: JSON.parse(
        localStorage.getItem('ih_journey_pages') || '[]',
      ).length,
    };

    capture('search_submit', searchData);

    // Rastreia estágio do funil
    trackFunnelStage('search_submitted');
  };

  // Anexa aos botões de submit
  safeOn(byId('submit-main-search-form'), 'click', () => {
    captureSearchSubmit('main_form');
  });

  safeOn(byId('submit-main-search-form-codigo'), 'click', () => {
    const codigo = getVal('property-codigo');
    capture('search_submit', {
      source: 'codigo',
      codigo: codigo,
    });
    trackFunnelStage('search_by_code');
  });

  // Submit do formulário da sidebar
  bySelAll('.submit-sidebar-search-form').forEach((btn) => {
    safeOn(btn, 'click', () => {
      captureSearchSubmit('sidebar_form');
    });
  });

  // =========================================
  // INTERAÇÕES COM RESULTADOS (APRIMORADO)
  // =========================================

  /**
   * Função rastreia cliques em resultados de propriedades
   */
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;

      const href = (a.getAttribute('href') || '').toString();
      if (!href) return;

      // Clique em página de propriedade
      if (href.indexOf('/imovel/') !== -1) {
        const codigo = extractCodigoFromUrl(href);
        capture('results_item_click', {
          target: href,
          kind: 'imovel',
          codigo: codigo,
        });
        trackFunnelStage('viewed_property');
      }

      // Clique em condomínio
      else if (href.indexOf('/condominio/') !== -1) {
        capture('results_item_click', {
          target: href,
          kind: 'condominio',
        });
      }

      // Botão "SABER MAIS"
      else if (a.classList.contains('button-info-panel')) {
        const codigo = extractCodigoFromParent(a);
        capture('results_saber_mais_click', {
          codigo: codigo,
          href: href,
        });
        trackFunnelStage('clicked_saber_mais');
      }
    },
    { passive: true },
  );

  /**
   * Função extrai código da propriedade da URL
   */
  const extractCodigoFromUrl = (url) => {
    const match = url.match(/\/imovel\/(\d+)\//);
    return match ? match[1] : '';
  };

  /**
   * Função extrai código da propriedade do elemento pai
   */
  const extractCodigoFromParent = (el) => {
    const box = el.closest('.imovel-box-single');
    return box ? box.getAttribute('data-codigo') || '' : '';
  };

  // =========================================
  // RASTREAMENTO DE FAVORITOS (NOVO)
  // =========================================

  document.addEventListener(
    'click',
    (e) => {
      if (
        e.target.classList.contains('btn-favoritar') ||
        e.target.closest('.btn-favoritar')
      ) {
        const btn = e.target.closest('.btn-favoritar') || e.target;
        const codigo = btn.getAttribute('data-codigo');

        capture('favorite_toggle', {
          codigo: codigo,
          action: btn.classList.contains('favorited') ? 'remove' : 'add',
        });

        trackFunnelStage('favorited_property');
      }
    },
    { passive: true },
  );

  // =========================================
  // RASTREAMENTO DE CONVERSÃO (APRIMORADO)
  // =========================================

  // Função rastreia conversões
  const trackConversion = (sel, eventName, label) => {
    bySelAll(sel).forEach((el) => {
      safeOn(el, 'click', () => {
        const codigo = extractCodigoFromParent(el);
        capture(eventName, {
          codigo: codigo,
          href: el.href || '',
        });
        trackFunnelStage(label);
      });
    });
  };

  // WhatsApp
  trackConversion(
    'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
    'conversion_whatsapp_click',
    'contacted_whatsapp',
  );

  // Telefone
  trackConversion(
    'a[href^="tel:"]',
    'conversion_phone_click',
    'contacted_phone',
  );

  // Email
  trackConversion(
    'a[href^="mailto:"]',
    'conversion_email_click',
    'contacted_email',
  );

  // =========================================
  // RASTREAMENTO DE FUNIL
  // =========================================

  /**
   * Função rastreia progressão do usuário através do funil de conversão
   */
  const trackFunnelStage = (stage) => {
    const FUNNEL_KEY = 'ih_funnel_stages';
    const funnel = JSON.parse(localStorage.getItem(FUNNEL_KEY) || '[]');

    const stageData = {
      stage: stage,
      timestamp: Date.now(),
      url: window.location.href,
    };

    funnel.push(stageData);
    localStorage.setItem(FUNNEL_KEY, JSON.stringify(funnel));

    capture('funnel_stage_reached', {
      stage: stage,
      funnel_length: funnel.length,
      previous_stage: funnel[funnel.length - 2]?.stage || 'none',
    });
  };

  /**
   * Função obtém funil completo do usuário
   */
  window.MyAnalytics.getFunnel = () => {
    return JSON.parse(localStorage.getItem('ih_funnel_stages') || '[]');
  };

  // =========================================
  // RASTREAMENTO DE PROFUNDIDADE DE SCROLL (NOVO)
  // =========================================

  let maxScroll = 0;
  const scrollDepths = [25, 50, 75, 100];
  const trackedDepths = new Set();

  window.addEventListener(
    'scroll',
    () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;

      if (scrolled > maxScroll) maxScroll = scrolled;

      scrollDepths.forEach((depth) => {
        if (scrolled >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          capture('scroll_depth', { depth: depth });
        }
      });
    },
    { passive: true },
  );

  // =========================================
  // TEMPO NA PÁGINA (NOVO)
  // =========================================

  const pageLoadTime = Date.now();

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    capture('page_exit', {
      time_on_page: timeOnPage,
      max_scroll_depth: Math.floor(maxScroll),
    });

    // Força esvaziamento da fila
    flushQueue();
  });

  // =========================================
  // RASTREAMENTO DE TOGGLE DE FILTROS AVANÇADOS (NOVO)
  // =========================================

  const advancedTrigger = byId('collapseAdvFilter-trigger');
  safeOn(advancedTrigger, 'click', () => {
    const isExpanded = byId('collapseAdvFilter')?.classList.contains('show');
    capture('advanced_filters_toggle', {
      action: isExpanded ? 'collapse' : 'expand',
    });
  });

  // =========================================
  // RASTREAMENTO DE ORDENAÇÃO (NOVO)
  // =========================================

  bySelAll('.dropdown-orderby ul li a').forEach((link) => {
    safeOn(link, 'click', () => {
      const orderValue = link.getAttribute('data-value');
      capture('results_order_changed', {
        order_by: orderValue,
      });
    });
  });

  // =========================================
  // RASTREAMENTO DE CONVERSÃO NA PÁGINA DE PROPRIEDADE
  // =========================================

  /**
   * Função obtém código da propriedade da página atual
   */
  const getPropertyCodeFromPage = () => {
    // Tenta obter da URL (ex: /imovel/2854/...)
    const match = window.location.pathname.match(/\/imovel\/(\d+)\//);
    if (match) return match[1];

    // Tenta obter do atributo data do botão do formulário
    const formBtn = document.querySelector('a[href*="codigo_imovel="]');
    if (formBtn) {
      const href = formBtn.getAttribute('href') || '';
      const codeMatch = href.match(/codigo_imovel=(\d+)/);
      if (codeMatch) return codeMatch[1];
    }

    return '';
  };

  onReady(() => {
    const propertyCode = getPropertyCodeFromPage();

    if (!propertyCode) return; // Não está na página de propriedade

    log('Página de propriedade detectada, código:', propertyCode);

    // ===== VISUALIZAÇÃO DA PÁGINA DE PROPRIEDADE =====
    capture('property_page_view', {
      codigo: propertyCode,
      url: window.location.href,
      title: document.title,
    });

    // ===== RASTREAMENTO DE BOTÕES CTA =====

    // Botão "FAZER PROPOSTA"
    const propostaBtn = document.querySelector('.cadastro-proposta-cta');
    safeOn(propostaBtn, 'click', () => {
      capture('cta_fazer_proposta_click', {
        codigo: propertyCode,
        href: propostaBtn ? propostaBtn.getAttribute('href') : '',
      });
      trackFunnelStage('clicked_fazer_proposta');
    });

    // Botão "ALUGAR ESTE IMÓVEL"
    const alugarBtn = document.querySelector('.cadastro-inquilino-cta');
    safeOn(alugarBtn, 'click', () => {
      capture('cta_alugar_imovel_click', {
        codigo: propertyCode,
        href: alugarBtn ? alugarBtn.getAttribute('href') : '',
      });
      trackFunnelStage('clicked_alugar_imovel');
    });

    // Botão "MAIS INFORMAÇÕES" (abre modal)
    const maisInfoBtn = document.querySelector(
      'a[data-toggle="modal"][href="#imovel-contato"]',
    );
    safeOn(maisInfoBtn, 'click', () => {
      capture('cta_mais_informacoes_click', {
        codigo: propertyCode,
      });
      trackFunnelStage('opened_contact_form');
    });

    // Botão de compartilhar
    const shareBtn = document.querySelector('a[href="#modal-compartilhar"]');
    safeOn(shareBtn, 'click', () => {
      capture('property_share_click', {
        codigo: propertyCode,
      });
    });

    // Botão de favoritar (página de propriedade)
    const favBtn = document.querySelector('.clb-form-fixed-fav a[data-codigo]');
    safeOn(favBtn, 'click', () => {
      const isFavorited = favBtn && favBtn.classList.contains('favorited');
      capture('property_favorite_toggle', {
        codigo: propertyCode,
        action: isFavorited ? 'remove' : 'add',
      });
      trackFunnelStage('favorited_property');
    });

    // ===== RASTREAMENTO DE FORMULÁRIO DE CONTATO =====

    /**
     * Função rastreia submissão do formulário de contato
     * Monitora o formulário modal (#imovel-contato)
     */
    const trackContactForm = () => {
      // Aguarda modal estar no DOM (pode ser carregado dinamicamente)
      const checkModal = setInterval(() => {
        const modal = byId('imovel-contato');
        const form = modal ? modal.querySelector('form') : null;

        if (!form) return;

        clearInterval(checkModal);
        log('Formulário de contato encontrado, anexando listeners');

        // Rastreia interações com campos do formulário
        const trackFormField = (selector, fieldName) => {
          const field = form.querySelector(selector);
          if (!field) return;

          safeOn(field, 'focus', () => {
            capture('contact_form_field_focus', {
              codigo: propertyCode,
              field: fieldName,
            });
          });

          safeOn(field, 'blur', () => {
            if (field.value) {
              capture('contact_form_field_filled', {
                codigo: propertyCode,
                field: fieldName,
                has_value: true,
              });
            }
          });
        };

        // Rastreia campos individuais
        trackFormField('input[name="nome"], input[type="text"]', 'nome');
        trackFormField('input[name="email"], input[type="email"]', 'email');
        trackFormField(
          'input[name="celular"], input[name="telefone"], input[type="tel"]',
          'telefone',
        );
        trackFormField('textarea[name="mensagem"], textarea', 'mensagem');

        // Rastreia submissão do formulário
        safeOn(form, 'submit', (e) => {
          const formData = new FormData(form);
          const nome = formData.get('nome') || '';
          const email = formData.get('email') || '';
          const telefone =
            formData.get('celular') || formData.get('telefone') || '';
          const mensagem = formData.get('mensagem') || '';

          capture('contact_form_submit', {
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

          // EVENTO PRINCIPAL DE CONVERSÃO
          trackFunnelStage('submitted_contact_form');

          // Marca como convertido
          capture('conversion_contact_form', {
            codigo: propertyCode,
            contact_type: 'form',
            user_id: getUserId(),
            session_id: getSessionId(),
          });
        });

        // Rastreia abandono do formulário
        let formStarted = false;

        form.querySelectorAll('input, textarea').forEach((field) => {
          safeOn(field, 'input', () => {
            if (!formStarted) {
              formStarted = true;
              capture('contact_form_started', {
                codigo: propertyCode,
              });
            }
          });
        });

        // Detecta abandono do formulário no fechamento do modal
        const detectAbandonment = () => {
          if (formStarted) {
            const formData = new FormData(form);
            const hasAnyData = Array.from(formData.values()).some((v) => v);

            if (hasAnyData) {
              capture('contact_form_abandoned', {
                codigo: propertyCode,
                partial_data: true,
              });
            }
          }
        };

        // Escuta fechamento do modal
        const modalElement = byId('imovel-contato');
        if (modalElement) {
          safeOn(modalElement, 'hidden.bs.modal', detectAbandonment);

          // Também tenta botão de fechar
          const closeBtn = modalElement.querySelector('[data-dismiss="modal"]');
          safeOn(closeBtn, 'click', detectAbandonment);
        }
      }, 500); // Verifica a cada 500ms

      // Para verificação após 10 segundos
      setTimeout(() => clearInterval(checkModal), 10000);
    };

    // Inicializa rastreamento do formulário de contato
    trackContactForm();

    // ===== INTERAÇÕES DO PAINEL DE INFORMAÇÕES DA PROPRIEDADE (NOVO) =====

    // Rastreia interações da galeria de imagens
    bySelAll('.swiper-button-next, .swiper-button-prev').forEach((btn) => {
      safeOn(btn, 'click', () => {
        capture('property_gallery_navigation', {
          codigo: propertyCode,
          direction: btn.classList.contains('swiper-button-next')
            ? 'next'
            : 'prev',
        });
      });
    });

    // Rastreia cliques em imagens (abre tela cheia)
    bySelAll('.foto-imovel, .swiper-slide').forEach((slide) => {
      safeOn(slide, 'click', () => {
        capture('property_image_click', {
          codigo: propertyCode,
        });
      });
    });
  }); // Fim do rastreamento da página de propriedade

  // =========================================
  // RASTREAMENTO DE TAXA DE REJEIÇÃO E BOUNCE
  // =========================================

  /**
   * Função calcula indicadores de taxa de bounce
   */
  const trackBounceIndicators = () => {
    const journey = JSON.parse(
      localStorage.getItem('ih_journey_pages') || '[]',
    );
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);

    // Bounce se:
    // - Apenas 1 página na jornada
    // - Menos de 10 segundos na página
    // - Sem interações
    const isBounce = journey.length <= 1 && timeOnPage < 10;

    // Saída rápida se:
    // - Menos de 30 segundos
    // - Menos de 25% de scroll
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

  window.addEventListener('beforeunload', trackBounceIndicators);

  // =========================================
  // FUNÇÕES AUXILIARES
  // =========================================

  /**
   * Função calcula porcentagem de completude do formulário
   */
  const calculateFormCompleteness = (fields) => {
    const totalFields = Object.keys(fields).length;
    const filledFields = Object.values(fields).filter(
      (v) => v && v.toString().trim(),
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  /**
   * Função obtém valor de campo do formulário
   */
  const getVal = (id) => {
    const el = byId(id);
    return el && el.value ? el.value : '';
  };

  // =========================================
  // API DE EXPORTAÇÃO PARA USO EXTERNO
  // =========================================

  window.MyAnalytics = {
    ...MyAnalytics,
    capture: capture,
    getUserId: getUserId,
    getSessionId: getSessionId,
    getJourney: () =>
      JSON.parse(localStorage.getItem('ih_journey_pages') || '[]'),
    getFunnel: () =>
      JSON.parse(localStorage.getItem('ih_funnel_stages') || '[]'),
    getPropertyCode: getPropertyCodeFromPage,
    clearJourney: () => {
      localStorage.removeItem('ih_journey_pages');
      localStorage.removeItem('ih_funnel_stages');
      localStorage.removeItem('ih_first_page_time');
      localStorage.removeItem('ih_session_id');
      localStorage.removeItem('ih_session_timeout');
    },
    flush: flushQueue, // Esvaziamento manual
    debug: MyAnalytics.debug,
  };

  log('Analytics avançado inicializado ✓');
  log('User ID:', getUserId());
  log('Session ID:', getSessionId());
})();
