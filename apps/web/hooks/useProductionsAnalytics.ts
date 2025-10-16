import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  analytics,
  AnalyticsAction,
  AnalyticsCategory,
  trackProjectEvent,
  trackTaskEvent,
  trackClientEvent,
  trackAIEvent,
  trackNavigationEvent
} from '@/lib/analytics/productions-analytics';

/**
 * Custom hook for tracking analytics in Productions vertical
 */
export function useProductionsAnalytics() {
  const pathname = usePathname();

  // Track page views automatically
  useEffect(() => {
    if (pathname && pathname.includes('/production/')) {
      const pageTitle = getPageTitle(pathname);
      analytics.trackPageView(pathname, pageTitle, {
        vertical: 'productions'
      });
    }
  }, [pathname]);

  // Track performance metrics on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        const metrics = {
          pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
          renderTime: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          apiResponseTime: perfData.responseEnd - perfData.requestStart
        };

        analytics.trackPerformance(metrics, pathname);
      }
    }
  }, [pathname]);

  const trackProject = useCallback(
    (action: AnalyticsAction, projectId: string, metadata?: Record<string, any>) => {
      trackProjectEvent(action, projectId, metadata);
    },
    []
  );

  const trackTask = useCallback(
    (action: AnalyticsAction, taskId: string, metadata?: Record<string, any>) => {
      trackTaskEvent(action, taskId, metadata);
    },
    []
  );

  const trackClient = useCallback(
    (action: AnalyticsAction, clientId: string, metadata?: Record<string, any>) => {
      trackClientEvent(action, clientId, metadata);
    },
    []
  );

  const trackAI = useCallback(
    (action: AnalyticsAction, context?: string, metadata?: Record<string, any>) => {
      trackAIEvent(action, context, metadata);
    },
    []
  );

  const trackNavigation = useCallback(
    (action: AnalyticsAction, destination: string, metadata?: Record<string, any>) => {
      trackNavigationEvent(action, destination, metadata);
    },
    []
  );

  const trackSearch = useCallback((query: string, resultCount: number, context: string) => {
    analytics.track({
      category: AnalyticsCategory.NAVIGATION,
      action: AnalyticsAction.SEARCH_PERFORMED,
      label: context,
      metadata: {
        query,
        resultCount,
        queryLength: query.length
      }
    });
  }, []);

  const trackExport = useCallback((exportType: string, itemCount: number, format: string) => {
    analytics.track({
      category: AnalyticsCategory.REPORT,
      action: AnalyticsAction.REPORT_EXPORTED,
      label: exportType,
      metadata: {
        itemCount,
        format
      }
    });
  }, []);

  const trackError = useCallback((error: Error | string, context?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
    analytics.trackError(error, context, severity);
  }, []);

  return {
    // Category-specific tracking
    trackProject,
    trackTask,
    trackClient,
    trackAI,
    trackNavigation,

    // Common actions
    trackSearch,
    trackExport,
    trackError,

    // Generic tracking
    track: analytics.track.bind(analytics),

    // Analytics instance for advanced usage
    analytics
  };
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const titles: Record<string, string> = {
    dashboard: 'Productions Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    company: 'Clients',
    calendar: 'Calendar & Timeline',
    reports: 'Reports & Analytics',
    team: 'Team',
    suppliers: 'Suppliers',
    private: 'Private Files'
  };

  return titles[lastSegment] || 'Productions';
}
