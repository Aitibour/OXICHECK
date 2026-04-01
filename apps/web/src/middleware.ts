import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (
    pathname.startsWith('/checkin/') ||
    pathname.startsWith('/dashboard/login') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Dashboard and admin routes require a token cookie or header
  // Note: In production, use httpOnly cookies set by the API. For now we check
  // the 'token' cookie which is set client-side after login.
  const token = request.cookies.get('token')?.value;

  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }

  // Admin routes: verify PLATFORM_ADMIN role from JWT payload
  if (pathname.startsWith('/admin') && token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.role !== 'PLATFORM_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
