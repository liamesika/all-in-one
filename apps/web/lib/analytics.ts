/**
 * Analytics tracking utilities
 * Reuses existing event schema for consistency
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export const trackEvent = (event: AnalyticsEvent): void => {
  if (typeof window === 'undefined') return;

  // Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event.name, event.properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.name, event.properties);
  }
};

// Dashboard-specific events
export const analytics = {
  // Filter interactions
  filterChanged: (filterType: string, value: string) => {
    trackEvent({
      name: 'filter_changed',
      properties: {
        filter_type: filterType,
        filter_value: value,
        page: 'real_estate_dashboard',
      },
    });
  },

  // KPI card clicks
  kpiCardClicked: (kpiName: string, destination: string) => {
    trackEvent({
      name: 'kpi_card_clicked',
      properties: {
        kpi_name: kpiName,
        destination_url: destination,
        page: 'real_estate_dashboard',
      },
    });
  },

  // Empty state CTA clicks
  emptyStateCTAClicked: (actionLabel: string, destination: string) => {
    trackEvent({
      name: 'empty_state_cta_clicked',
      properties: {
        action_label: actionLabel,
        destination_url: destination,
        page: 'real_estate_dashboard',
      },
    });
  },

  // Dashboard page view
  dashboardViewed: (orgId: string | null, hasData: boolean) => {
    trackEvent({
      name: 'dashboard_viewed',
      properties: {
        org_id: orgId,
        has_data: hasData,
        page: 'real_estate_dashboard',
      },
    });
  },
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, properties?: Record<string, unknown>) => void;
  }
}
