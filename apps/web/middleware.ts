// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Completely disable middleware for deployment troubleshooting
  return NextResponse.next();
}

// Temporarily disable matcher to prevent any middleware execution
export const config = {
  matcher: [],
};
