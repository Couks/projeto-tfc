import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that never require auth (public)
const PUBLIC_PATHS: Array<(p: string) => boolean> = [
  (p) => p === '/',
  (p) => p === '/login',
]

// Paths that require auth (protected)
const PROTECTED_PATHS: Array<(p: string) => boolean> = [
  (p) => p.startsWith('/admin'),
  (p) => p.startsWith('/api/sites'),
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((fn) => fn(pathname))
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((fn) => fn(pathname))
}

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || ''
  if (!s) return 'dev-secret-do-not-use-in-prod'
  return s
}

/**
 * Verifica e decodifica cookie de sessão assinado
 * Usa Web Crypto API compatível com Edge Runtime
 * Formato: dados.hmac_hex (mesmo do backend NestJS)
 */
async function verifySignedCookie(
  signed: string
): Promise<{ userId: string } | null> {
  if (!signed) return null

  try {
    // Encontra o último '.' que separa dados da assinatura
    const lastDot = signed.lastIndexOf('.')
    if (lastDot <= 0) return null

    // Separa dados (antes do .) e assinatura (depois do .)
    const raw = signed.slice(0, lastDot)
    const sigFromCookie = signed.slice(lastDot + 1)

    // Valida que a assinatura do cookie está em formato hex
    if (!/^[0-9a-f]+$/i.test(sigFromCookie)) return null

    // Cria chave HMAC usando Web Crypto API
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Gera assinatura HMAC-SHA256 dos dados
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(raw)
    )

    // Converte assinatura calculada para hex (mesmo formato do backend)
    const expectedSig = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Compara assinaturas usando constant-time comparison
    // Ambas devem ter o mesmo tamanho (64 caracteres hex = 32 bytes)
    if (expectedSig.length !== sigFromCookie.length) return null

    // Timing-safe comparison para prevenir timing attacks
    let isValid = true
    for (let i = 0; i < expectedSig.length; i++) {
      if (expectedSig[i] !== sigFromCookie[i]) {
        isValid = false
      }
    }

    if (!isValid) return null

    // Se assinatura válida, decodifica o JSON
    const parsed = JSON.parse(raw) as { userId: string }
    // Valida estrutura dos dados
    if (!parsed?.userId || typeof parsed.userId !== 'string') {
      return null
    }

    return parsed
  } catch {
    // Qualquer erro de verificação retorna null
    return null
  }
}

async function hasValidSessionCookie(req: NextRequest): Promise<boolean> {
  const c = req.cookies.get('admin_session')
  return !!(await verifySignedCookie(c?.value || ''))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow all public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Require auth for protected paths
  if (isProtectedPath(pathname)) {
    const has = await hasValidSessionCookie(req)
    if (!has) {
      console.warn('[Middleware] blocked unauthenticated access', {
        pathname,
        cookies: req.cookies.getAll().map((c) => ({
          name: c.name,
          value: c.value?.substring(0, 20) + '...',
        })),
      })
      const url = new URL('/login', req.url)
      return NextResponse.redirect(url)
    }
    console.log('[Middleware] allowed', { pathname })
    return NextResponse.next()
  }

  // Default allow
  return NextResponse.next()
}

// Exclude Next.js internals and static assets from middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
