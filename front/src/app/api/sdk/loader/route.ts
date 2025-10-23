import { NextResponse } from 'next/server';

const STATIC_BASE = '/static';

const JS = `(() => {
  // Resolve parameters from the loader script src (not the page URL)
  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || '';
  let SITE_KEY = '';
  let DEBUG = false;
  try {
    if (SCRIPT_SRC) {
      const u = new URL(SCRIPT_SRC);
      SITE_KEY = (u.searchParams.get('site') || '').toString();
      const dbg = (u.searchParams.get('debug') || '').toString().toLowerCase();
      DEBUG = dbg === '1' || dbg === 'true';
    }
  } catch {}
  if (!SITE_KEY) return;
  // Use loader script origin (our app) instead of page origin
  const APP_ORIGIN = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : location.origin;
  const log = (...args) => { try { if (DEBUG) console.log('[Loader]', ...args); } catch {} };
  const cfgUrl = APP_ORIGIN + '/api/sdk/site-config?site=' + encodeURIComponent(SITE_KEY);
  log('init', { APP_ORIGIN, SITE_KEY, cfgUrl });
  fetch(cfgUrl).then(r => r.json()).then(cfg => {
    if (!cfg || !cfg.allowedDomains) return;
    const host = location.hostname.toLowerCase();
    const ok = cfg.allowedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!ok) { log('blocked by allowedDomains', { host, allowed: cfg.allowedDomains }); return; }

    if (cfg.consentDefault === 'opt_out' && !window.__MYANALYTICS_CONSENT__) {
      // respect opt-out default unless explicit consent is provided
      log('consent: opt_out without explicit consent');
      return;
    }

    const loadScript = (src) => new Promise((res, rej) => {
      const s = document.createElement('script');
      // Bust caches with version param
      const v = Date.now().toString(36);
      s.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'v=' + v;
      s.async = true;
      s.onload = () => { log('loaded', s.src); res(); };
      s.onerror = (e) => { log('failed', s.src, e); rej(e); };
      document.head.appendChild(s);
    });

    const staticBase = APP_ORIGIN + '${STATIC_BASE}';
    // Ensure debug namespace exists early
    window.MyAnalytics = window.MyAnalytics || {};
    if (DEBUG) { window.MyAnalytics.debug = true; }

    loadScript(staticBase + '/posthog.iife.js').then(() => {
      log('window.posthog type:', typeof window.posthog);
      // The IIFE exports an object with posthog as a property, not directly on window
      var ph = (window.posthog && (window.posthog.posthog || window.posthog.default)) || window.posthog;
      if (!ph) {
        log('PostHog SDK not found. Available:', Object.keys(window.posthog || {}));
        return;
      }
      log('PostHog instance found, init type:', typeof ph.init);
      if (typeof ph.init !== 'function') {
        log('posthog.init is not a function');
        return;
      }
      // Replace window.posthog with the actual instance
      window.posthog = ph;
      window.posthog.init(cfg.phKey, { api_host: cfg.apiHost, autocapture: true, capture_pageview: true, capture_pageleave: true });
      // Always register site property so events include properties.site
      window.posthog.register({ site: SITE_KEY });
      if (cfg.groupEnabled) window.posthog.group('site', SITE_KEY);
      loadScript(staticBase + '/capture-filters.js');
    });
  }).catch(() => {});
})();`;

export async function GET() {
  return new NextResponse(JS, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}


