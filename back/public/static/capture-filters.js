/**
 * =============================================================================
 * InsightHouse Analytics SDK - Script de Captura de Eventos
 * =============================================================================
 *
 * Este script é responsável por capturar e rastrear todos os eventos de
 * interação do usuário em sites de imóveis, incluindo:
 *
 * FUNCIONALIDADES PRINCIPAIS:
 * ----------------------------
 * 1. Captura de Filtros de Busca
 *    - Filtros básicos (finalidade, tipo, cidade, bairro)
 *    - Filtros avançados (quartos, suítes, banheiros, vagas)
 *    - Sliders de preço e área (venda/aluguel)
 *    - Inputs numéricos manuais
 *    - Switches/toggles (mobiliado, pet friendly, etc.)
 *    - Comodidades, lazer, segurança
 *
 * 2. Rastreamento de Jornada do Usuário
 *    - ID persistente do usuário (armazenado no localStorage)
 *    - ID de sessão (expira após 30min de inatividade)
 *    - Histórico de páginas visitadas (últimas 20)
 *    - Tempo no site
 *    - Visitante recorrente vs novo
 *
 * 3. Funil de Conversão
 *    - Rastreamento de estágios do funil
 *    - Eventos: busca → visualização → interesse → contato → conversão
 *    - Histórico completo armazenado no localStorage
 *
 * 4. Envio de Eventos em Lote
 *    - Fila de eventos para otimizar requisições HTTP
 *    - Envio automático quando a fila atinge 10 eventos ou após 3 segundos
 *    - Retry automático de eventos falhados
 *    - Armazenamento de eventos falhados no localStorage
 *
 * 5. Métricas Avançadas
 *    - Profundidade de scroll (25%, 50%, 75%, 100%)
 *    - Tempo na página
 *    - Taxa de bounce (hard bounce e quick exit)
 *    - Interações com formulários de contato
 *    - Rastreamento de conversões (WhatsApp, telefone, email, formulário)
 *
 * CONFIGURAÇÃO:
 * ------------
 * O script espera as seguintes variáveis globais:
 * - window.IH_API_URL: URL base da API (ex: 'https://api.matheuscastroks.com.br')
 * - window.IH_SITE_KEY: Chave única do site para autenticação
 *
 * Exemplo de uso:
 * <script>
 *   window.IH_API_URL = 'https://api.matheuscastroks.com.br';
 *   window.IH_SITE_KEY = 'site-key-123';
 * </script>
 * <script src="/static/capture-filters.js"></script>
 *
 * API PÚBLICA:
 * -----------
 * Após o carregamento, o script expõe a API global `window.MyAnalytics`:
 *
 * - MyAnalytics.capture(eventName, properties)
 *   Captura um evento customizado
 *
 * - MyAnalytics.getUserId()
 *   Retorna o ID persistente do usuário
 *
 * - MyAnalytics.getSessionId()
 *   Retorna o ID da sessão atual
 *
 * - MyAnalytics.getJourney()
 *   Retorna o array com a jornada completa do usuário
 *
 * - MyAnalytics.getFunnel()
 *   Retorna o array com os estágios do funil de conversão
 *
 * - MyAnalytics.getPropertyCode()
 *   Retorna o código da propriedade da página atual (se aplicável)
 *
 * - MyAnalytics.clearJourney()
 *   Limpa todos os dados de jornada e sessão
 *
 * - MyAnalytics.flush()
 *   Força o envio imediato de todos os eventos na fila
 *
 * - MyAnalytics.debug
 *   Flag para habilitar/desabilitar logs no console
 *
 * EVENTOS CAPTURADOS:
 * -------------------
 * - search_filter_changed: Mudança em qualquer filtro
 * - search_filter_group_changed: Mudança em grupo de checkboxes
 * - search_filter_range_changed: Mudança em slider de range
 * - search_filter_toggle: Mudança em switch/toggle
 * - search_submit: Submissão do formulário de busca
 * - results_item_click: Clique em resultado de propriedade
 * - property_page_view: Visualização de página de propriedade
 * - favorite_toggle: Favoritar/desfavoritar propriedade
 * - conversion_*: Eventos de conversão (WhatsApp, telefone, email, form)
 * - funnel_stage_reached: Progressão no funil de conversão
 * - scroll_depth: Profundidade de scroll atingida
 * - page_exit: Saída da página
 * - bounce_detected: Detecção de bounce
 * - contact_form_*: Eventos relacionados ao formulário de contato
 *
 * =============================================================================
 */

