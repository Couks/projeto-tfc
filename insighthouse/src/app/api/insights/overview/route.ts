import { NextResponse } from 'next/server';

type HogQLResult = { results?: any[][] };

async function runQuery(apiHost: string, projectId: string, personalKey: string, query: string, name: string): Promise<HogQLResult> {
  const payload = { query: { kind: 'HogQLQuery', query }, name };
  const r = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${personalKey}`,
      'X-Project-ID': projectId
    },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    let details: unknown = undefined;
    try { details = await r.text(); } catch {}
    throw new Error(`posthog_error:${r.status}:${details}`);
  }
  return (await r.json()) as HogQLResult;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get('site')?.trim();
  if (!siteKey) return NextResponse.json({ error: 'missing site' }, { status: 400 });

  const apiHost = process.env.POSTHOG_PRIVATE_API_HOST || process.env.POSTHOG_API_HOST || 'https://us.posthog.com';
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY ?? '';
  const projectId = process.env.POSTHOG_PROJECT_ID ?? '';
  if (!personalKey || !projectId) return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });

  const site = (siteKey || '').replace(/'/g, "''");

  const queries: Record<string, string> = {
    finalidade: `SELECT properties.value AS finalidade, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'finalidade' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    tipos: `SELECT properties.value AS tipo, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'tipo' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 20`,
    cidades: `SELECT properties.cidade AS cidade, count() AS total FROM events WHERE event = 'search_filter_city' AND properties.site = '${site}' GROUP BY properties.cidade ORDER BY total DESC LIMIT 10`,
    bairros: `SELECT properties.bairro AS bairro, count() AS total FROM events WHERE event = 'search_filter_bairro' AND properties.site = '${site}' GROUP BY properties.bairro ORDER BY total DESC LIMIT 10`,
    preco_venda_ranges: `SELECT properties.value AS range, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'input-slider-valor-venda' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    preco_aluguel_ranges: `SELECT properties.value AS range, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'input-slider-valor-aluguel' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    area_ranges: `SELECT properties.value AS range, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'input-slider-area' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    dormitorios: `SELECT properties.value AS valor, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'dormitorios[]' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    suites: `SELECT properties.value AS valor, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'suites[]' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    banheiros: `SELECT properties.value AS valor, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'banheiros[]' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    vagas: `SELECT properties.value AS valor, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field = 'vagas[]' AND properties.site = '${site}' GROUP BY properties.value ORDER BY total DESC LIMIT 10`,
    flags: `SELECT properties.field AS flag, count() AS total FROM events WHERE event = 'search_filter_changed' AND properties.field IN ('filtermobiliado','filterpet','filterpromocao','filternovo','filternaplanta','filterconstrucao','filterpermuta','filtersegfianca','filterproposta') AND properties.site = '${site}' GROUP BY properties.field ORDER BY total DESC LIMIT 20`
  };

  try {
    const keys = Object.keys(queries);
    const results = await Promise.all(keys.map((k) => runQuery(apiHost, projectId, personalKey, queries[k], k)));
    const toPairs = (data?: any[][]) => (Array.isArray(data) ? data.map((r) => [r[0], r[1]]) : []);
    const out: Record<string, any> = {};
    keys.forEach((k, i) => { out[k] = toPairs(results[i].results); });
    return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: 'posthog error', details: String(e) }, { status: 502 });
  }
}


