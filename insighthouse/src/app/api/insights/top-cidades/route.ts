import { NextResponse } from 'next/server';

const MEMO: Record<string, { data: any; ts: number }> = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get('site')?.trim();
  if (!siteKey) return NextResponse.json({ error: 'missing site' }, { status: 400 });

  const cacheKey = `top-cidades:${siteKey}`;
  const cached = MEMO[cacheKey];
  if (cached && Date.now() - cached.ts < 60_000) {
    return NextResponse.json(cached.data, { headers: { 'x-cache': 'hit' } });
  }

  const apiHost =
    process.env.POSTHOG_PRIVATE_API_HOST ||
    process.env.POSTHOG_API_HOST ||
    "https://us.posthog.com";
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY ?? "";
  const projectId = process.env.POSTHOG_PROJECT_ID ?? "";
  if (!personalKey || !projectId) {
    return NextResponse.json(
      { error: "server misconfigured" },
      { status: 500 }
    );
  }

  const escapedSite = (siteKey || "").replace(/'/g, "''");
  const payload = {
    query: {
      kind: "HogQLQuery",
      query: `SELECT properties.cidade AS cidade, count() AS total FROM events WHERE event = 'search_filter_city' AND properties.site = '${escapedSite}' GROUP BY properties.cidade ORDER BY total DESC LIMIT 10`,
    },
    name: "top cidades",
  };

  const r = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${personalKey}`,
      "X-Project-ID": projectId,
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    let details: unknown = undefined;
    try {
      details = await r.text();
    } catch {}
    return NextResponse.json(
      { error: "posthog error", status: r.status, details },
      { status: 502 }
    );
  }
  const data = await r.json();

  MEMO[cacheKey] = { data, ts: Date.now() };
  return NextResponse.json(data, { headers: { 'x-cache': 'miss' } });
}


