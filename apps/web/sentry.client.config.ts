import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay and Performance
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter sensitive data
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
    }
    return event;
  },

  // Ignore common non-critical errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection',
    'Load failed',
    'NetworkError',
  ],
});
