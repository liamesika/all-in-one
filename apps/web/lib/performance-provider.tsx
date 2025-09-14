'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { 
  initPerformanceMonitoring, 
  trackPageLoad, 
  performanceMeasurer,
  PerformanceMeasurer 
} from './performance';

interface PerformanceContextValue {
  trackPageLoad: typeof trackPageLoad;
  performanceMeasurer: PerformanceMeasurer;
  trackError: (error: Error, context?: string) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: React.ReactNode;
  pageName?: string;
  enableMonitoring?: boolean;
}

export function PerformanceProvider({ 
  children, 
  pageName,
  enableMonitoring = true 
}: PerformanceProviderProps) {
  useEffect(() => {
    if (!enableMonitoring) return;

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Track page load
    if (pageName) {
      trackPageLoad(pageName);
    }

    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      const { trackError } = require('./performance');
      trackError(event.error || new Error(event.message), 'global-error-handler');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const { trackError } = require('./performance');
      trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'unhandled-promise-rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableMonitoring, pageName]);

  const contextValue: PerformanceContextValue = {
    trackPageLoad,
    performanceMeasurer,
    trackError: (error: Error, context?: string) => {
      const { trackError } = require('./performance');
      trackError(error, context);
    },
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

// HOC for automatic page tracking
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  pageName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    return (
      <PerformanceProvider pageName={pageName}>
        <Component {...props} />
      </PerformanceProvider>
    );
  };
}