import { NextResponse } from 'next/server';

const STATIC_BASE = '/static';

const JS = `(() => {
  const params = new URLSearchParams(location.search);
  const SITE_KEY = params.get('site');
  if (!SITE_KEY) return;
  const ORIGIN = location.origin;
  const cfgUrl = ORIGIN + '/api/sdk/site-config?site=' + encodeURIComponent(SITE_KEY);
  fetch(cfgUrl).then(r => r.json()).then(cfg => {
    if (!cfg || !cfg.allowedDomains) return;
    const host = location.hostname.toLowerCase();
    const ok = cfg.allowedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!ok) return;

    if (cfg.consentDefault === 'opt_out' && !window.__MYANALYTICS_CONSENT__) {
      // respect opt-out default unless explicit consent is provided
      return;
    }

    const loadScript = (src) => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = () => res(); s.onerror = rej; document.head.appendChild(s);
    });

    const staticBase = ORIGIN + '${STATIC_BASE}';
    loadScript(staticBase + '/posthog.iife.js').then(() => {
      if (!window.posthog) return;
      window.posthog.init(cfg.phKey, { api_host: cfg.apiHost, autocapture: true, capture_pageview: true, capture_pageleave: true });
      if (cfg.groupEnabled) window.posthog.group('site', SITE_KEY);
      else window.posthog.register({ site: SITE_KEY });
      loadScript(staticBase + '/capture-filtros.js');
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


