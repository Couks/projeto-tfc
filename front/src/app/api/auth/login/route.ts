import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from "zod";
import { createSignedSessionCookie, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  console.log("[Auth][Login] request received");
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { email, password } = parsed.data;

  console.log("[Auth][Login] find user", { email });
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = (user as unknown as { passwordHash?: string })
    ?.passwordHash;
  if (!user || !passwordHash)
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  const ok = await verifyPassword(password, passwordHash);
  if (!ok)
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const signed = createSignedSessionCookie({ userId: user.id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", signed, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  console.log("[Auth][Login] success", { userId: user.id });
  return res;
}


