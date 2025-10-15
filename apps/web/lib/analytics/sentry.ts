// Sentry Breadcrumbs for Mobile Actions
export const addSentryBreadcrumb = (category: string, message: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category,
      message,
      level: 'info',
      data,
    });
  }
};

export const sentryBreadcrumbs = {
  drawerOpened: (drawerType: string) => addSentryBreadcrumb('ui', 'Drawer opened', { drawerType }),
  drawerClosed: (drawerType: string) => addSentryBreadcrumb('ui', 'Drawer closed', { drawerType }),
  modalOpened: (modalType: string) => addSentryBreadcrumb('ui', 'Modal opened', { modalType }),
  modalClosed: (modalType: string) => addSentryBreadcrumb('ui', 'Modal closed', { modalType }),
  bulkActionExecuted: (action: string, count: number) => addSentryBreadcrumb('action', 'Bulk action executed', { action, count }),
  filterApplied: (filterType: string, value: any) => addSentryBreadcrumb('filter', 'Filter applied', { filterType, value }),
};
