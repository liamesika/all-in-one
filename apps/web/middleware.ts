// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

// דפים ציבוריים שלא דורשים סשן
const PUBLIC: string[] = ['/', '/login', '/register', '/_not-found', '/industries'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- ALWAYS SKIP: נתיבי Next פנימיים, סטטיים ו-API ----
  if (
    pathname.startsWith('/_next') ||               // כולל HMR וסטטיים
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  // הגנה: רק על דפים "אמיתיים"
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  const hasSession = req.cookies.get('session')?.value;
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// התאמת ראוטים: כל מה שלא קובץ סטטי (אין נקודה בשם הקובץ)
export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
