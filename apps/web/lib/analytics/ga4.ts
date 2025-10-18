/**
 * Google Analytics 4 wrapper for Productions vertical
 * Event naming: prod_* prefix
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track GA4 event with Productions prefix
 */
export const trackEvent = (
  eventName: string,
  properties?: EventProperties
): void => {
  if (typeof window === 'undefined') return;

  // Ensure event has prod_ prefix
  const prefixedEventName = eventName.startsWith('prod_')
    ? eventName
    : `prod_${eventName}`;

  if (window.gtag) {
    window.gtag('event', prefixedEventName, {
      vertical: 'productions',
      timestamp: new Date().toISOString(),
      ...properties,
    });
  } else {
    // Fallback: log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4]', prefixedEventName, properties);
    }
  }
};

// ========= CUSTOMER EVENTS ========= //

export const customerEvents = {
  viewed: (customerId: string) =>
    trackEvent('customer_viewed', { customer_id: customerId }),

  created: (customerId: string, hasCompany: boolean, tagCount: number) =>
    trackEvent('customer_created', {
      customer_id: customerId,
      has_company: hasCompany,
      tag_count: tagCount,
    }),

  updated: (customerId: string, fieldsChanged: string[]) =>
    trackEvent('customer_updated', {
      customer_id: customerId,
      fields_changed: fieldsChanged.join(','),
      field_count: fieldsChanged.length,
    }),

  deleted: (customerId: string, projectCount: number) =>
    trackEvent('customer_deleted', {
      customer_id: customerId,
      project_count: projectCount,
    }),

  searched: (query: string, resultCount: number) =>
    trackEvent('customer_searched', {
      query_length: query.length,
      result_count: resultCount,
    }),

  filtered: (tags: string[]) =>
    trackEvent('customer_filtered', {
      filter_type: 'tags',
      filter_count: tags.length,
      filters: tags.join(','),
    }),
};

// ========= CALENDAR EVENTS ========= //

export const calendarEvents = {
  viewed: (viewMode: 'month' | 'week' | 'agenda', eventCount: number) =>
    trackEvent('calendar_viewed', {
      view_mode: viewMode,
      event_count: eventCount,
    }),

  filtered: (eventTypes: string[], dateRange: string) =>
    trackEvent('calendar_filtered', {
      event_types: eventTypes.join(','),
      event_type_count: eventTypes.length,
      date_range: dateRange,
    }),

  navigated: (direction: 'prev' | 'next' | 'today', newMonth: string) =>
    trackEvent('calendar_navigated', {
      direction,
      new_month: newMonth,
    }),

  eventClicked: (eventId: string, eventType: string) =>
    trackEvent('calendar_event_clicked', {
      event_id: eventId,
      event_type: eventType,
    }),
};

// ========= PROJECT EVENTS ========= //

export const projectEvents = {
  created: (
    projectId: string,
    hasDeadline: boolean,
    channelCount: number
  ) =>
    trackEvent('project_created', {
      project_id: projectId,
      has_deadline: hasDeadline,
      channel_count: channelCount,
    }),

  updated: (projectId: string, fieldsChanged: string[]) =>
    trackEvent('project_updated', {
      project_id: projectId,
      fields_changed: fieldsChanged.join(','),
    }),

  statusChanged: (projectId: string, oldStatus: string, newStatus: string) =>
    trackEvent('project_status_changed', {
      project_id: projectId,
      old_status: oldStatus,
      new_status: newStatus,
    }),

  clientLinked: (projectId: string, clientId: string) =>
    trackEvent('project_client_linked', {
      project_id: projectId,
      client_id: clientId,
    }),
};

// ========= ASSET EVENTS ========= //

export const assetEvents = {
  uploaded: (assetId: string, type: string, sizeBytes: number) =>
    trackEvent('asset_uploaded', {
      asset_id: assetId,
      asset_type: type,
      size_bytes: sizeBytes,
      size_mb: Math.round(sizeBytes / 1024 / 1024),
    }),

  deleted: (assetId: string, type: string) =>
    trackEvent('asset_deleted', {
      asset_id: assetId,
      asset_type: type,
    }),

  previewed: (assetId: string, type: string) =>
    trackEvent('asset_previewed', {
      asset_id: assetId,
      asset_type: type,
    }),
};

// ========= RENDER EVENTS ========= //

export const renderEvents = {
  requested: (
    renderId: string,
    format: string,
    priority: number
  ) =>
    trackEvent('render_requested', {
      render_id: renderId,
      format,
      priority,
    }),

  completed: (renderId: string, format: string, computeSeconds: number) =>
    trackEvent('render_completed', {
      render_id: renderId,
      format,
      compute_seconds: computeSeconds,
    }),

  failed: (renderId: string, format: string, errorMessage: string) =>
    trackEvent('render_failed', {
      render_id: renderId,
      format,
      error_type: errorMessage.substring(0, 50),
    }),

  downloaded: (renderId: string, format: string) =>
    trackEvent('render_downloaded', {
      render_id: renderId,
      format,
    }),
};

// ========= TASK EVENTS ========= //

export const taskEvents = {
  created: (taskId: string, priority: number, hasDueDate: boolean) =>
    trackEvent('task_created', {
      task_id: taskId,
      priority,
      has_due_date: hasDueDate,
    }),

  statusChanged: (taskId: string, oldStatus: string, newStatus: string) =>
    trackEvent('task_status_changed', {
      task_id: taskId,
      old_status: oldStatus,
      new_status: newStatus,
    }),

  assigned: (taskId: string, assigneeId: string) =>
    trackEvent('task_assigned', {
      task_id: taskId,
      assignee_id: assigneeId,
    }),

  completed: (taskId: string, daysToComplete: number) =>
    trackEvent('task_completed', {
      task_id: taskId,
      days_to_complete: daysToComplete,
    }),
};

// ========= REVIEW EVENTS ========= //

export const reviewEvents = {
  requested: (reviewId: string, assetId?: string) =>
    trackEvent('review_requested', {
      review_id: reviewId,
      has_asset: !!assetId,
      asset_id: assetId,
    }),

  approved: (reviewId: string, hasComments: boolean) =>
    trackEvent('review_approved', {
      review_id: reviewId,
      has_comments: hasComments,
    }),

  rejected: (reviewId: string, hasComments: boolean) =>
    trackEvent('review_rejected', {
      review_id: reviewId,
      has_comments: hasComments,
    }),

  changesRequested: (reviewId: string) =>
    trackEvent('review_changes_requested', {
      review_id: reviewId,
    }),
};

// ========= FEATURE USAGE ========= //

export const featureEvents = {
  requested: (featureName: string) =>
    trackEvent('feature_requested', {
      feature_name: featureName,
    }),

  disabled: (featureName: string) =>
    trackEvent('feature_disabled_viewed', {
      feature_name: featureName,
    }),
};

// ========= PAGE VIEWS ========= //

export const pageViewed = (pageName: string, additionalData?: EventProperties) =>
  trackEvent('page_viewed', {
    page_name: pageName,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    ...additionalData,
  });
