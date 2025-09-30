import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { getVerticalFromPath, getVerticalDashboardPath, enumToSlug, type VerticalEnum } from '@/lib/vertical-mapping';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try base64 encoded service account first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
    // Try 3-variable setup
    else if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
    // Fallback to application default credentials
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

const prisma = new PrismaClient();

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

    // Verify Firebase session cookie
    let decodedClaims;
    try {
      decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      console.error('Session verification failed:', error);
      // Redirect to login with next parameter
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl, 302);
    }

    // Look up user profile in database to get defaultVertical
    const userProfile = await prisma.userProfile.findUnique({
      where: { uid: decodedClaims.uid },
      select: { defaultVertical: true },
    });

    if (!userProfile || !userProfile.defaultVertical) {
      console.error('User profile not found or missing defaultVertical for uid:', decodedClaims.uid);
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl, 302);
    }

    const userVertical = userProfile.defaultVertical as VerticalEnum;
    const requestedVertical = getVerticalFromPath(pathname);

    // Allow access to base /dashboard route - redirect to user's vertical
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const dashboardUrl = new URL(getVerticalDashboardPath(userVertical), request.url);
      console.log(`Middleware: Redirecting from ${pathname} to ${dashboardUrl.pathname} for user vertical ${userVertical}`);
      return NextResponse.redirect(dashboardUrl, 302);
    }

    // Check if user is accessing their correct vertical
    if (requestedVertical && requestedVertical !== enumToSlug[userVertical]) {
      // Redirect to user's correct vertical dashboard
      const correctDashboardUrl = new URL(getVerticalDashboardPath(userVertical), request.url);
      console.log(`Middleware: Redirecting from ${pathname} (${requestedVertical}) to ${correctDashboardUrl.pathname} for user vertical ${userVertical}`);
      return NextResponse.redirect(correctDashboardUrl, 302);
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