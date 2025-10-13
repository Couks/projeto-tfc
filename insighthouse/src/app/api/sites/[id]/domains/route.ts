import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { isValidFqdn } from '@/lib/site';

const schema = z.object({ host: z.string().transform((s) => s.toLowerCase()) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  const { host } = parsed.data;
  if (!isValidFqdn(host)) return NextResponse.json({ error: 'invalid host' }, { status: 400 });

  const { id } = await params;
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) return NextResponse.json({ error: 'site not found' }, { status: 404 });

  const d = await prisma.domain.create({ data: { siteId: site.id, host, isPrimary: false } });
  return NextResponse.json(d);
}


