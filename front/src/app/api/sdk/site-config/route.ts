import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get("site")?.trim();
  if (!siteKey) {
    return NextResponse.json(
      { error: "missing site parameter" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const site = await prisma.site.findUnique({
    where: { siteKey },
    include: { domains: true, settings: true },
  });

  if (!site || site.status !== "active") {
    return NextResponse.json(
      { error: "site not found or inactive" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const allowedDomains = site.domains.map((d: { host: string }) =>
    d.host.toLowerCase()
  );
  const groupEnabled = true;
  const options: Record<string, unknown> = {};
  const consentDefault =
    site.settings.find(
      (s: { key: string; value: string }) => s.key === "consent_default"
    )?.value ?? "opt_in";

  return NextResponse.json(
    {
      phKey: process.env.POSTHOG_PROJECT_API_KEY,
      apiHost: process.env.POSTHOG_PUBLIC_API_HOST || "",
      allowedDomains,
      groupEnabled,
      options,
      consentDefault,
    },
    { headers: CORS_HEADERS }
  );
}


