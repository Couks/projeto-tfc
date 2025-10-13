import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email }, create: { email }, update: {} });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', JSON.stringify({ userId: user.id }), { httpOnly: true, path: '/', sameSite: 'lax' });
  return res;
}


