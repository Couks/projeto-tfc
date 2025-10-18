/**
 * Enhanced InsightHouse Analytics Script
 *
 * Features:
 * - Captures ALL search filters (quartos, suites, banheiros, vagas, valores, switches)
 * - User journey tracking with persistent ID
 * - Session tracking
 * - Conversion funnel
 */
(() => {
  const PH = typeof window !== "undefined" ? window.posthog : undefined;
  const MyAnalytics = window.MyAnalytics || (window.MyAnalytics = {});
  MyAnalytics.debug = false;

  // =========================================
  // HELPERS
  // =========================================
  const log = (...args) => {
    if (MyAnalytics.debug) console.log("[MyAnalytics]", ...args);
  };

  const safeOn = (el, ev, fn) => {
    if (el) el.addEventListener(ev, fn, { passive: true });
  };

  const capture = (event, props) => {
    try {
      if (PH && PH.capture) {
        // Add user journey context to all events
        const enrichedProps = {
          ...props,
          ...getUserJourneyContext(),
        };
        PH.capture(event, enrichedProps);
        log("capture", event, enrichedProps);
      }
    } catch (e) {
      log("Error capturing event:", e);
    }
  };

  const byId = (id) => document.getElementById(id);
  const bySelAll = (sel) => Array.from(document.querySelectorAll(sel));

  // =========================================
  // USER JOURNEY TRACKING
  // =========================================

  /**
   * Get or create persistent user ID
   * Stored in localStorage for cross-session tracking
   */
  const getUserId = () => {
    const STORAGE_KEY = "ih_user_id";
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
  };

  /**
   * Get or create session ID
   * Expires after 30 minutes of inactivity
   */
  const getSessionId = () => {
    const STORAGE_KEY = "ih_session_id";
    const TIMEOUT_KEY = "ih_session_timeout";
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const now = Date.now();
    const lastActivity = parseInt(localStorage.getItem(TIMEOUT_KEY) || "0");

    let sessionId = localStorage.getItem(STORAGE_KEY);

    // Create new session if expired or doesn't exist
    if (!sessionId || (now - lastActivity) > SESSION_TIMEOUT) {
      sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);

      // Track new session
      capture("session_start", {
        session_id: sessionId,
        referrer: document.referrer,
        landing_page: window.location.href,
      });
    }

    // Update last activity
    localStorage.setItem(TIMEOUT_KEY, now.toString());

    return sessionId;
  };

  /**
   * Track page in user journey
   */
  const trackPageView = () => {
    const journeyKey = "ih_journey_pages";
    const journey = JSON.parse(localStorage.getItem(journeyKey) || "[]");

    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
    };

    journey.push(pageData);

    // Keep only last 20 pages
    if (journey.length > 20) journey.shift();

    localStorage.setItem(journeyKey, JSON.stringify(journey));

    return journey;
  };

  /**
   * Get user journey context (added to all events)
   */
  const getUserJourneyContext = () => {
    const journey = JSON.parse(localStorage.getItem("ih_journey_pages") || "[]");

    return {
      user_id: getUserId(),
      session_id: getSessionId(),
      page_depth: journey.length,
      time_on_site: calculateTimeOnSite(),
      returning_visitor: journey.length > 1,
    };
  };

  /**
   * Calculate time on site
   */
  const calculateTimeOnSite = () => {
    const firstPageTime = parseInt(localStorage.getItem("ih_first_page_time") || Date.now().toString());
    return Math.floor((Date.now() - firstPageTime) / 1000); // seconds
  };

  // Initialize journey tracking
  if (!localStorage.getItem("ih_first_page_time")) {
    localStorage.setItem("ih_first_page_time", Date.now().toString());
  }

  // Track page view on load
  trackPageView();

  // =========================================
  // ENHANCED FILTER TRACKING
  // =========================================

  /**
   * Generic change logger with value extraction
   */
  const onChange = (el, field) => {
    if (!el) return;

    safeOn(el, "change", (e) => {
      let value = "";

      // Handle different input types
      if (el.type === "checkbox" || el.type === "radio") {
        value = el.checked ? el.value : "";
      } else if (el.multiple && el.selectedOptions) {
        value = Array.from(el.selectedOptions).map(opt => opt.value).join(",");
      } else {
        value = (e.target && e.target.value || "").toString();
      }

      capture("search_filter_changed", {
        field: field,
        value: value,
        checked: el.checked || null,
      });
    });
  };

  /**
   * Track checkbox groups (quartos, suites, etc.)
   */
  const trackCheckboxGroup = (name, displayName) => {
    bySelAll(`input[name="${name}"]`).forEach((el) => {
      safeOn(el, "change", () => {
        const selected = bySelAll(`input[name="${name}"]:checked`)
          .map(input => input.value);

        capture("search_filter_group_changed", {
          field: displayName,
          selected: selected,
          count: selected.length,
        });
      });
    });
  };

  /**
   * Track slider with range values
   */
  const trackSlider = (sliderId, field) => {
    const slider = byId(sliderId);
    if (!slider) return;

    safeOn(slider, "change", () => {
      const value = slider.value || "";
      const [min, max] = value.split(",");

      capture("search_filter_range_changed", {
        field: field,
        min: min || "0",
        max: max || "unlimited",
        raw_value: value,
      });
    });
  };

  /**
   * Track switch toggles (all checkboxes in filters)
   */
  const trackSwitch = (switchId, label) => {
    const switchEl = byId(switchId);
    if (!switchEl) return;

    safeOn(switchEl, "change", () => {
      capture("search_filter_toggle", {
        field: label,
        enabled: switchEl.checked,
        value: switchEl.value || "Sim",
      });
    });
  };

  // =========================================
  // INITIALIZE TRACKING ON DOM READY
  // =========================================
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => {
    log("Initializing enhanced analytics...");

    // ===== BASIC FILTERS =====

    // Finalidade (Venda/Aluguel)
    onChange(byId("property-status"), "finalidade");
    bySelAll(".finalidade-alias-button[data-value]").forEach((btn) => {
      safeOn(btn, "click", () => {
        capture("search_filter_changed", {
          field: "finalidade",
          value: btn.getAttribute("data-value"),
        });
      });
    });

    // Tipos de Imóvel (multiple select)
    onChange(byId("residencial-property-type"), "tipo");

    // Cidade(s)
    const city = byId("search-field-cidade");
    onChange(city, "cidade");
    safeOn(city, "change", () => {
      const values = city && city.selectedOptions
        ? Array.from(city.selectedOptions).map(opt => opt.value)
        : [];
      if (values.length > 0) {
        capture("search_filter_city", { cidades: values });
      }
    });

    // Bairro / Condomínio
    const bairro = byId("search-field-cidadebairro");
    onChange(bairro, "bairro");
    safeOn(bairro, "change", () => {
      const values = bairro && bairro.selectedOptions
        ? Array.from(bairro.selectedOptions).map(opt => opt.value)
        : [];
      if (values.length > 0) {
        capture("search_filter_bairro", { bairros: values });
      }
    });

    // ===== ADVANCED FILTERS (NOW TRACKED) =====

    // Quartos (checkboxes - multiple selection)
    trackCheckboxGroup("dormitorios[]", "quartos");

    // Suítes (radio buttons - single selection)
    trackCheckboxGroup("suites[]", "suites");

    // Banheiros (radio buttons - single selection)
    trackCheckboxGroup("banheiros[]", "banheiros");

    // Vagas (radio buttons - single selection)
    trackCheckboxGroup("vagas[]", "vagas");

    // ===== SLIDERS (RANGES) =====

    // Valor de Venda (R$)
    trackSlider("input-slider-valor-venda", "preco_venda");

    // Valor de Aluguel (R$)
    trackSlider("input-slider-valor-aluguel", "preco_aluguel");

    // Área (m²)
    trackSlider("input-slider-area", "area");

    // ===== MANUAL NUMBER INPUTS (NEW) =====

    const trackNumberInput = (inputId, field) => {
      const input = byId(inputId);
      if (!input) return;

      safeOn(input, "blur", () => {
        if (input.value) {
          capture("search_filter_manual_input", {
            field: field,
            value: input.value,
          });
        }
      });
    };

    trackNumberInput("input-number-valor-min", "preco_min_manual");
    trackNumberInput("input-number-valor-max", "preco_max_manual");
    trackNumberInput("input-number-area-min", "area_min_manual");
    trackNumberInput("input-number-area-max", "area_max_manual");

    // ===== SWITCHES/TOGGLES =====

    // Switches básicos
    trackSwitch("filtermobiliado", "mobiliado");
    trackSwitch("filtersemimobiliado", "semi_mobiliado");
    trackSwitch("filterpromocao", "promocao_ofertas");
    trackSwitch("filternovo", "imovel_novo");
    trackSwitch("filternaplanta", "na_planta");
    trackSwitch("filterconstrucao", "em_construcao");
    trackSwitch("filterpermuta", "aceita_permuta");
    trackSwitch("filterpet", "pet_friendly");
    trackSwitch("filtersegfianca", "seguro_fianca");
    trackSwitch("filterproposta", "reservado");
    trackSwitch("filterpacote", "valor_total_pacote");

    // ===== COMMERCIAL FILTERS (NEW) =====

    // Salas (comercial)
    trackCheckboxGroup("salas[]", "salas_comercial");

    // Galpões (comercial)
    trackCheckboxGroup("galpoes[]", "galpoes");

    // ===== COMODIDADES (NEW) =====

    const comodidades = [
      "ArCondicionado",
      "Lareira",
      "Lavanderia",
      "Sauna",
      "Elevador",
    ];

    comodidades.forEach((comodidade) => {
      trackSwitch(`${comodidade}-advanced`, `comodidade_${comodidade.toLowerCase()}`);
    });

    // ===== LAZER E ESPORTE (NEW) =====

    const lazer = [
      "Churrasqueira",
      "Piscina",
      "Academia",
      "Playground",
      "SalaoFestas",
      "SalaoJogos",
    ];

    lazer.forEach((item) => {
      trackSwitch(`${item}-advanced`, `lazer_${item.toLowerCase()}`);
    });

    // ===== CÔMODOS (NEW) =====

    const comodos = ["AreaServico", "Varanda"];

    comodos.forEach((comodo) => {
      trackSwitch(`${comodo}-advanced`, `comodo_${comodo.toLowerCase()}`);
    });

    // ===== SEGURANÇA (NEW) =====

    const seguranca = [
      "Alarme",
      "CircuitoFechadoTV",
      "Interfone",
      "Portaria24Hrs",
    ];

    seguranca.forEach((item) => {
      trackSwitch(`${item}-advanced`, `seguranca_${item.toLowerCase()}`);
    });

    log("All filters initialized ✓");
  });

  // =========================================
  // SEARCH SUBMIT TRACKING (ENHANCED)
  // =========================================

  /**
   * Capture complete search state on submit
   */
  const captureSearchSubmit = (source) => {
    const getVal = (id) => {
      const el = byId(id);
      return el && el.value ? el.value : "";
    };

    const getMultiSelect = (id) => {
      const el = byId(id);
      if (!el || !el.selectedOptions) return [];
      return Array.from(el.selectedOptions).map(opt => opt.value);
    };

    const getCheckedValues = (name) => {
      return bySelAll(`input[name="${name}"]:checked`).map(el => el.value);
    };

    const getSliderRange = (id) => {
      const value = getVal(id);
      const [min, max] = value.split(",");
      return { min: min || "0", max: max || "unlimited" };
    };

    const isChecked = (id) => {
      const el = byId(id);
      return el ? el.checked : false;
    };

    // Build complete search payload
    const searchData = {
      // Source
      source: source,
      timestamp: Date.now(),

      // Basic filters
      finalidade: getVal("property-status"),
      tipos: getMultiSelect("residencial-property-type"),
      cidades: getMultiSelect("search-field-cidade"),
      bairros: getMultiSelect("search-field-cidadebairro"),

      // Advanced filters - QUARTOS, SUITES, BANHEIROS, VAGAS
      quartos: getCheckedValues("dormitorios[]"),
      suites: getCheckedValues("suites[]"),
      banheiros: getCheckedValues("banheiros[]"),
      vagas: getCheckedValues("vagas[]"),

      // Commercial filters
      salas: getCheckedValues("salas[]"),
      galpoes: getCheckedValues("galpoes[]"),

      // Price ranges
      preco_venda: getSliderRange("input-slider-valor-venda"),
      preco_aluguel: getSliderRange("input-slider-valor-aluguel"),

      // Manual price inputs
      preco_min_manual: getVal("input-number-valor-min"),
      preco_max_manual: getVal("input-number-valor-max"),

      // Area range
      area: getSliderRange("input-slider-area"),
      area_min_manual: getVal("input-number-area-min"),
      area_max_manual: getVal("input-number-area-max"),

      // Switches/Toggles
      mobiliado: isChecked("filtermobiliado"),
      semi_mobiliado: isChecked("filtersemimobiliado"),
      promocao: isChecked("filterpromocao"),
      imovel_novo: isChecked("filternovo"),
      na_planta: isChecked("filternaplanta"),
      em_construcao: isChecked("filterconstrucao"),
      aceita_permuta: isChecked("filterpermuta"),
      pet_friendly: isChecked("filterpet"),
      seguro_fianca: isChecked("filtersegfianca"),
      reservado: isChecked("filterproposta"),
      valor_total_pacote: isChecked("filterpacote"),

      // Comodidades
      comodidades: {
        ar_condicionado: isChecked("ArCondicionado-advanced"),
        lareira: isChecked("Lareira-advanced"),
        lavanderia: isChecked("Lavanderia-advanced"),
        sauna: isChecked("Sauna-advanced"),
        elevador: isChecked("Elevador-advanced"),
      },

      // Lazer
      lazer: {
        churrasqueira: isChecked("Churrasqueira-advanced"),
        piscina: isChecked("Piscina-advanced"),
        academia: isChecked("Academia-advanced"),
        playground: isChecked("Playground-advanced"),
        salao_festas: isChecked("SalaoFestas-advanced"),
        salao_jogos: isChecked("SalaoJogos-advanced"),
      },

      // Cômodos
      comodos: {
        area_servico: isChecked("AreaServico-advanced"),
        varanda: isChecked("Varanda-advanced"),
      },

      // Segurança
      seguranca: {
        alarme: isChecked("Alarme-advanced"),
        circuito_tv: isChecked("CircuitoFechadoTV-advanced"),
        interfone: isChecked("Interfone-advanced"),
        portaria_24h: isChecked("Portaria24Hrs-advanced"),
      },

      // Journey context
      journey_length: JSON.parse(localStorage.getItem("ih_journey_pages") || "[]").length,
    };

    capture("search_submit", searchData);

    // Track funnel stage
    trackFunnelStage("search_submitted");
  };

  // Attach to submit buttons
  safeOn(byId("submit-main-search-form"), "click", () => {
    captureSearchSubmit("main_form");
  });

  safeOn(byId("submit-main-search-form-codigo"), "click", () => {
    const codigo = getVal("property-codigo");
    capture("search_submit", {
      source: "codigo",
      codigo: codigo,
    });
    trackFunnelStage("search_by_code");
  });

  // Sidebar form submit
  bySelAll(".submit-sidebar-search-form").forEach((btn) => {
    safeOn(btn, "click", () => {
      captureSearchSubmit("sidebar_form");
    });
  });

  // =========================================
  // RESULT INTERACTIONS (ENHANCED)
  // =========================================

  /**
   * Track clicks on property results
   */
  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;

    const href = (a.getAttribute("href") || "").toString();
    if (!href) return;

    // Property page click
    if (href.indexOf("/imovel/") !== -1) {
      const codigo = extractCodigoFromUrl(href);
      capture("results_item_click", {
        target: href,
        kind: "imovel",
        codigo: codigo,
      });
      trackFunnelStage("viewed_property");
    }

    // Condomínio click
    else if (href.indexOf("/condominio/") !== -1) {
      capture("results_item_click", {
        target: href,
        kind: "condominio",
      });
    }

    // "SABER MAIS" button
    else if (a.classList.contains("button-info-panel")) {
      const codigo = extractCodigoFromParent(a);
      capture("results_saber_mais_click", {
        codigo: codigo,
        href: href,
      });
      trackFunnelStage("clicked_saber_mais");
    }
  }, { passive: true });

  /**
   * Extract property code from URL
   */
  const extractCodigoFromUrl = (url) => {
    const match = url.match(/\/imovel\/(\d+)\//);
    return match ? match[1] : "";
  };

  /**
   * Extract property code from parent element
   */
  const extractCodigoFromParent = (el) => {
    const box = el.closest(".imovel-box-single");
    return box ? box.getAttribute("data-codigo") || "" : "";
  };

  // =========================================
  // FAVORITOS TRACKING (NEW)
  // =========================================

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-favoritar") ||
        e.target.closest(".btn-favoritar")) {
      const btn = e.target.closest(".btn-favoritar") || e.target;
      const codigo = btn.getAttribute("data-codigo");

      capture("favorite_toggle", {
        codigo: codigo,
        action: btn.classList.contains("favorited") ? "remove" : "add",
      });

      trackFunnelStage("favorited_property");
    }
  }, { passive: true });

  // =========================================
  // CONVERSION TRACKING (ENHANCED)
  // =========================================

  const trackConversion = (sel, eventName, label) => {
    bySelAll(sel).forEach((el) => {
      safeOn(el, "click", () => {
        const codigo = extractCodigoFromParent(el);
        capture(eventName, {
          codigo: codigo,
          href: el.href || "",
        });
        trackFunnelStage(label);
      });
    });
  };

  // WhatsApp
  trackConversion(
    'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
    "conversion_whatsapp_click",
    "contacted_whatsapp"
  );

  // Phone
  trackConversion(
    'a[href^="tel:"]',
    "conversion_phone_click",
    "contacted_phone"
  );

  // Email
  trackConversion(
    'a[href^="mailto:"]',
    "conversion_email_click",
    "contacted_email"
  );

  // =========================================
  // FUNNEL TRACKING
  // =========================================

  /**
   * Track user progression through conversion funnel
   */
  const trackFunnelStage = (stage) => {
    const FUNNEL_KEY = "ih_funnel_stages";
    const funnel = JSON.parse(localStorage.getItem(FUNNEL_KEY) || "[]");

    const stageData = {
      stage: stage,
      timestamp: Date.now(),
      url: window.location.href,
    };

    funnel.push(stageData);
    localStorage.setItem(FUNNEL_KEY, JSON.stringify(funnel));

    capture("funnel_stage_reached", {
      stage: stage,
      funnel_length: funnel.length,
      previous_stage: funnel[funnel.length - 2]?.stage || "none",
    });
  };

  /**
   * Get complete funnel for user
   */
  window.MyAnalytics.getFunnel = () => {
    return JSON.parse(localStorage.getItem("ih_funnel_stages") || "[]");
  };

  // =========================================
  // SCROLL DEPTH TRACKING (NEW)
  // =========================================

  let maxScroll = 0;
  const scrollDepths = [25, 50, 75, 100];
  const trackedDepths = new Set();

  window.addEventListener("scroll", () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;

    if (scrolled > maxScroll) maxScroll = scrolled;

    scrollDepths.forEach(depth => {
      if (scrolled >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        capture("scroll_depth", { depth: depth });
      }
    });
  }, { passive: true });

  // =========================================
  // TIME ON PAGE (NEW)
  // =========================================

  const pageLoadTime = Date.now();

  window.addEventListener("beforeunload", () => {
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    capture("page_exit", {
      time_on_page: timeOnPage,
      max_scroll_depth: Math.floor(maxScroll),
    });
  });

  // =========================================
  // ADVANCED COLLAPSE TOGGLE TRACKING (NEW)
  // =========================================

  const advancedTrigger = byId("collapseAdvFilter-trigger");
  safeOn(advancedTrigger, "click", () => {
    const isExpanded = byId("collapseAdvFilter")?.classList.contains("show");
    capture("advanced_filters_toggle", {
      action: isExpanded ? "collapse" : "expand",
    });
  });

  // =========================================
  // ORDENAÇÃO TRACKING (NEW)
  // =========================================

  bySelAll(".dropdown-orderby ul li a").forEach((link) => {
    safeOn(link, "click", () => {
      const orderValue = link.getAttribute("data-value");
      capture("results_order_changed", {
        order_by: orderValue,
      });
    });
  });

  // =========================================
  // PROPERTY PAGE CONVERSION TRACKING
  // =========================================

  /**
   * Get property code from current page
   */
  const getPropertyCodeFromPage = () => {
    // Try to get from URL (e.g., /imovel/2854/...)
    const match = window.location.pathname.match(/\/imovel\/(\d+)\//);
    if (match) return match[1];

    // Try to get from form button data attribute
    const formBtn = document.querySelector('a[href*="codigo_imovel="]');
    if (formBtn) {
      const href = formBtn.getAttribute("href") || "";
      const codeMatch = href.match(/codigo_imovel=(\d+)/);
      if (codeMatch) return codeMatch[1];
    }

    return "";
  };

  onReady(() => {
    const propertyCode = getPropertyCodeFromPage();

    if (!propertyCode) return; // Not on property page

    log("Property page detected, code:", propertyCode);

    // ===== PROPERTY PAGE VIEW =====
    capture("property_page_view", {
      codigo: propertyCode,
      url: window.location.href,
      title: document.title,
    });

    // ===== CTA BUTTONS TRACKING =====

    // "FAZER PROPOSTA" button
    const propostaBtn = document.querySelector(".cadastro-proposta-cta");
    safeOn(propostaBtn, "click", () => {
      capture("cta_fazer_proposta_click", {
        codigo: propertyCode,
        href: propostaBtn ? propostaBtn.getAttribute("href") : "",
      });
      trackFunnelStage("clicked_fazer_proposta");
    });

    // "ALUGAR ESTE IMÓVEL" button
    const alugarBtn = document.querySelector(".cadastro-inquilino-cta");
    safeOn(alugarBtn, "click", () => {
      capture("cta_alugar_imovel_click", {
        codigo: propertyCode,
        href: alugarBtn ? alugarBtn.getAttribute("href") : "",
      });
      trackFunnelStage("clicked_alugar_imovel");
    });

    // "MAIS INFORMAÇÕES" button (opens modal)
    const maisInfoBtn = document.querySelector('a[data-toggle="modal"][href="#imovel-contato"]');
    safeOn(maisInfoBtn, "click", () => {
      capture("cta_mais_informacoes_click", {
        codigo: propertyCode,
      });
      trackFunnelStage("opened_contact_form");
    });

    // Share button
    const shareBtn = document.querySelector('a[href="#modal-compartilhar"]');
    safeOn(shareBtn, "click", () => {
      capture("property_share_click", {
        codigo: propertyCode,
      });
    });

    // Favorite button (property page)
    const favBtn = document.querySelector('.clb-form-fixed-fav a[data-codigo]');
    safeOn(favBtn, "click", () => {
      const isFavorited = favBtn && favBtn.classList.contains("favorited");
      capture("property_favorite_toggle", {
        codigo: propertyCode,
        action: isFavorited ? "remove" : "add",
      });
      trackFunnelStage("favorited_property");
    });

    // ===== CONTACT FORM TRACKING =====

    /**
     * Track contact form submission
     * Monitors the modal form (#imovel-contato)
     */
    const trackContactForm = () => {
      // Wait for modal to be in DOM (may be loaded dynamically)
      const checkModal = setInterval(() => {
        const modal = byId("imovel-contato");
        const form = modal ? modal.querySelector("form") : null;

        if (!form) return;

        clearInterval(checkModal);
        log("Contact form found, attaching listeners");

        // Track form field interactions
        const trackFormField = (selector, fieldName) => {
          const field = form.querySelector(selector);
          if (!field) return;

          safeOn(field, "focus", () => {
            capture("contact_form_field_focus", {
              codigo: propertyCode,
              field: fieldName,
            });
          });

          safeOn(field, "blur", () => {
            if (field.value) {
              capture("contact_form_field_filled", {
                codigo: propertyCode,
                field: fieldName,
                has_value: true,
              });
            }
          });
        };

        // Track individual fields
        trackFormField('input[name="nome"], input[type="text"]', "nome");
        trackFormField('input[name="email"], input[type="email"]', "email");
        trackFormField('input[name="celular"], input[name="telefone"], input[type="tel"]', "telefone");
        trackFormField('textarea[name="mensagem"], textarea', "mensagem");

        // Track form submission
        safeOn(form, "submit", (e) => {
          const formData = new FormData(form);
          const nome = formData.get("nome") || "";
          const email = formData.get("email") || "";
          const telefone = formData.get("celular") || formData.get("telefone") || "";
          const mensagem = formData.get("mensagem") || "";

          capture("contact_form_submit", {
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

          // MAIN CONVERSION EVENT
          trackFunnelStage("submitted_contact_form");

          // Mark as converted
          capture("conversion_contact_form", {
            codigo: propertyCode,
            contact_type: "form",
            user_id: getUserId(),
            session_id: getSessionId(),
          });
        });

        // Track form abandonment
        let formStarted = false;

        form.querySelectorAll("input, textarea").forEach((field) => {
          safeOn(field, "input", () => {
            if (!formStarted) {
              formStarted = true;
              capture("contact_form_started", {
                codigo: propertyCode,
              });
            }
          });
        });

        // Detect form abandonment on modal close
        const detectAbandonment = () => {
          if (formStarted) {
            const formData = new FormData(form);
            const hasAnyData = Array.from(formData.values()).some(v => v);

            if (hasAnyData) {
              capture("contact_form_abandoned", {
                codigo: propertyCode,
                partial_data: true,
              });
            }
          }
        };

        // Listen for modal close
        const modalElement = byId("imovel-contato");
        if (modalElement) {
          safeOn(modalElement, "hidden.bs.modal", detectAbandonment);

          // Also try close button
          const closeBtn = modalElement.querySelector('[data-dismiss="modal"]');
          safeOn(closeBtn, "click", detectAbandonment);
        }

      }, 500); // Check every 500ms

      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkModal), 10000);
    };

    // Initialize contact form tracking
    trackContactForm();

    // ===== PROPERTY INFO PANEL INTERACTIONS (NEW) =====

    // Track image gallery interactions
    bySelAll(".swiper-button-next, .swiper-button-prev").forEach((btn) => {
      safeOn(btn, "click", () => {
        capture("property_gallery_navigation", {
          codigo: propertyCode,
          direction: btn.classList.contains("swiper-button-next") ? "next" : "prev",
        });
      });
    });

    // Track image clicks (open fullscreen)
    bySelAll(".foto-imovel, .swiper-slide").forEach((slide) => {
      safeOn(slide, "click", () => {
        capture("property_image_click", {
          codigo: propertyCode,
        });
      });
    });

  }); // End property page tracking

  // =========================================
  // REJECTION RATE & BOUNCE TRACKING
  // =========================================

  /**
   * Calculate bounce rate indicators
   */
  const trackBounceIndicators = () => {
    const journey = JSON.parse(localStorage.getItem("ih_journey_pages") || "[]");
    const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);

    // Bounced if:
    // - Only 1 page in journey
    // - Less than 10 seconds on page
    // - No interactions
    const isBounce = journey.length <= 1 && timeOnPage < 10;

    // Quick exit if:
    // - Less than 30 seconds
    // - Less than 25% scroll
    const isQuickExit = timeOnPage < 30 && maxScroll < 25;

    if (isBounce || isQuickExit) {
      capture("bounce_detected", {
        type: isBounce ? "hard_bounce" : "quick_exit",
        time_on_page: timeOnPage,
        max_scroll: Math.floor(maxScroll),
        page_depth: journey.length,
      });
    }
  };

  window.addEventListener("beforeunload", trackBounceIndicators);

  // =========================================
  // HELPER FUNCTIONS
  // =========================================

  /**
   * Calculate form completeness percentage
   */
  const calculateFormCompleteness = (fields) => {
    const totalFields = Object.keys(fields).length;
    const filledFields = Object.values(fields).filter(v => v && v.trim()).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  /**
   * Get value from form field
   */
  const getVal = (id) => {
    const el = byId(id);
    return el && el.value ? el.value : "";
  };

  // =========================================
  // EXPORT API FOR EXTERNAL USE
  // =========================================

  window.MyAnalytics = {
    ...MyAnalytics,
    capture: capture,
    getUserId: getUserId,
    getSessionId: getSessionId,
    getJourney: () => JSON.parse(localStorage.getItem("ih_journey_pages") || "[]"),
    getFunnel: () => JSON.parse(localStorage.getItem("ih_funnel_stages") || "[]"),
    getPropertyCode: getPropertyCodeFromPage,
    clearJourney: () => {
      localStorage.removeItem("ih_journey_pages");
      localStorage.removeItem("ih_funnel_stages");
      localStorage.removeItem("ih_first_page_time");
      localStorage.removeItem("ih_session_id");
      localStorage.removeItem("ih_session_timeout");
    },
    debug: MyAnalytics.debug,
  };

  log("Enhanced analytics initialized ✓");
  log("User ID:", getUserId());
  log("Session ID:", getSessionId());
})();

