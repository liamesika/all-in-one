import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Server-side integrations
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // Filter sensitive data
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }
    return event;
  },
});
