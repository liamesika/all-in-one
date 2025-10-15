import { NextResponse, NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  try {
    return NextResponse.next();
  } catch (e: any) {
    return new NextResponse('MW crash', {
      status: 500,
      headers: {
        'x-mw-error': String(e?.message || e),
        'x-mw-name': String(e?.name || ''),
        'x-mw-stack': String(e?.stack || '').slice(0, 500),
      },
    });
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
