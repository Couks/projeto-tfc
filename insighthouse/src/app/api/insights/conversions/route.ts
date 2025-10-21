import { NextResponse } from "next/server";

/**
 * Fetches conversion analytics from PostHog
 *
 * Returns:
 * - Conversion funnel stages
 * - Conversion types breakdown
 * - Form interaction metrics
 * - CTA performance
 * - Top converting properties
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
    // Basic conversion funnel
    funnel_stages: `
      SELECT
        event,
        count(DISTINCT properties.session_id) as sessions
      FROM events
      WHERE
        event IN (
          'session_start',
          'search_submit',
          'viewed_property',
          'opened_contact_form',
          'contact_form_submit',
          'conversion_contact_form'
        )
        AND properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY event
      ORDER BY sessions DESC
    `,

    // Basic conversion types
    conversion_types: `
      SELECT
        event,
        count(*) as total
      FROM events
      WHERE
        event IN (
          'conversion_contact_form',
          'conversion_whatsapp_click',
          'conversion_phone_click',
          'conversion_email_click'
        )
        AND properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY event
      ORDER BY total DESC
    `,

    // Basic form interactions
    form_interactions: `
      SELECT
        event,
        count(*) as total
      FROM events
      WHERE
        event IN (
          'contact_form_field_focus',
          'contact_form_field_filled',
          'contact_form_started',
          'contact_form_submit',
          'contact_form_abandoned'
        )
        AND properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY event
      ORDER BY total DESC
    `,

    // Basic CTA clicks
    cta_performance: `
      SELECT
        event,
        count(*) as total
      FROM events
      WHERE
        event IN (
          'clicked_fazer_proposta',
          'clicked_alugar_imovel',
          'clicked_mais_informacoes'
        )
        AND properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY event
      ORDER BY total DESC
    `,

    // Basic top properties
    top_properties: `
      SELECT
        properties.property_code,
        count(*) as conversions
      FROM events
      WHERE
        event IN (
          'conversion_contact_form',
          'conversion_whatsapp_click',
          'conversion_phone_click'
        )
        AND properties.site = '${site}'
        AND properties.property_code IS NOT NULL
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY properties.property_code
      ORDER BY conversions DESC
      LIMIT 10
    `,

    // Basic form metrics
    contact_form_metrics: `
      SELECT
        count(CASE WHEN event = 'opened_contact_form' THEN 1 END) as opened,
        count(CASE WHEN event = 'contact_form_started' THEN 1 END) as started,
        count(CASE WHEN event = 'contact_form_submit' THEN 1 END) as submitted,
        count(CASE WHEN event = 'contact_form_abandoned' THEN 1 END) as abandoned
      FROM events
      WHERE
        properties.site = '${site}'
        AND timestamp >= now() - INTERVAL 30 DAY
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
      if (k === "contact_form_metrics") {
        out[k] = results[i].results?.[0] ? { ...results[i].results[0] } : {};
      } else {
        out[k] = Array.isArray(results[i].results)
          ? results[i].results.map((r) => [r[0], r[1]])
          : [];
      }
    });

    // Add default values for missing metrics
    out.contact_form_metrics = {
      opened: 0,
      started: 0,
      submitted: 0,
      abandoned: 0,
      avg_completeness: 0,
      ...out.contact_form_metrics,
    };

    return NextResponse.json(out, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("[API][GET /api/insights/conversions]", e);
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
      kind: "HogQLQuery",
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

