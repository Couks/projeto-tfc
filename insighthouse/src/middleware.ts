import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that never require auth (public)
const PUBLIC_PATHS: Array<(p: string) => boolean> = [
  (p) => p === '/',
  (p) => p === '/login',
  (p) => p.startsWith('/api/auth/'),
  (p) => p.startsWith('/api/sdk/'),
  (p) => p.startsWith('/static/'),
];

// Paths that require auth (protected)
const PROTECTED_PATHS: Array<(p: string) => boolean> = [
  (p) => p.startsWith('/admin'),
  (p) => p.startsWith('/api/sites'),
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((fn) => fn(pathname));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((fn) => fn(pathname));
}

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || '';
  if (!s) return 'dev-secret-do-not-use-in-prod';
  return s;
}

async function hmacHex(raw: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(raw));
  const bytes = new Uint8Array(sig);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignedCookie(v: string | undefined): Promise<{ userId: string } | null> {
  if (!v) return null;
  const lastDot = v.lastIndexOf('.');
  if (lastDot <= 0) return null;
  const raw = v.slice(0, lastDot);
  const sig = v.slice(lastDot + 1);
  const check = await hmacHex(raw, getSecret());
  const ok = constantTimeEqual(sig, check);
  if (!ok) return null;
  try {
    const parsed = JSON.parse(raw) as { userId: string };
    return typeof parsed?.userId === 'string' && parsed.userId.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

async function hasValidSessionCookie(req: NextRequest): Promise<boolean> {
  const c = req.cookies.get('admin_session');
  return !!(await verifySignedCookie(c?.value));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Require auth for protected paths
  if (isProtectedPath(pathname)) {
    const has = await hasValidSessionCookie(req);
    if (!has) {
      console.warn('[Middleware] blocked unauthenticated access', { pathname });
      const url = new URL('/login', req.url);
      return NextResponse.redirect(url);
    }
    console.log('[Middleware] allowed', { pathname });
    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
}

// Exclude Next.js internals and static assets from middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};


