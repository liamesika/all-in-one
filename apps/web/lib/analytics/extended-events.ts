// Extended GA4 events with full context
export const extendedEvents = {
  propertyCreated: (propertyId: string, userId: string, source: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'property_created', {
        property_id: propertyId,
        user_id: userId,
        source,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  leadQualified: (leadId: string, score: number, userId: string, role: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_qualified', {
        lead_id: leadId,
        score,
        user_id: userId,
        user_role: role,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  campaignActivated: (campaignId: string, budget: number, platform: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'campaign_activated', {
        campaign_id: campaignId,
        budget,
        platform,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  reportExported: (reportType: string, format: string, dataPoints: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'report_exported', {
        report_type: reportType,
        format,
        data_points: dataPoints,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  sessionMetrics: (duration: number, interactionCount: number, pageViews: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_metrics', {
        duration_seconds: Math.round(duration / 1000),
        interactions: interactionCount,
        page_views: pageViews,
        timestamp: new Date().toISOString()
      });
    }
  }
};
