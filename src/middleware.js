/**
 * Next.js Middleware - Route Protection
 * Migrated from: Java SecurityConfig.java
 * Protects specific routes requiring authentication
 */

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'
);

// Routes that require authentication
const protectedRoutes = ['/checkout', '/orders'];

// Routes that require admin access
const adminRoutes = ['/admin', '/dashboard'];

// API routes that require authentication
const protectedApiRoutes = ['/api/auth/me'];

// API routes that require admin access
const adminApiRoutes = ['/api/admin', '/api/products/new-arrivals']; // Example admin APIs

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedPage = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminPage = adminRoutes.some((route) => pathname.startsWith(route));

  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route));
  const isAdminApi = adminApiRoutes.some((route) => pathname.startsWith(route)) ||
    (pathname === '/api/products' && request.method !== 'GET');

  if (isProtectedPage || isAdminPage) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Admin Check
      if (isAdminPage && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtectedApi || isAdminApi) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const token = authHeader.substring(7);
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Admin Check for API
      if (isAdminApi && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }

      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on routes that actually need auth checks.
    // This avoids intercepting static assets, sitemap, and favicon.
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/auth/me',
    '/api/admin/:path*',
    '/api/products',
  ],
};

