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

  const apiHost = process.env.POSTHOG_API_HOST || 'https://app.posthog.com';
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY ?? '';
  const projectId = process.env.POSTHOG_PROJECT_ID ?? 'DEFAULT';

  const query = {
    kind: 'HogQLQuery',
    query: `SELECT properties["cidade"] AS cidade, count() AS total FROM events WHERE event = 'search_filter_city' AND properties["site"] = $site GROUP BY cidade ORDER BY total DESC LIMIT 10`,
    params: { site: siteKey }
  };

  const r = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${personalKey}`
    },
    body: JSON.stringify(query)
  });
  if (!r.ok) return NextResponse.json({ error: 'posthog error' }, { status: 502 });
  const data = await r.json();

  MEMO[cacheKey] = { data, ts: Date.now() };
  return NextResponse.json(data, { headers: { 'x-cache': 'miss' } });
}


