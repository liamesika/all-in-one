import { NextRequest, NextResponse } from 'next/server';
import { getVerticalFromPath, getVerticalDashboardPath } from '@/lib/vertical-mapping';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      // Redirect to login with next parameter
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl, 302);
    }

    // For Edge middleware, we'll do a simple session check
    // The real authentication logic will be handled by API routes

    // Allow access to base /dashboard route - redirect to default vertical (real-estate)
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const dashboardUrl = new URL('/dashboard/real-estate/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl, 302);
    }

    // For now, allow access to all dashboard routes
    // Real vertical enforcement will happen in the API routes
    const requestedVertical = getVerticalFromPath(pathname);

    // If accessing an unknown vertical, redirect to real-estate as default
    if (pathname.startsWith('/dashboard/') && !requestedVertical) {
      const defaultDashboardUrl = new URL('/dashboard/real-estate/dashboard', request.url);
      return NextResponse.redirect(defaultDashboardUrl, 302);
    }

    // Allow access
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    // On any error, redirect to login (never return 500)
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl, 302);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};