/**
 * Productions Analytics - Comprehensive event tracking for Productions vertical
 *
 * This module provides a centralized analytics interface for tracking user actions
 * and system events in the Productions vertical. It supports multiple analytics
 * providers (GA4, Mixpanel, Amplitude) and error tracking (Sentry).
 */

// Event categories
export enum AnalyticsCategory {
  PROJECT = 'Project',
  TASK = 'Task',
  CLIENT = 'Client',
  REPORT = 'Report',
  CALENDAR = 'Calendar',
  AI_ASSISTANT = 'AI Assistant',
  NAVIGATION = 'Navigation',
  PERFORMANCE = 'Performance',
  ERROR = 'Error'
}

// Event actions
export enum AnalyticsAction {
  // Project actions
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  PROJECT_VIEWED = 'project_viewed',
  PROJECT_STATUS_CHANGED = 'project_status_changed',
  PROJECT_EXPORTED = 'project_exported',

  // Task actions
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_COMPLETED = 'task_completed',
  TASK_ASSIGNED = 'task_assigned',
  TASK_STATUS_CHANGED = 'task_status_changed',
  TASK_MOVED = 'task_moved', // Kanban board

  // Client actions
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
  CLIENT_DELETED = 'client_deleted',
  CLIENT_VIEWED = 'client_viewed',
  CLIENT_CONTACTED = 'client_contacted',

  // Report actions
  REPORT_VIEWED = 'report_viewed',
  REPORT_EXPORTED = 'report_exported',
  REPORT_FILTERED = 'report_filtered',
  CHART_INTERACTED = 'chart_interacted',

  // Calendar actions
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_DELETED = 'event_deleted',
  EVENT_VIEWED = 'event_viewed',
  CALENDAR_VIEW_CHANGED = 'calendar_view_changed',

  // AI Assistant actions
  AI_CHAT_OPENED = 'ai_chat_opened',
  AI_CHAT_CLOSED = 'ai_chat_closed',
  AI_QUESTION_ASKED = 'ai_question_asked',
  AI_SUGGESTION_VIEWED = 'ai_suggestion_viewed',
  AI_SUGGESTION_ACCEPTED = 'ai_suggestion_accepted',
  AI_SUGGESTION_DISMISSED = 'ai_suggestion_dismissed',

  // Navigation actions
  PAGE_VIEWED = 'page_viewed',
  COMMAND_PALETTE_OPENED = 'command_palette_opened',
  KEYBOARD_SHORTCUT_USED = 'keyboard_shortcut_used',
  SEARCH_PERFORMED = 'search_performed',

  // Performance actions
  PAGE_LOAD = 'page_load',
  API_CALL = 'api_call',

  // Error actions
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error'
}

interface AnalyticsEvent {
  category: AnalyticsCategory;
  action: AnalyticsAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  userId?: string;
  orgId?: string;
  timestamp?: Date;
}

interface PerformanceMetrics {
  pageLoadTime?: number;
  apiResponseTime?: number;
  renderTime?: number;
  resourceTimings?: PerformanceTiming;
}

class ProductionsAnalytics {
  private isInitialized = false;
  private debugMode = process.env.NODE_ENV === 'development';
  private userId?: string;
  private orgId?: string;

  /**
   * Initialize analytics with user context
   */
  initialize(userId?: string, orgId?: string) {
    this.userId = userId;
    this.orgId = orgId;
    this.isInitialized = true;

    if (this.debugMode) {
      console.log('[Analytics] Initialized', { userId, orgId });
    }

    // Initialize analytics providers (GA4, Mixpanel, etc.)
    this.initializeProviders();
  }

