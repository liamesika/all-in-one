// lib/observability.ts - Client-side Observability and Analytics
import React from 'react';

export interface UserEvent {
  event: string;
  category: 'navigation' | 'interaction' | 'error' | 'performance' | 'conversion';
  properties?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  ownerUid?: string;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'ratio';
  page?: string;
  timestamp?: string;
  sessionId?: string;
}

export interface ErrorEvent {
  error: string;
  message: string;
  stack?: string;
  page?: string;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  ownerUid?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ObservabilityManager {
  private sessionId: string;
  private userId?: string;
  private ownerUid?: string;
  private isEnabled: boolean;
  private events: UserEvent[] = [];
  private errors: ErrorEvent[] = [];
  private metrics: PerformanceMetric[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV !== 'test';

    if (this.isEnabled) {
      this.initializeGlobalErrorHandling();
      this.initializePerformanceMonitoring();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user context for all subsequent events
  setUserContext(userId?: string, ownerUid?: string) {
    this.userId = userId;
    this.ownerUid = ownerUid;
  }

  // Track user events (interactions, navigation, etc.)
  track(event: string, category: UserEvent['category'], properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const userEvent: UserEvent = {
      event,
      category,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      ownerUid: this.ownerUid,
    };

    this.events.push(userEvent);

    // Send to analytics endpoint
    this.sendEvent(userEvent);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Analytics]', userEvent);
    }
  }

  // Track errors
  trackError(error: Error | string, severity: ErrorEvent['severity'] = 'medium', additionalContext?: Record<string, any>) {
    if (!this.isEnabled) return;

    const errorEvent: ErrorEvent = {
      error: error instanceof Error ? error.name : 'CustomError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      ownerUid: this.ownerUid,
      severity,
      ...additionalContext,
    };

    this.errors.push(errorEvent);

    // Send to error tracking endpoint
    this.sendError(errorEvent);

    // Console log errors
    console.error('🚨 [Error Tracking]', errorEvent);
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: PerformanceMetric['unit'], page?: string) {
    if (!this.isEnabled) return;

    const performanceMetric: PerformanceMetric = {
      metric,
      value,
      unit,
      page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.metrics.push(performanceMetric);

    // Send to performance monitoring endpoint
    this.sendPerformanceMetric(performanceMetric);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('⚡ [Performance]', performanceMetric);
    }
  }

  // Initialize global error handling
  private initializeGlobalErrorHandling() {
    if (typeof window === 'undefined') return;

    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), 'high', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, 'high', {
        type: 'unhandledPromiseRejection',
      });
    });
  }

  // Initialize performance monitoring
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined' || !window.performance) return;

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          this.trackPerformance('first_byte', navigation.responseStart - navigation.fetchStart, 'ms');
        }
      }, 0);
    });

    // Track Web Vitals if available
    this.trackWebVitals();
  }

  // Track Core Web Vitals
  private trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformance('largest_contentful_paint', lastEntry.startTime, 'ms');
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime, 'ms');
            }
          });
        });
        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }

  // Send events to analytics endpoint
  private async sendEvent(event: UserEvent) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - don't track errors for analytics failures
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send analytics event:', error);
      }
    }
  }

  // Send errors to error tracking endpoint
  private async sendError(error: ErrorEvent) {
    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (err) {
      // Silently fail - don't track errors for error tracking failures
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send error event:', err);
      }
    }
  }

  // Send performance metrics to monitoring endpoint
  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      // Silently fail - don't track errors for performance tracking failures
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send performance metric:', error);
      }
    }
  }

  // Get session statistics for debugging
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      ownerUid: this.ownerUid,
      eventsCount: this.events.length,
      errorsCount: this.errors.length,
      metricsCount: this.metrics.length,
      events: this.events.slice(-10), // Last 10 events
      errors: this.errors.slice(-5),  // Last 5 errors
      metrics: this.metrics.slice(-10), // Last 10 metrics
    };
  }
}

// Global observability instance
export const observability = new ObservabilityManager();

// Convenience methods for common tracking patterns
export const track = {
  // Page views
  pageView: (page: string, properties?: Record<string, any>) => {
    observability.track('page_view', 'navigation', { page, ...properties });
  },

  // User interactions
  click: (element: string, properties?: Record<string, any>) => {
    observability.track('click', 'interaction', { element, ...properties });
  },

  formSubmit: (form: string, properties?: Record<string, any>) => {
    observability.track('form_submit', 'interaction', { form, ...properties });
  },

  modalOpen: (modal: string, properties?: Record<string, any>) => {
    observability.track('modal_open', 'interaction', { modal, ...properties });
  },

  modalClose: (modal: string, properties?: Record<string, any>) => {
    observability.track('modal_close', 'interaction', { modal, ...properties });
  },

  // Business events
  leadCreated: (properties?: Record<string, any>) => {
    observability.track('lead_created', 'conversion', properties);
  },

  campaignCreated: (properties?: Record<string, any>) => {
    observability.track('campaign_created', 'conversion', properties);
  },

  chatMessage: (properties?: Record<string, any>) => {
    observability.track('chat_message', 'interaction', properties);
  },

  // Errors
  error: (error: Error | string, severity?: ErrorEvent['severity'], context?: Record<string, any>) => {
    observability.trackError(error, severity, context);
  },

  // Performance
  performance: (metric: string, value: number, unit: PerformanceMetric['unit'], page?: string) => {
    observability.trackPerformance(metric, value, unit, page);
  },
};

// React Hook for easy tracking in components
export const useTracking = () => {
  return {
    track: observability.track.bind(observability),
    trackError: observability.trackError.bind(observability),
    trackPerformance: observability.trackPerformance.bind(observability),
    setUserContext: observability.setUserContext.bind(observability),
    getSessionStats: observability.getSessionStats.bind(observability),
    ...track,
  };
};

// Higher-order component for automatic page view tracking
export function withPageTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) {
  return function TrackedComponent(props: P) {
    React.useEffect(() => {
      const page = pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
      track.pageView(page);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

export default observability;