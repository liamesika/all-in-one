// Sentry configuration for production monitoring
export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event: any) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection',
  ],
};

export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  }
  console.error('Exception:', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level);
  }
  console.log('[Sentry]', level, message);
}
