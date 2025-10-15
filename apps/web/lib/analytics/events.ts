// GA4 Event Tracking for Mobile UX
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

// Mobile-specific events
export const mobileEvents = {
  filterOpen: (source: string) => trackEvent('filter_open', { source }),
  filterApply: (source: string, filterCount: number) => trackEvent('filter_apply', { source, filter_count: filterCount }),
  cardActionTap: (action: string, entityType: string, entityId: string) => trackEvent('card_action_tap', { action, entity_type: entityType, entity_id: entityId }),
  bulkActionConfirm: (action: string, count: number, source: string) => trackEvent('bulk_action_confirm', { action, count, source }),
  modalSubmit: (modalType: string, action: string) => trackEvent('modal_submit', { modal_type: modalType, action }),
  drawerOpen: (drawerType: string) => trackEvent('drawer_open', { drawer_type: drawerType }),
  drawerClose: (drawerType: string) => trackEvent('drawer_close', { drawer_type: drawerType }),
};
