import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  name: z.string().trim().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  console.log('[Auth][Register] request received');
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    console.warn('[Auth][Register] invalid_body');
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { email, password, name } = parsed.data;

  try {
    console.log('[Auth][Register] checking existing user', { email });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.warn('[Auth][Register] email_taken', { email });
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const created = await prisma.user.create({ data: { email, name, passwordHash } });
    console.log('[Auth][Register] user created', { userId: created.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[Auth][Register] register_failed', e);
    return NextResponse.json({ error: 'register_failed' }, { status: 500 });
  }
}


