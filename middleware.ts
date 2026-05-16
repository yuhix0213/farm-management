// middleware.ts — プロジェクトルートに配置
// 全ページ・APIを認証でガード（ログインページ・認証APIは除外）

import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'farm_session'

function isValidToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  if (parts[0].length < 10 || parts[1].length < 10) return false
  return true
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = [
    '/auth/login',
    '/api/auth/login',
    '/api/auth/logout',
    '/_next',
    '/favicon.ico',
  ]
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!isValidToken(token)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'ログインが必要です' }, { status: 401 })
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