  private initializeProviders() {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: this.userId,
        custom_map: {
          dimension1: 'organization_id'
        }
      });

      if (this.debugMode) {
        console.log('[Analytics] GA4 initialized');
      }
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      if (this.userId) {
        (window as any).mixpanel.identify(this.userId);
        (window as any).mixpanel.people.set({
          $name: this.userId,
          organization_id: this.orgId
        });
      }

      if (this.debugMode) {
        console.log('[Analytics] Mixpanel initialized');
      }
    }
  }

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent) {
    if (!this.isInitialized && !this.debugMode) {
      console.warn('[Analytics] Not initialized. Call initialize() first.');
      return;
    }

    const enrichedEvent = {
      ...event,
      userId: event.userId || this.userId,
      orgId: event.orgId || this.orgId,
      timestamp: event.timestamp || new Date(),
      metadata: {
        ...event.metadata,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        screenResolution: typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : undefined
      }
    };

    if (this.debugMode) {
      console.log('[Analytics] Event tracked:', enrichedEvent);
    }

    // Send to Google Analytics 4
    this.trackGA4(enrichedEvent);

    // Send to Mixpanel
    this.trackMixpanel(enrichedEvent);

    // Send to custom backend (optional)
    this.trackBackend(enrichedEvent);
  }

  private trackGA4(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    }
  }

  private trackMixpanel(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(`${event.category}: ${event.action}`, {
        label: event.label,
        value: event.value,
        ...event.metadata
      });
    }
  }

  private async trackBackend(event: AnalyticsEvent) {
    try {
      // Optional: Send to your own analytics API
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      if (this.debugMode) {
        console.error('[Analytics] Backend tracking failed:', error);
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle: string, metadata?: Record<string, any>) {
    this.track({
      category: AnalyticsCategory.NAVIGATION,
      action: AnalyticsAction.PAGE_VIEWED,
      label: pagePath,
      metadata: {
        pageTitle,
        ...metadata
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics, context?: string) {
    this.track({
      category: AnalyticsCategory.PERFORMANCE,
      action: AnalyticsAction.PAGE_LOAD,
      label: context,
      value: metrics.pageLoadTime,
      metadata: metrics
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error | string, context?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    this.track({
      category: AnalyticsCategory.ERROR,
      action: AnalyticsAction.ERROR_OCCURRED,
      label: errorMessage,
      metadata: {
        context,
        severity,
        stack: errorStack,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      }
    });

    // Also send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        level: severity,
        tags: { context }
      });
    }
  }

  /**
   * Track user timing (for performance monitoring)
   */
  trackTiming(category: string, variable: string, time: number, label?: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category,
        event_label: label
      });
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', 'user_properties', properties);
    }

    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.people.set(properties);
    }
  }

  /**
   * Track conversion/goal completion
   */
  trackGoal(goalName: string, value?: number, metadata?: Record<string, any>) {
    this.track({
      category: AnalyticsCategory.PROJECT, // Adjust based on context
      action: goalName as AnalyticsAction,
      value,
      metadata: {
        ...metadata,
        goalCompleted: true
      }
    });
  }
}

// Singleton instance
export const analytics = new ProductionsAnalytics();

// Convenience functions for common events
export const trackProjectEvent = (action: AnalyticsAction, projectId: string, metadata?: Record<string, any>) => {
  analytics.track({
    category: AnalyticsCategory.PROJECT,
    action,
    label: projectId,
    metadata
  });
};

export const trackTaskEvent = (action: AnalyticsAction, taskId: string, metadata?: Record<string, any>) => {
  analytics.track({
    category: AnalyticsCategory.TASK,
    action,
    label: taskId,
    metadata
  });
};

export const trackClientEvent = (action: AnalyticsAction, clientId: string, metadata?: Record<string, any>) => {
  analytics.track({
    category: AnalyticsCategory.CLIENT,
    action,
    label: clientId,
    metadata
  });
};

export const trackAIEvent = (action: AnalyticsAction, context?: string, metadata?: Record<string, any>) => {
  analytics.track({
    category: AnalyticsCategory.AI_ASSISTANT,
    action,
    label: context,
    metadata
  });
};

export const trackNavigationEvent = (action: AnalyticsAction, destination: string, metadata?: Record<string, any>) => {
  analytics.track({
    category: AnalyticsCategory.NAVIGATION,
    action,
    label: destination,
    metadata
  });
};
