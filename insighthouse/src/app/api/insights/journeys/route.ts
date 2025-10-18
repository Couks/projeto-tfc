import { NextResponse } from "next/server";

/**
 * Fetches user journey analytics from PostHog
 *
 * Returns:
 * - Session metrics (total sessions, users, avg duration)
 * - Bounce rate metrics
 * - Time on site distribution
 * - Page depth distribution
 * - Traffic sources
 * - Top landing pages
 * - Returning visitor statistics
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get("site")?.trim();

  if (!siteKey) {
    return NextResponse.json({ error: "missing site" }, { status: 400 });
  }

  const apiHost =
    process.env.POSTHOG_PRIVATE_API_HOST || "https://us.posthog.com";
  const personalKey = process.env.POSTHOG_PERSONAL_API_KEY ?? "";
  const projectId = process.env.POSTHOG_PROJECT_ID ?? "";

  if (!personalKey || !projectId) {
    return NextResponse.json(
      { error: "server misconfigured" },
      { status: 500 }
    );
  }

  const site = (siteKey || "").replace(/'/g, "''");

  // Simplified queries to avoid PostHog compatibility issues
  const queries: Record<string, string> = {
    // Basic session metrics
    session_metrics: `
      SELECT
        count(DISTINCT properties.session_id) as total_sessions,
        count(DISTINCT properties.user_id) as total_users,
        avg(properties.page_depth) as avg_page_depth
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND properties.session_id IS NOT NULL
      LIMIT 1
    `,

    // Basic bounce metrics
    bounce_metrics: `
      SELECT
        count(DISTINCT properties.session_id) as total_sessions,
        count(DISTINCT CASE WHEN event = 'bounce_detected' THEN properties.session_id END) as bounced_sessions
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
      LIMIT 1
    `,

    // Simple page depth
    page_depth_distribution: `
      SELECT
        properties.page_depth as depth,
        count(DISTINCT properties.session_id) as sessions
      FROM events
      WHERE
        properties.site = '${site}'
        AND properties.page_depth IS NOT NULL
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY depth
      ORDER BY sessions DESC
      LIMIT 10
    `,

    // Simple time distribution
    time_on_site_distribution: `
      SELECT
        properties.time_on_site as time_on_site,
        count(DISTINCT properties.session_id) as sessions
      FROM events
      WHERE
        properties.site = '${site}'
        AND properties.time_on_site IS NOT NULL
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY time_on_site
      ORDER BY sessions DESC
      LIMIT 10
    `,

    // Simple traffic sources
    traffic_sources: `
      SELECT
        properties.referrer_domain as source,
        count(DISTINCT properties.session_id) as sessions
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND event = 'session_start'
      GROUP BY source
      ORDER BY sessions DESC
      LIMIT 10
    `,

    // Simple landing pages
    top_landing_pages: `
      SELECT
        properties.current_url as landing_page,
        count(DISTINCT properties.session_id) as sessions
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND event = 'session_start'
        AND properties.current_url IS NOT NULL
      GROUP BY landing_page
      ORDER BY sessions DESC
      LIMIT 10
    `,

    // Simple returning visitors
    returning_visitors: `
      SELECT
        count(DISTINCT properties.user_id) as total_users
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND properties.user_id IS NOT NULL
      LIMIT 1
    `,
  };

  try {
    const keys = Object.keys(queries);
    const results = await Promise.all(
      keys.map((k) => runQuery(apiHost, projectId, personalKey, queries[k], k))
    );

    const out: Record<string, any> = {};
    keys.forEach((k, i) => {
      if (k === "session_metrics" || k === "bounce_metrics" || k === "returning_visitors") {
        out[k] = results[i].results?.[0] ? { ...results[i].results[0] } : {};
      } else {
        out[k] = Array.isArray(results[i].results)
          ? results[i].results.map((r) => [r[0], r[1]])
          : [];
      }
    });

    return NextResponse.json(out, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("[API][GET /api/insights/journeys]", e);
    return NextResponse.json(
      { error: "posthog error", details: String(e) },
      { status: 502 }
    );
  }
}

async function runQuery(
  apiHost: string,
  projectId: string,
  personalKey: string,
  query: string,
  queryName: string
) {
  const r = await fetch(`${apiHost}/api/projects/${projectId}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${personalKey}`,
    },
    body: JSON.stringify({
      query: query.trim(),
      kind: "HogQLQuery"
    }),
  });

  if (!r.ok) {
    let details = "Unknown error";
    try {
      details = await r.text();
    } catch {}
    throw new Error(`posthog_error:${r.status}:${details}`);
  }

  return (await r.json()) as HogQLResult;
}

interface HogQLResult {
  results: any[][];
  columns: string[];
  types: string[];
}