(() => {
  ('use strict');

  // ===========================================================================
  // INICIALIZAÇÃO E CONFIGURAÇÃO
  // ===========================================================================

  /**
   * Inicializa ou reutiliza o objeto global MyAnalytics
   * Permite que múltiplas instâncias do script compartilhem o mesmo objeto
   */
  const MyAnalytics = window.MyAnalytics || (window.MyAnalytics = {});
  MyAnalytics.debug = true; // Habilita logs no console para debug

  /**
   * Configuração da API
   * @type {string} API_URL - URL base da API backend
   * @type {string} SITE_KEY - Chave única do site para autenticação multi-tenant
   *
   * Valores podem ser definidos via variáveis globais antes do carregamento do script:
   * window.IH_API_URL = 'https://api.example.com';
   * window.IH_SITE_KEY = 'site-key-123';
   */
  const API_URL = window.IH_API_URL || 'http://localhost:3001';
  const SITE_KEY = window.IH_SITE_KEY || '';

  /**
   * Validação da configuração
   * Se a SITE_KEY não estiver configurada, o script não executa
   */
  if (!SITE_KEY) {
    console.error(
      '[InsightHouse] ERRO: SITE_KEY não configurada. Defina window.IH_SITE_KEY antes de carregar o script.',
    );
    return;
  }

  // ===========================================================================
  // SISTEMA DE FILA DE EVENTOS E ENVIO EM LOTE
  // ===========================================================================

  /**
   * FILA DE EVENTOS
   * ---------------
   * Sistema otimizado de envio em lote que:
   * - Agrupa eventos em uma fila
   * - Envia automaticamente quando a fila atinge MAX_QUEUE_SIZE (10 eventos)
   * - Ou envia após FLUSH_INTERVAL (3 segundos) de inatividade
   * - Reduz número de requisições HTTP e melhora performance
   */

  /** @type {Array<Object>} Fila de eventos aguardando envio */
  let eventQueue = [];

  /** @type {number} Tamanho máximo da fila antes de envio automático */
  const MAX_QUEUE_SIZE = 10;

  /** @type {number} Intervalo em ms para envio automático (3 segundos) */
  const FLUSH_INTERVAL = 3000;

  /** @type {number|null} Timer para envio automático agendado */
  let flushTimer = null;

  /**
   * Envia um lote de eventos para o backend via API
   *
   * @param {Array<Object>} events - Array de eventos para enviar
   * @returns {Promise<void>}
   *
   * COMPORTAMENTO:
   * - Faz requisição POST para /api/events/track/batch
   * - Inclui header X-Site-Key para autenticação multi-tenant
   * - Usa keepalive para manter conexão viva (melhora performance)
   * - Em caso de falha, armazena eventos no localStorage para retry posterior
   * - Mantém apenas últimos 100 eventos falhados (evita overflow)
   */
  const sendBatch = async (events) => {
    if (!events || events.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/api/events/track/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Key': SITE_KEY, // Header de autenticação multi-tenant
        },
        body: JSON.stringify({ events }),
        keepalive: true, // Mantém conexão HTTP viva para melhor performance
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      log('✓ Lote enviado com sucesso:', events.length, 'eventos');
    } catch (error) {
      log('✗ Falha ao enviar lote:', error);
      // Armazena eventos falhados no localStorage para retry posterior
      const failedEvents = JSON.parse(
        localStorage.getItem('ih_failed_events') || '[]',
      );
      failedEvents.push(...events);
      // Mantém apenas últimos 100 eventos para evitar overflow do localStorage
      localStorage.setItem(
        'ih_failed_events',
        JSON.stringify(failedEvents.slice(-100)),
      );
    }
  };

  /**
   * Esvazia a fila de eventos enviando todos para o backend
   *
   * COMPORTAMENTO:
   * - Copia todos os eventos da fila
   * - Limpa a fila imediatamente
   * - Envia os eventos copiados em lote
   * - Evita perda de eventos se novos eventos forem adicionados durante o envio
   */
  const flushQueue = () => {
    if (eventQueue.length === 0) return;

    const eventsToSend = [...eventQueue]; // Copia todos os eventos
    eventQueue = []; // Limpa a fila imediatamente
    sendBatch(eventsToSend);
  };

  /**
   * Agenda o esvaziamento da fila após um intervalo
   *
   * COMPORTAMENTO:
   * - Cancela timer anterior se existir (evita múltiplos agendamentos)
   * - Agenda novo envio após FLUSH_INTERVAL (3 segundos)
   * - Garante que eventos sejam enviados mesmo se a fila não encher
   */
  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushQueue, FLUSH_INTERVAL);
  };

  /**
   * Adiciona um evento à fila de envio
   *
   * @param {Object} event - Objeto do evento com estrutura padrão
   *
   * COMPORTAMENTO:
   * - Adiciona evento à fila
   * - Se a fila atingir MAX_QUEUE_SIZE (10), envia imediatamente
   * - Caso contrário, agenda envio após FLUSH_INTERVAL (3 segundos)
   * - Otimiza balanceamento entre latência e número de requisições
   */
  const queueEvent = (event) => {
    eventQueue.push(event);

    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      // Fila cheia: envia imediatamente
      flushQueue();
    } else {
      // Agenda envio após intervalo
      scheduleFlush();
    }
  };

  /**
   * Função auxiliar para logging condicional
   *
   * @param {...any} args - Argumentos para log
   *
   * Logs só aparecem se MyAnalytics.debug === true
   * Útil para debug em desenvolvimento sem poluir console em produção
   */
  const log = (...args) => {
    if (MyAnalytics.debug) console.log('[InsightHouse]', ...args);
  };

  /**
   * Tenta reenviar eventos que falharam em envios anteriores
   *
   * COMPORTAMENTO:
   * - Executa no carregamento da página
   * - Lê eventos falhados do localStorage
   * - Tenta reenviar todos os eventos
   * - Remove eventos do localStorage após tentativa (sucesso ou falha)
   * - Garante que eventos não sejam perdidos mesmo após falhas de rede
   */
  const retryFailedEvents = () => {
    const failedEvents = JSON.parse(
      localStorage.getItem('ih_failed_events') || '[]',
    );
    if (failedEvents.length > 0) {
      log('🔄 Tentando reenviar', failedEvents.length, 'eventos falhados');
      sendBatch(failedEvents);
      localStorage.removeItem('ih_failed_events');
    }
  };

  // Tenta reenviar eventos falhados no carregamento da página
  retryFailedEvents();

  /**
   * Garante envio de eventos pendentes antes da página fechar
   *
   * Event listener para 'beforeunload' força o esvaziamento da fila
   * quando o usuário está saindo da página, evitando perda de eventos
   */
  window.addEventListener('beforeunload', () => {
    flushQueue();
  });

  // ===========================================================================
  // FUNÇÕES AUXILIARES DE DOM
  // ===========================================================================

  /**
   * Adiciona event listener de forma segura (verifica se elemento existe)
   *
   * @param {HTMLElement|null} el - Elemento DOM
   * @param {string} ev - Nome do evento
   * @param {Function} fn - Função callback
   *
   * Usa { passive: true } para melhorar performance de scroll
   */
  const safeOn = (el, ev, fn) => {
    if (el) el.addEventListener(ev, fn, { passive: true });
  };

  /**
   * Seleção rápida de elementos por ID
   *
   * @param {string} id - ID do elemento
   * @returns {HTMLElement|null}
   */
  const byId = (id) => document.getElementById(id);

  /**
   * Seleção de múltiplos elementos por seletor CSS
   *
   * @param {string} sel - Seletor CSS
   * @returns {Array<HTMLElement>}
   */
  const bySelAll = (sel) => Array.from(document.querySelectorAll(sel));

  // ===========================================================================
  // SISTEMA DE CAPTURA DE EVENTOS
  // ===========================================================================

  /**
   * Função principal de captura de eventos
   *
   * @param {string} eventName - Nome do evento (ex: 'search_submit')
   * @param {Object} properties - Propriedades customizadas do evento
   *
   * COMPORTAMENTO:
   * 1. Enriquece propriedades com contexto da jornada do usuário
   * 2. Adiciona contexto técnico (URL, referrer, user agent, viewport, etc.)
   * 3. Adiciona timestamp do evento
   * 4. Adiciona à fila para envio em lote
   *
   * ESTRUTURA DO EVENTO:
   * {
   *   name: "event_name",
   *   properties: { ...customProps, ...journeyContext },
   *   context: {
   *     url: "https://...",
   *     title: "Page Title",
   *     referrer: "https://...",
   *     userAgent: "...",
   *     screen: { width: 1920, height: 1080 },
   *     viewport: { width: 1440, height: 900 }
   *   },
   *   ts: 1234567890
   * }
   */
  const capture = (eventName, properties = {}) => {
    try {
      // Enriquece propriedades com contexto da jornada do usuário
      const enrichedProps = {
        ...properties,
        ...getUserJourneyContext(), // user_id, session_id, page_depth, etc.
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
        ts: Date.now(), // Timestamp Unix em milissegundos
      };

      queueEvent(event);
      log('📊 Evento adicionado à fila:', eventName, enrichedProps);
    } catch (e) {
      log('✗ Erro ao capturar evento:', e);
    }
  };

  // ===========================================================================
  // SISTEMA DE RASTREAMENTO DE JORNADA DO USUÁRIO
  // ===========================================================================

  /**
   * JORNADA DO USUÁRIO
   * ------------------
   * Sistema que rastreia o comportamento do usuário ao longo do tempo:
   *
   * - ID persistente: Identifica o mesmo usuário entre sessões
   * - ID de sessão: Identifica sessões individuais (expira após 30min)
   * - Histórico de páginas: Últimas 20 páginas visitadas
   * - Tempo no site: Calculado desde a primeira visita
   * - Visitante recorrente: Detecta se é primeira visita ou retorno
   */

  /**
   * Obtém ou cria ID persistente do usuário
   *
   * @returns {string} ID único do usuário (ex: "user_1234567890_abc123")
   *
   * COMPORTAMENTO:
   * - Armazena no localStorage com chave 'ih_user_id'
   * - Se não existir, gera novo ID baseado em timestamp + random
   * - ID persiste entre sessões e navegadores (mesmo domínio)
   * - Permite rastreamento de usuário recorrente
   */
  const getUserId = () => {
    const STORAGE_KEY = 'ih_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
      // Gera ID único: user_{timestamp}_{random}
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
  };

  /**
   * Obtém ou cria ID da sessão atual
   *
   * @returns {string} ID único da sessão (ex: "session_1234567890_abc123")
   *
   * COMPORTAMENTO:
   * - Sessão expira após 30 minutos de inatividade
   * - Armazena timestamp da última atividade
   * - Cria nova sessão se expirou ou não existe
   * - Atualiza timestamp a cada acesso
   * - Marca criação de nova sessão para envio de evento 'session_start'
   */
  const getSessionId = () => {
    const STORAGE_KEY = 'ih_session_id';
    const TIMEOUT_KEY = 'ih_session_timeout';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos

    const now = Date.now();
    const lastActivity = parseInt(localStorage.getItem(TIMEOUT_KEY) || '0');

    let sessionId = localStorage.getItem(STORAGE_KEY);

    // Cria nova sessão se expirou ou não existe
    if (!sessionId || now - lastActivity > SESSION_TIMEOUT) {
      sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);

      // Marca que uma nova sessão foi criada
      // (será detectado no onReady para enviar evento 'session_start')
      localStorage.setItem('ih_new_session_created', 'true');
    }

    // Atualiza timestamp da última atividade
    localStorage.setItem(TIMEOUT_KEY, now.toString());

    return sessionId;
  };

  /**
   * Rastreia visualização de página na jornada do usuário
   *
   * @returns {Array<Object>} Array completo da jornada
   *
   * COMPORTAMENTO:
   * - Adiciona página atual ao histórico
   * - Armazena: URL, título e timestamp
   * - Mantém apenas últimas 20 páginas (remove mais antigas)
   * - Armazenado no localStorage com chave 'ih_journey_pages'
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

    // Mantém apenas as últimas 20 páginas para evitar overflow
    if (journey.length > 20) journey.shift();

    localStorage.setItem(journeyKey, JSON.stringify(journey));

    return journey;
  };

  /**
   * Obtém contexto completo da jornada do usuário
   *
   * @returns {Object} Objeto com contexto da jornada
   *
   * RETORNA:
   * {
   *   user_id: "user_123...",
   *   session_id: "session_123...",
   *   page_depth: 5,              // Quantidade de páginas visitadas
   *   time_on_site: 3600,          // Tempo em segundos desde primeira visita
   *   returning_visitor: true      // true se visitou mais de 1 página
   * }
   *
   * Este contexto é automaticamente adicionado a TODOS os eventos capturados
   */
  const getUserJourneyContext = () => {
    const journey = JSON.parse(
      localStorage.getItem('ih_journey_pages') || '[]',
    );

    return {
      user_id: getUserId(),
      session_id: localStorage.getItem('ih_session_id') || 'unknown',
      page_depth: journey.length, // Quantidade de páginas na jornada
      time_on_site: calculateTimeOnSite(), // Tempo total no site em segundos
      returning_visitor: journey.length > 1, // Mais de 1 página = visitante recorrente
    };
  };

  /**
   * Calcula tempo total no site desde a primeira visita
   *
   * @returns {number} Tempo em segundos
   *
   * COMPORTAMENTO:
   * - Lê timestamp da primeira página visitada do localStorage
   * - Se não existir, usa timestamp atual (primeira visita)
   * - Calcula diferença em segundos
   */
  const calculateTimeOnSite = () => {
    const firstPageTime = parseInt(
      localStorage.getItem('ih_first_page_time') || Date.now().toString(),
    );
    return Math.floor((Date.now() - firstPageTime) / 1000); // Retorna segundos
  };

  // Inicializa rastreamento da jornada
  // Armazena timestamp da primeira página se ainda não existe
  if (!localStorage.getItem('ih_first_page_time')) {
    localStorage.setItem('ih_first_page_time', Date.now().toString());
  }

  // Rastreia visualização da página atual no carregamento
  trackPageView();

  // ===========================================================================
  // SISTEMA DE CAPTURA DE FILTROS DE BUSCA
  // ===========================================================================

  /**
   * CAPTURA DE FILTROS
   * ------------------
   * Sistema que rastreia TODAS as interações do usuário com filtros de busca:
   *
   * - Filtros básicos: finalidade, tipo, cidade, bairro
   * - Filtros avançados: quartos, suítes, banheiros, vagas
   * - Sliders: preço (venda/aluguel), área
   * - Inputs numéricos: valores manuais de preço e área
   * - Switches: mobiliado, pet friendly, promoção, etc.
   * - Comodidades: ar condicionado, lareira, elevador, etc.
   * - Lazer: piscina, academia, churrasqueira, etc.
   * - Segurança: alarme, portaria 24h, etc.
   */

  /**
   * Captura mudanças em qualquer campo de formulário
   *
   * @param {HTMLElement|null} el - Elemento do formulário
   * @param {string} field - Nome do campo para identificação
   *
   * COMPORTAMENTO:
   * - Detecta evento 'change' no elemento
   * - Extrai valor baseado no tipo de input:
   *   - checkbox/radio: valor se marcado, string vazia se desmarcado
   *   - select múltiplo: array de valores selecionados (join com vírgula)
   *   - outros: valor direto do campo
   * - Captura evento 'search_filter_changed' com field e value
   */
  const onChange = (el, field) => {
    if (!el) return;

    safeOn(el, 'change', (e) => {
      let value = '';

      // Trata diferentes tipos de input
      if (el.type === 'checkbox' || el.type === 'radio') {
        value = el.checked ? el.value : '';
      } else if (el.multiple && el.selectedOptions) {
        // Select múltiplo: une valores com vírgula
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
   * Rastreia grupos de checkboxes/radio buttons (seleção múltipla ou única)
   *
   * @param {string} name - Nome do grupo (ex: 'dormitorios[]')
   * @param {string} displayName - Nome amigável para exibição (ex: 'quartos')
   *
   * COMPORTAMENTO:
   * - Encontra todos os inputs com o mesmo name
   * - Detecta mudança em qualquer input do grupo
   * - Captura todos os valores selecionados (checked)
   * - Envia evento 'search_filter_group_changed' com array de selecionados
   *
   * USADO PARA:
   * - Quartos (múltipla seleção)
   * - Suítes (radio - seleção única)
   * - Banheiros (radio - seleção única)
   * - Vagas (radio - seleção única)
   */
  const trackCheckboxGroup = (name, displayName) => {
    bySelAll(`input[name="${name}"]`).forEach((el) => {
      safeOn(el, 'change', () => {
        // Obtém todos os valores selecionados do grupo
        const selected = bySelAll(`input[name="${name}"]:checked`).map(
          (input) => input.value,
        );

        capture('search_filter_group_changed', {
          field: displayName,
          selected: selected, // Array de valores selecionados
          count: selected.length, // Quantidade selecionada
        });
      });
    });
  };

  /**
   * Rastreia sliders com valores de range (min, max)
   *
   * @param {string} sliderId - ID do elemento slider
   * @param {string} field - Nome do campo (ex: 'preco_venda')
   *
   * COMPORTAMENTO:
   * - Detecta evento 'change' no slider
   * - Extrai valor que deve estar no formato "min,max"
   * - Separa em min e max
   * - Captura evento 'search_filter_range_changed'
   *
   * USADO PARA:
   * - Preço de venda (R$)
   * - Preço de aluguel (R$)
   * - Área (m²)
   */
  const trackSlider = (sliderId, field) => {
    const slider = byId(sliderId);
    if (!slider) return;

    safeOn(slider, 'change', () => {
      const value = slider.value || '';
      const [min, max] = value.split(','); // Formato esperado: "min,max"

      capture('search_filter_range_changed', {
        field: field,
        min: min || '0',
        max: max || 'unlimited',
        raw_value: value,
      });
    });
  };

  /**
   * Rastreia switches/toggles (checkboxes booleanos)
   *
   * @param {string} switchId - ID do elemento switch
   * @param {string} label - Label descritivo (ex: 'mobiliado')
   *
   * COMPORTAMENTO:
   * - Detecta evento 'change' no switch
   * - Captura estado (enabled/disabled) e valor
   * - Envia evento 'search_filter_toggle'
   *
   * USADO PARA:
   * - Mobiliado, semi-mobiliado
   * - Promoção, imóvel novo
   * - Pet friendly, seguro fiança
   * - Aceita permuta, etc.
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

  // ===========================================================================
  // INICIALIZAÇÃO DO RASTREAMENTO DE FILTROS
  // ===========================================================================

  /**
   * Aguarda DOM estar pronto antes de inicializar listeners
   *
   * @param {Function} fn - Função a executar quando DOM estiver pronto
   *
   * COMPORTAMENTO:
   * - Se DOM já está carregado, executa imediatamente
   * - Caso contrário, aguarda evento 'DOMContentLoaded'
   * - Usa { once: true } para garantir execução única
   */
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  /**
   * INICIALIZAÇÃO PRINCIPAL DOS FILTROS
   * ------------------------------------
   * Esta função é executada quando o DOM está pronto e configura
   * todos os event listeners para captura de filtros
   */
  onReady(() => {
    log('🚀 Inicializando analytics avançado...');
    log('📍 API URL:', API_URL);
    log('🔑 Site Key:', SITE_KEY);

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
    // Também rastreia botões de finalidade (se existirem)
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

    // Cidade(s) - seleção múltipla
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

    // Bairro / Condomínio - seleção múltipla
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

    // ===== FILTROS AVANÇADOS =====

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

    // ===== INPUTS NUMÉRICOS MANUAIS =====

    /**
     * Rastreia inputs numéricos manuais (valores digitados diretamente)
     *
     * @param {string} inputId - ID do input
     * @param {string} field - Nome do campo
     *
     * COMPORTAMENTO:
     * - Detecta evento 'blur' (quando usuário sai do campo)
     * - Captura apenas se campo tiver valor
     * - Envia evento 'search_filter_manual_input'
     */
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

    // ===== SWITCHES/TOGGLES BÁSICOS =====

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

    // ===== FILTROS COMERCIAIS =====

    // Salas (comercial)
    trackCheckboxGroup('salas[]', 'salas_comercial');

    // Galpões (comercial)
    trackCheckboxGroup('galpoes[]', 'galpoes');

    // ===== COMODIDADES =====

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

    // ===== LAZER E ESPORTE =====

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

    // ===== CÔMODOS =====

    const comodos = ['AreaServico', 'Varanda'];

    comodos.forEach((comodo) => {
      trackSwitch(`${comodo}-advanced`, `comodo_${comodo.toLowerCase()}`);
    });

    // ===== SEGURANÇA =====

    const seguranca = [
      'Alarme',
      'CircuitoFechadoTV',
      'Interfone',
      'Portaria24Hrs',
    ];

    seguranca.forEach((item) => {
      trackSwitch(`${item}-advanced`, `seguranca_${item.toLowerCase()}`);
    });

    log('✅ Todos os filtros inicializados ✓');
  });

  // ===========================================================================
  // CAPTURA DE SUBMISSÃO DE FORMULÁRIO DE BUSCA
  // ===========================================================================

  /**
   * Captura estado completo da busca no momento do submit
   *
   * @param {string} source - Origem do submit ('main_form', 'sidebar_form', 'codigo')
   *
   * COMPORTAMENTO:
   * - Lê TODOS os campos do formulário de busca
   * - Constrói payload completo com todos os filtros ativos
   * - Inclui: filtros básicos, avançados, sliders, switches, comodidades, etc.
   * - Envia evento 'search_submit' com payload completo
   * - Rastreia estágio 'search_submitted' no funil
   *
   * PAYLOAD INCLUI:
   * - Filtros básicos: finalidade, tipos, cidades, bairros
   * - Filtros avançados: quartos, suites, banheiros, vagas
   * - Faixas de preço: venda, aluguel (min/max)
   * - Faixa de área (min/max)
   * - Todos os switches/toggles
   * - Comodidades, lazer, segurança
   * - Contexto da jornada (journey_length)
   */
  const captureSearchSubmit = (source) => {
    // Função obtém valor de campo por ID
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

    // Função obtém valores de checkboxes marcados por name
    const getCheckedValues = (name) => {
      return bySelAll(`input[name="${name}"]:checked`).map((el) => el.value);
    };

    // Função obtém range de slider (min, max)
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

      // Faixas de preço (sliders)
      preco_venda: getSliderRange('input-slider-valor-venda'),
      preco_aluguel: getSliderRange('input-slider-valor-aluguel'),

      // Inputs manuais de preço
      preco_min_manual: getVal('input-number-valor-min'),
      preco_max_manual: getVal('input-number-valor-max'),

      // Faixa de área (slider)
      area: getSliderRange('input-slider-area'),
      area_min_manual: getVal('input-number-area-min'),
      area_max_manual: getVal('input-number-area-max'),

      // Switches/Toggles básicos
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

      // Comodidades (objeto com booleanos)
      comodidades: {
        ar_condicionado: isChecked('ArCondicionado-advanced'),
        lareira: isChecked('Lareira-advanced'),
        lavanderia: isChecked('Lavanderia-advanced'),
        sauna: isChecked('Sauna-advanced'),
        elevador: isChecked('Elevador-advanced'),
      },

      // Lazer (objeto com booleanos)
      lazer: {
        churrasqueira: isChecked('Churrasqueira-advanced'),
        piscina: isChecked('Piscina-advanced'),
        academia: isChecked('Academia-advanced'),
        playground: isChecked('Playground-advanced'),
        salao_festas: isChecked('SalaoFestas-advanced'),
        salao_jogos: isChecked('SalaoJogos-advanced'),
      },

      // Cômodos (objeto com booleanos)
      comodos: {
        area_servico: isChecked('AreaServico-advanced'),
        varanda: isChecked('Varanda-advanced'),
      },

      // Segurança (objeto com booleanos)
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

  // Anexa aos botões de submit do formulário principal
  safeOn(byId('submit-main-search-form'), 'click', () => {
    captureSearchSubmit('main_form');
  });

  // Submit por código de imóvel
  safeOn(byId('submit-main-search-form-codigo'), 'click', () => {
    const codigo = getVal('property-codigo');
    capture('search_submit', {
      source: 'codigo',
      codigo: codigo,
    });
    trackFunnelStage('search_by_code');
  });

  // Submit do formulário da sidebar (se existir)
  bySelAll('.submit-sidebar-search-form').forEach((btn) => {
    safeOn(btn, 'click', () => {
      captureSearchSubmit('sidebar_form');
    });
  });

  // ===========================================================================
  // RASTREAMENTO DE INTERAÇÕES COM RESULTADOS
  // ===========================================================================

  /**
   * Rastreia cliques em resultados de propriedades
   *
   * COMPORTAMENTO:
   * - Usa event delegation para capturar cliques em links
   * - Detecta cliques em páginas de propriedade (/imovel/...)
   * - Detecta cliques em condomínios (/condominio/...)
   * - Detecta cliques em botão "SABER MAIS"
   * - Extrai código da propriedade da URL ou elemento
   * - Rastreia estágio 'viewed_property' no funil
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
   * Extrai código da propriedade da URL
   *
   * @param {string} url - URL da propriedade (ex: "/imovel/2854/...")
   * @returns {string} Código da propriedade ou string vazia
   */
  const extractCodigoFromUrl = (url) => {
    const match = url.match(/\/imovel\/(\d+)\//);
    return match ? match[1] : '';
  };

  /**
   * Extrai código da propriedade do elemento pai
   *
   * @param {HTMLElement} el - Elemento clicado
   * @returns {string} Código da propriedade do atributo data-codigo
   */
  const extractCodigoFromParent = (el) => {
    const box = el.closest('.imovel-box-single');
    return box ? box.getAttribute('data-codigo') || '' : '';
  };

  // ===========================================================================
  // RASTREAMENTO DE FAVORITOS
  // ===========================================================================

  /**
   * Rastreia ações de favoritar/desfavoritar propriedades
   *
   * COMPORTAMENTO:
   * - Detecta cliques em botões com classe 'btn-favoritar'
   * - Determina ação (add/remove) baseado na classe 'favorited'
   * - Extrai código da propriedade do atributo data-codigo
   * - Envia evento 'favorite_toggle'
   * - Rastreia estágio 'favorited_property' no funil
   */
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

  // ===========================================================================
  // RASTREAMENTO DE CONVERSÕES
  // ===========================================================================

  /**
   * Rastreia conversões (cliques em contato)
   *
   * @param {string} sel - Seletor CSS dos elementos
   * @param {string} eventName - Nome do evento de conversão
   * @param {string} label - Label do estágio do funil
   *
   * COMPORTAMENTO:
   * - Encontra todos os elementos que correspondem ao seletor
   * - Anexa listener de clique em cada um
   * - Extrai código da propriedade do elemento pai
   * - Envia evento de conversão
   * - Rastreia estágio correspondente no funil
   */
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

  // WhatsApp - Links que começam com https://wa.me ou contêm api.whatsapp.com
  trackConversion(
    'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
    'conversion_whatsapp_click',
    'contacted_whatsapp',
  );

  // Telefone - Links que começam com tel:
  trackConversion(
    'a[href^="tel:"]',
    'conversion_phone_click',
    'contacted_phone',
  );

  // Email - Links que começam com mailto:
  trackConversion(
    'a[href^="mailto:"]',
    'conversion_email_click',
    'contacted_email',
  );

  // ===========================================================================
  // SISTEMA DE FUNIL DE CONVERSÃO
  // ===========================================================================

  /**
   * FUNIL DE CONVERSÃO
   * ------------------
   * Sistema que rastreia a progressão do usuário através de estágios:
   *
   * ESTÁGIOS TÍPICOS:
   * - search_submitted: Usuário submeteu busca
   * - search_by_code: Busca por código
   * - viewed_property: Visualizou página de propriedade
   * - clicked_saber_mais: Clicou em "Saber Mais"
   * - favorited_property: Favoritou propriedade
   * - opened_contact_form: Abriu formulário de contato
   * - contacted_whatsapp: Clicou em WhatsApp
   * - contacted_phone: Clicou em telefone
   * - contacted_email: Clicou em email
   * - submitted_contact_form: Submeteu formulário de contato
   * - clicked_fazer_proposta: Clicou em "Fazer Proposta"
   * - clicked_alugar_imovel: Clicou em "Alugar Imóvel"
   *
   * COMPORTAMENTO:
   * - Armazena histórico completo no localStorage
   * - Cada estágio inclui: stage, timestamp, URL
   * - Envia evento 'funnel_stage_reached' a cada progressão
   * - Permite análise de taxa de conversão por estágio
   */

  /**
   * Rastreia progressão do usuário através do funil de conversão
   *
   * @param {string} stage - Nome do estágio alcançado
   *
   * COMPORTAMENTO:
   * - Adiciona estágio ao histórico do funil
   * - Armazena: stage, timestamp, URL
   * - Envia evento 'funnel_stage_reached' com:
   *   - stage: estágio atual
   *   - funnel_length: quantidade de estágios no histórico
   *   - previous_stage: estágio anterior (ou 'none')
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
   * Obtém funil completo do usuário (API pública)
   *
   * @returns {Array<Object>} Array com todos os estágios do funil
   */
  window.MyAnalytics.getFunnel = () => {
    return JSON.parse(localStorage.getItem('ih_funnel_stages') || '[]');
  };

  // ===========================================================================
  // RASTREAMENTO DE PROFUNDIDADE DE SCROLL
  // ===========================================================================

  /**
   * RASTREAMENTO DE SCROLL
   * ----------------------
   * Sistema que rastreia quão longe o usuário rola a página
   *
   * COMPORTAMENTO:
   * - Rastreia profundidades: 25%, 50%, 75%, 100%
   * - Envia evento apenas uma vez por profundidade
   * - Calcula porcentagem baseado em scrollHeight e viewport
   * - Armazena máximo de scroll alcançado
   */

  let maxScroll = 0; // Máximo de scroll alcançado (0-100)
  const scrollDepths = [25, 50, 75, 100]; // Profundidades a rastrear
  const trackedDepths = new Set(); // Mantém profundidades já rastreadas

  window.addEventListener(
    'scroll',
    () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;

      // Atualiza máximo de scroll
      if (scrolled > maxScroll) maxScroll = scrolled;

      // Rastreia profundidades uma única vez
      scrollDepths.forEach((depth) => {
        if (scrolled >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          capture('scroll_depth', { depth: depth });
        }
      });
    },
    { passive: true },
  );

  // ===========================================================================
  // RASTREAMENTO DE TEMPO NA PÁGINA
  // ===========================================================================

  /**
   * RASTREAMENTO DE TEMPO NA PÁGINA
   * --------------------------------
   * Sistema que rastreia quanto tempo o usuário permanece na página
   *
   * COMPORTAMENTO:
   * - Calcula tempo desde o carregamento da página
   * - Envia evento 'page_exit' no beforeunload
   * - Inclui tempo na página e máxima profundidade de scroll
   * - Força envio da fila antes de sair
   */

  const pageLoadTime = Date.now(); // Timestamp do carregamento da página

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    capture('page_exit', {
      time_on_page: timeOnPage, // Tempo em segundos
      max_scroll_depth: Math.floor(maxScroll), // Máximo de scroll em porcentagem
    });

    // Força esvaziamento da fila antes de sair
    flushQueue();
  });

  // ===========================================================================
  // RASTREAMENTO DE INTERAÇÕES DE FILTROS
  // ===========================================================================

  /**
   * Rastreia toggle de filtros avançados (expandir/colapsar)
   *
   * COMPORTAMENTO:
   * - Detecta clique no botão de toggle
   * - Verifica se está expandido ou colapsado
   * - Envia evento 'advanced_filters_toggle'
   */
  const advancedTrigger = byId('collapseAdvFilter-trigger');
  safeOn(advancedTrigger, 'click', () => {
    const isExpanded = byId('collapseAdvFilter')?.classList.contains('show');
    capture('advanced_filters_toggle', {
      action: isExpanded ? 'collapse' : 'expand',
    });
  });

  /**
   * Rastreia mudanças na ordenação de resultados
   *
   * COMPORTAMENTO:
   * - Detecta cliques em links de ordenação
   * - Extrai valor de ordenação do atributo data-value
   * - Envia evento 'results_order_changed'
   */
  bySelAll('.dropdown-orderby ul li a').forEach((link) => {
    safeOn(link, 'click', () => {
      const orderValue = link.getAttribute('data-value');
      capture('results_order_changed', {
        order_by: orderValue,
      });
    });
  });

  // ===========================================================================
  // RASTREAMENTO ESPECÍFICO DA PÁGINA DE PROPRIEDADE
  // ===========================================================================

  /**
   * RASTREAMENTO DE PÁGINA DE PROPRIEDADE
   * -------------------------------------
   * Sistema que rastreia interações específicas na página de detalhes
   * de uma propriedade
   *
   * EVENTOS CAPTURADOS:
   * - property_page_view: Visualização da página
   * - cta_fazer_proposta_click: Clique em "Fazer Proposta"
   * - cta_alugar_imovel_click: Clique em "Alugar Imóvel"
   * - cta_mais_informacoes_click: Clique em "Mais Informações"
   * - property_share_click: Clique em compartilhar
   * - property_favorite_toggle: Favoritar na página de propriedade
   * - property_gallery_navigation: Navegação na galeria
   * - property_image_click: Clique em imagem
   * - contact_form_*: Eventos do formulário de contato
   */

  /**
   * Obtém código da propriedade da página atual
   *
   * @returns {string} Código da propriedade ou string vazia
   *
   * COMPORTAMENTO:
   * - Tenta extrair da URL (formato: /imovel/2854/...)
   * - Se falhar, tenta extrair de link no formulário
   * - Retorna string vazia se não encontrar
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

  /**
   * Inicializa rastreamento específico da página de propriedade
   */
  onReady(() => {
    const propertyCode = getPropertyCodeFromPage();

    if (!propertyCode) return; // Não está na página de propriedade

    log('🏠 Página de propriedade detectada, código:', propertyCode);

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
     * Rastreia todas as interações com o formulário de contato
     *
     * EVENTOS CAPTURADOS:
     * - contact_form_started: Usuário começou a preencher
     * - contact_form_field_focus: Foco em campo
     * - contact_form_field_filled: Campo preenchido
     * - contact_form_submit: Submissão do formulário
     * - contact_form_abandoned: Abandono do formulário
     * - conversion_contact_form: Evento principal de conversão
     *
     * COMPORTAMENTO:
     * - Aguarda modal estar no DOM (carregamento dinâmico)
     * - Rastreia interações com campos individuais
     * - Calcula completude do formulário
     * - Detecta abandono ao fechar modal
     */
    const trackContactForm = () => {
      // Aguarda modal estar no DOM (pode ser carregado dinamicamente)
      const checkModal = setInterval(() => {
        const modal = byId('imovel-contato');
        const form = modal ? modal.querySelector('form') : null;

        if (!form) return;

        clearInterval(checkModal);
        log('📝 Formulário de contato encontrado, anexando listeners');

        /**
         * Rastreia interações com campos individuais do formulário
         *
         * @param {string} selector - Seletor CSS do campo
         * @param {string} fieldName - Nome amigável do campo
         */
        const trackFormField = (selector, fieldName) => {
          const field = form.querySelector(selector);
          if (!field) return;

          // Rastreia foco no campo
          safeOn(field, 'focus', () => {
            capture('contact_form_field_focus', {
              codigo: propertyCode,
              field: fieldName,
            });
          });

          // Rastreia preenchimento do campo (blur = saiu do campo)
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

        // Rastreia início do preenchimento (detecta primeira interação)
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

        /**
         * Detecta abandono do formulário
         *
         * COMPORTAMENTO:
         * - Verifica se usuário começou a preencher
         * - Verifica se há dados parciais no formulário
         * - Envia evento 'contact_form_abandoned' se houver dados
         */
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

        // Escuta fechamento do modal (Bootstrap)
        const modalElement = byId('imovel-contato');
        if (modalElement) {
          safeOn(modalElement, 'hidden.bs.modal', detectAbandonment);

          // Também tenta botão de fechar
          const closeBtn = modalElement.querySelector('[data-dismiss="modal"]');
          safeOn(closeBtn, 'click', detectAbandonment);
        }
      }, 500); // Verifica a cada 500ms

      // Para verificação após 10 segundos (evita loop infinito)
      setTimeout(() => clearInterval(checkModal), 10000);
    };

    // Inicializa rastreamento do formulário de contato
    trackContactForm();

    // ===== INTERAÇÕES DO PAINEL DE INFORMAÇÕES DA PROPRIEDADE =====

    // Rastreia navegação na galeria de imagens (setas)
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

    // Rastreia cliques em imagens (abre tela cheia/lightbox)
    bySelAll('.foto-imovel, .swiper-slide').forEach((slide) => {
      safeOn(slide, 'click', () => {
        capture('property_image_click', {
          codigo: propertyCode,
        });
      });
    });
  }); // Fim do rastreamento da página de propriedade

  // ===========================================================================
  // RASTREAMENTO DE TAXA DE REJEIÇÃO E BOUNCE
  // ===========================================================================

  /**
   * RASTREAMENTO DE BOUNCE
   * ----------------------
   * Sistema que detecta e rastreia taxa de rejeição (bounce rate)
   *
   * TIPOS DE BOUNCE:
   * - Hard Bounce: Apenas 1 página visitada E menos de 10 segundos
   * - Quick Exit: Menos de 30 segundos E menos de 25% de scroll
   *
   * COMPORTAMENTO:
   * - Executa no beforeunload (quando usuário está saindo)
   * - Calcula métricas baseado em jornada e tempo na página
   * - Envia evento 'bounce_detected' se detectar bounce
   */

  /**
   * Calcula e rastreia indicadores de taxa de bounce
   *
   * COMPORTAMENTO:
   * - Lê jornada do usuário do localStorage
   * - Calcula tempo na página atual
   * - Determina se é hard bounce ou quick exit
   * - Envia evento apenas se detectar bounce
   */
  const trackBounceIndicators = () => {
    const journey = JSON.parse(
      localStorage.getItem('ih_journey_pages') || '[]',
    );
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);

    // Bounce se:
    // - Apenas 1 página na jornada (não navegou)
    // - Menos de 10 segundos na página
    const isBounce = journey.length <= 1 && timeOnPage < 10;

    // Saída rápida se:
    // - Menos de 30 segundos na página
    // - Menos de 25% de scroll (não engajou)
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

  // ===========================================================================
  // FUNÇÕES AUXILIARES
  // ===========================================================================

  /**
   * Calcula porcentagem de completude do formulário
   *
   * @param {Object} fields - Objeto com campos do formulário
   * @returns {number} Porcentagem de completude (0-100)
   *
   * COMPORTAMENTO:
   * - Conta total de campos
   * - Conta campos preenchidos (não vazios e não apenas espaços)
   * - Retorna porcentagem arredondada
   */
  const calculateFormCompleteness = (fields) => {
    const totalFields = Object.keys(fields).length;
    const filledFields = Object.values(fields).filter(
      (v) => v && v.toString().trim(),
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  /**
   * Obtém valor de campo do formulário por ID
   *
   * @param {string} id - ID do elemento
   * @returns {string} Valor do campo ou string vazia
   */
  const getVal = (id) => {
    const el = byId(id);
    return el && el.value ? el.value : '';
  };

  // ===========================================================================
  // API PÚBLICA DE EXPORTAÇÃO
  // ===========================================================================

  /**
   * API PÚBLICA
   * -----------
   * Expõe funções e dados para uso externo via window.MyAnalytics
   *
   * MÉTODOS DISPONÍVEIS:
   * - capture(eventName, properties): Captura evento customizado
   * - getUserId(): Retorna ID persistente do usuário
   * - getSessionId(): Retorna ID da sessão atual
   * - getJourney(): Retorna jornada completa do usuário
   * - getFunnel(): Retorna funil completo de conversão
   * - getPropertyCode(): Retorna código da propriedade da página atual
   * - clearJourney(): Limpa todos os dados de jornada e sessão
   * - flush(): Força envio imediato da fila de eventos
   * - debug: Flag para habilitar/desabilitar logs
   *
   * EXEMPLO DE USO:
   * window.MyAnalytics.capture('custom_event', { custom_prop: 'value' });
   * const userId = window.MyAnalytics.getUserId();
   * const journey = window.MyAnalytics.getJourney();
   */
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
    flush: flushQueue, // Esvaziamento manual da fila
    debug: MyAnalytics.debug,
  };

  // ===========================================================================
  // LOG DE INICIALIZAÇÃO
  // ===========================================================================

  log('✅ Analytics avançado inicializado ✓');
  log('👤 User ID:', getUserId());
  log('📱 Session ID:', getSessionId());
})();
