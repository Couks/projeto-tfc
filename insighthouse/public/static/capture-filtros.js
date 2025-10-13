(() => {
  var PH = typeof window !== 'undefined' ? window.posthog : undefined;
  var MyAnalytics = window.MyAnalytics || (window.MyAnalytics = {});
  MyAnalytics.debug = false;

  var log = function () { if (MyAnalytics.debug) console.log.apply(console, ['[MyAnalytics]'].concat(Array.from(arguments))); };
  var safeOn = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { passive: true }); };

  var capture = function (event, props) {
    try { PH && PH.capture && PH.capture(event, props); log('capture', event, props); } catch (e) {}
  };

  var byId = function (id) { return document.getElementById(id); };
  var bySelAll = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  // Generic change logger
  var onChange = function (el, field) {
    if (!el) return;
    safeOn(el, 'change', function (e) {
      var value = ((e.target && e.target.value) || '').toString();
      capture('search_filter_changed', { field: field, value: value });
    });
  };

  // Finalidade
  onChange(byId('property-status'), 'finalidade');
  bySelAll('.finalidade-alias-button[data-value]').forEach(function (btn) {
    safeOn(btn, 'click', function () { capture('search_filter_changed', { field: 'finalidade', value: btn.getAttribute('data-value') }); });
  });

  // Tipos
  onChange(byId('residencial-property-type'), 'tipo');

  // Cidade(s)
  var city = byId('search-field-cidade');
  onChange(city, 'cidade');
  safeOn(city, 'change', function () {
    var v = (city && city.value) ? city.value.toString() : '';
    if (v) capture('search_filter_city', { cidade: v });
  });

  // Bairro / Condomínio
  var bairro = byId('search-field-cidadebairro');
  onChange(bairro, 'bairro');
  safeOn(bairro, 'change', function () {
    var v = (bairro && bairro.value) ? bairro.value.toString() : '';
    if (v) capture('search_filter_bairro', { bairro: v });
  });

  // Sliders
  ['input-slider-valor-venda','input-slider-valor-aluguel','input-slider-area'].forEach(function (id) { onChange(byId(id), id); });

  // Quartos/Suítes/Banheiros/Vagas
  ['dormitorios[]','suites[]','banheiros[]','vagas[]'].forEach(function (name) {
    bySelAll('input[name="' + name + '"]').forEach(function (el) { onChange(el, name); });
  });

  // Switches/flags
  ['filtermobiliado','filterpromocao','filternovo','filternaplanta','filterconstrucao','filterpermuta','filterpet','filtersegfianca','filterproposta']
    .forEach(function (id) { onChange(byId(id), id); });

  // Submit
  var submit = byId('submit-main-search-form');
  var submitCode = byId('submit-main-search-form-codigo');
  var captureSubmit = function (source) {
    var getVal = function (id) { var el = byId(id); return el && el.value ? el.value : ''; };
    capture('search_submit', {
      source: source,
      finalidade: (function(){ var el = byId('property-status'); return el && el.value ? el.value : ''; })(),
      preco_min: getVal('input-slider-valor-venda') || getVal('input-slider-valor-aluguel'),
      preco_max: '',
      area_min: getVal('input-slider-area'),
      area_max: ''
    });
  };
  safeOn(submit, 'click', function () { captureSubmit('main'); });
  safeOn(submitCode, 'click', function () { captureSubmit('codigo'); });

  // Result item clicks
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').toString();
    if (!href) return;
    if (href.indexOf('/imovel/') !== -1) capture('results_item_click', { target: href, kind: 'imovel' });
    else if (href.indexOf('/condominio/') !== -1) capture('results_item_click', { target: href, kind: 'condominio' });
  }, { passive: true });

  // Conversions
  var conv = function (sel, name) { bySelAll(sel).forEach(function (el) { safeOn(el, 'click', function () { capture(name, {}); }); }); };
  conv('a[href^="https://wa.me"],a[href*="api.whatsapp.com"]', 'conversion_whatsapp_click');
  conv('a[href^="tel:"]', 'conversion_phone_click');
  conv('a[href^="mailto:"]', 'conversion_email_click');
})();


