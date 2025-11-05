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

/**
 * Decodifica base64url (usado em JWTs)
 * Edge Runtime compatible
 */
function base64UrlDecode(str: string): string {
  // Converte base64url para base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

  // Adiciona padding se necessário
  while (base64.length % 4) {
    base64 += '='
  }

  // Decodifica usando atob (disponível no Edge Runtime)
  try {
    return atob(base64)
  } catch {
    return ''
  }
}

/**
 * Verifica e decodifica JWT do cookie
 * No Edge Runtime, apenas valida formato e expiração
 * A validação completa da assinatura é feita no backend
 */
function verifyJwt(token: string): { userId: string } | null {
  if (!token) return null

  try {
    // JWT tem formato: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Decodifica o payload (segunda parte)
    const payloadJson = base64UrlDecode(parts[1])
    if (!payloadJson) return null

    const payload = JSON.parse(payloadJson) as {
      userId?: string
      sub?: string
      exp?: number
      iat?: number
    }

    // Valida que tem userId ou sub
    const userId = payload.userId || payload.sub
    if (!userId || typeof userId !== 'string') {
      return null
    }

    // Verifica expiração (se presente)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        // Token expirado
        return null
      }
    }

    return { userId }
  } catch {
    // Qualquer erro de parsing ou decodificação retorna null
    return null
  }
}

async function hasValidSessionCookie(req: NextRequest): Promise<boolean> {
  const c = req.cookies.get('admin_session')
  return !!verifyJwt(c?.value || '')
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
        cookies: req.cookies.getAll().map((c: any) => ({
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
