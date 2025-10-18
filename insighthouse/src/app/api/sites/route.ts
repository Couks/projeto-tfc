import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateSiteKey, isValidFqdn } from '@/lib/site';
import { getSession } from '@/lib/auth';

const createSchema = z.object({
  name: z.string().min(2),
  domain: z.string().transform((s) => s.toLowerCase())
});

// GET /api/sites - List all sites for the logged-in user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const sites = await prisma.site.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        name: true,
        siteKey: true,
        status: true,
        createdAt: true,
        domains: {
          select: {
            id: true,
            host: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error('[API][GET /api/sites]', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  const { name, domain } = parsed.data;
  if (!isValidFqdn(domain)) return NextResponse.json({ error: 'invalid domain' }, { status: 400 });

  const siteKey = generateSiteKey();
  const userId = session.userId;

  const site = await prisma.site.create({
    data: {
      name,
      userId,
      siteKey,
      status: 'active',
      domains: { create: { host: domain, isPrimary: true } },
      settings: { create: { key: 'consent_default', value: 'opt_in' } }
    },
    include: { domains: true, settings: true }
  });

  return NextResponse.json({
    id: site.id,
    siteKey: site.siteKey,
    loaderUrl: `${process.env.SITE_URL || ''}/api/sdk/loader?site=${encodeURIComponent(site.siteKey)}`
  });
}


