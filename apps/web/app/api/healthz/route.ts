import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Health check structure
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown', latency: 0, error: null },
        authentication: { status: 'unknown', error: null },
        api: { status: 'ok', latency: 0 }
      },
      version: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
        build: process.env.NEXT_PUBLIC_BUILD_ID || 'development'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // Test database connectivity
    try {
      const dbStart = Date.now();

      // Import Prisma client dynamically to avoid Edge runtime issues
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Simple database health check query
      await prisma.$queryRaw`SELECT 1 as health`;
      await prisma.$disconnect();

      health.services.database = {
        status: 'ok',
        latency: Date.now() - dbStart,
        error: null
      };
    } catch (dbError: any) {
      health.services.database = {
        status: 'error',
        latency: Date.now() - startTime,
        error: dbError.message || 'Database connection failed'
      };
      health.status = 'degraded';
    }

    // Test authentication service
    try {
      // Import Firebase Admin dynamically
      const admin = await import('firebase-admin');

      if (!admin.apps.length) {
        // Initialize Firebase Admin if not already done
        const serviceAccount = {
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          });
        }
      }

      // Test Firebase connection (no actual user operation)
      if (admin.apps.length > 0) {
        // Simple auth service health check
        health.services.authentication = {
          status: 'ok',
          error: null
        };
      } else {
        health.services.authentication = {
          status: 'error',
          error: 'Firebase Admin not initialized'
        };
        health.status = 'degraded';
      }
    } catch (authError: any) {
      health.services.authentication = {
        status: 'error',
        error: authError.message || 'Authentication service unavailable'
      };
      health.status = 'degraded';
    }

    // Calculate total response time
    health.services.api.latency = Date.now() - startTime;

    // Return appropriate HTTP status
    const httpStatus = health.status === 'ok' ? 200 :
                      health.status === 'degraded' ? 503 : 500;

    return NextResponse.json(health, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    // Catastrophic failure
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Health check failed',
      services: {
        database: { status: 'unknown', error: 'Health check failed' },
        authentication: { status: 'unknown', error: 'Health check failed' },
        api: { status: 'error', latency: Date.now() - startTime }
      }
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}