export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Verifies environment configuration and service availability
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      productions: process.env.FEATURE_PRODUCTIONS !== 'false',
      ai: process.env.FEATURE_AI_ASSISTANTS !== 'false',
      exports: process.env.FEATURE_EXPORT_PACK !== 'false',
    },
    services: {
      database: !!process.env.DATABASE_URL,
      firebase: !!(
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ),
      stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
      aws: !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
      ),
      redis: !!process.env.REDIS_URL,
      openai: !!process.env.OPENAI_API_KEY,
    },
    build: {
      node: process.version,
      nextVersion: require('next/package.json').version,
    },
  };

  // Check for missing critical services
  const missingCritical = [];
  if (!health.services.database) missingCritical.push('DATABASE_URL');
  if (!health.services.firebase) missingCritical.push('FIREBASE_*');
  if (!health.services.stripe) missingCritical.push('STRIPE_*');
  if (!health.services.aws) missingCritical.push('AWS_*');

  if (missingCritical.length > 0) {
    return NextResponse.json(
      {
        ...health,
        status: 'degraded',
        warnings: `Missing critical environment variables: ${missingCritical.join(', ')}`,
      },
      { status: 200 } // Still return 200 for health checks
    );
  }

  return NextResponse.json(health);
}
