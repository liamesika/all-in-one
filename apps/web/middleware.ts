import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // CRITICAL: Normalize non-canonical vertical paths to canonical /dashboard/<vertical>/...
  // Match: /(real-estate|e-commerce|law|production)/... (missing /dashboard/ prefix)
  const nonCanonicalMatch = pathname.match(/^\/(real-estate|e-commerce|law|production)(\/.*)?$/);
  if (nonCanonicalMatch) {
    const vertical = nonCanonicalMatch[1];
    const restOfPath = nonCanonicalMatch[2] || '';
    const canonicalPath = `/dashboard/${vertical}${restOfPath}`;
    const redirectUrl = new URL(canonicalPath + search, request.url);

    console.log('[Middleware] Non-canonical path detected, redirecting:');
    console.log('  From:', pathname + search);
    console.log('  To:', canonicalPath + search);

    return NextResponse.redirect(redirectUrl, 308); // 308 = Permanent Redirect, preserves method
  }

  // Only apply auth checks to dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;

    // TEMPORARY: Allow access without session cookie for now
    // The client has Firebase auth which will be verified by API routes
    // TODO: Re-enable session cookie requirement once Firebase Admin is properly configured in production
    if (!sessionCookie) {
      console.log('[Middleware] No session cookie, but allowing access (temporary)');
      // Redirect to login with next parameter
      // const loginUrl = new URL('/login', request.url);
      // loginUrl.searchParams.set('next', pathname);
      // return NextResponse.redirect(loginUrl, 302);
    }

    // For base /dashboard route, we need to determine which vertical dashboard to redirect to
    // We'll let the client-side handle this redirect by fetching user data from /api/auth/me
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      // Redirect to a loading page that will fetch user data and redirect appropriately
      // For now, redirect to e-commerce as default - the page.tsx will handle proper routing
      const response = NextResponse.next();
      response.headers.set('x-middleware-rewrite', '/dashboard/e-commerce/dashboard');
      return response;
    }

    // Allow access to all other dashboard routes
    // The actual vertical enforcement happens at the page level via /api/auth/me
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
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
