import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for authentication on auth routes
  if (pathname.startsWith('/auth/')) {
    const authToken = request.cookies.get('authToken')?.value

    // If user is authenticated and trying to access login/signup, redirect to home
    if (authToken && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth/:path*',
  ],
}