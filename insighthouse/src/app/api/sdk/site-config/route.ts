import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteKey = searchParams.get('site')?.trim();
  if (!siteKey) {
    return NextResponse.json({ error: 'missing site parameter' }, { status: 400 });
  }

  const site = await prisma.site.findUnique({
    where: { siteKey },
    include: { domains: true, settings: true }
  });

  if (!site || site.status !== 'active') {
    return NextResponse.json({ error: 'site not found or inactive' }, { status: 404 });
  }

  const allowedDomains = site.domains.map((d) => d.host.toLowerCase());
  const groupEnabled = true;
  const options: Record<string, unknown> = {};
  const consentDefault = site.settings.find((s) => s.key === 'consent_default')?.value ?? 'opt_in';

  return NextResponse.json({
    phKey: process.env.POSTHOG_PROJECT_API_KEY,
    apiHost:
      process.env.POSTHOG_PUBLIC_API_HOST || process.env.POSTHOG_API_HOST,
    allowedDomains,
    groupEnabled,
    options,
    consentDefault,
  });
}


