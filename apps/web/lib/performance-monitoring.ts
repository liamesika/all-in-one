'use client';

import React from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls?: number;
  fid?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWebVitals();
      this.initCustomMetrics();
    }
  }

  private initWebVitals() {
    const handleMetric = (metric: Metric) => {
      this.metrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric.value;
      this.notifyListeners();
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        this.sendToAnalytics(metric);
      }
    };

    // Collect all Web Vitals
    onCLS(handleMetric);
    onFID(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }

  private initCustomMetrics() {
    // Monitor navigation timing
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const loadTime = navTiming.loadEventEnd - navTiming.startTime;
        const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.startTime;
        const timeToInteractive = navTiming.loadEventEnd - navTiming.startTime;

        this.logMetric('Page Load Time', loadTime);
        this.logMetric('DOM Content Loaded', domContentLoaded);
        this.logMetric('Time to Interactive', timeToInteractive);
      }
    }

    // Monitor resource timing
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources detected:', slowResources);
      }
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.logMetric('JS Heap Size', memory.usedJSHeapSize);
      this.logMetric('JS Heap Limit', memory.jsHeapSizeLimit);
    }
  }

  private sendToAnalytics(metric: Metric) {
    // Send to your analytics service
    const body = {
      metric: metric.name,
      value: metric.value,
      rating: this.getMetricRating(metric),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    // Example: send to Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vitals', {
        custom_parameter_1: metric.name,
        custom_parameter_2: metric.value,
        custom_parameter_3: this.getMetricRating(metric)
      });
    }

    // Example: send to your own API
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(err => console.warn('Failed to send performance metric:', err));
  }

  private getMetricRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    // Web Vitals thresholds
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (metric.value <= threshold.good) return 'good';
    if (metric.value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private logMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}: ${value}ms`);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    this.logMetric(name, end - start);
    return result;
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    this.logMetric(name, end - start);
    return result;
  }

  public markStart(name: string) {
    performance.mark(`${name}-start`);
  }

  public markEnd(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      this.logMetric(name, measure.duration);
    }
  }

  // Monitor API performance
  public trackApiCall(url: string, method: string, duration: number, status: number) {
    const isSlowApi = duration > 1000; // 1 second threshold
    
    if (isSlowApi) {
      console.warn(`Slow API call: ${method} ${url} - ${duration}ms`);
    }

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api_call',
          url,
          method,
          duration,
          status,
          timestamp: Date.now()
        }),
        keepalive: true
      }).catch(err => console.warn('Failed to track API call:', err));
    }
  }

  // Bundle size monitoring
  public trackBundleSize() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        };
        
        this.logMetric('Network RTT', connection.rtt);
        this.logMetric('Network Downlink', connection.downlink);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Network Info:', networkInfo);
        }
      }
    }
  }

  // Long task monitoring
  public monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const longTasks = list.getEntries();
        longTasks.forEach(task => {
          if (task.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${task.duration}ms at ${task.startTime}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for accessing performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

// High-order component for measuring component render time
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    React.useEffect(() => {
      performanceMonitor.markStart(`${componentName}-render`);
      return () => {
        performanceMonitor.markEnd(`${componentName}-render`);
      };
    });

    return React.createElement(WrappedComponent, props);
  });
}

// API fetch wrapper with performance tracking
export async function trackFetch(url: string, options?: RequestInit) {
  const startTime = performance.now();
  const method = options?.method || 'GET';
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMonitor.trackApiCall(url, method, duration, response.status);
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMonitor.trackApiCall(url, method, duration, 0);
    
    throw error;
  }
}

// Bundle analyzer utilities for development
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    try {
      // @ts-ignore
      import('webpack-bundle-analyzer')
        .then(({ BundleAnalyzerPlugin }: any) => {
          console.log('Bundle analyzer loaded. Run npm run analyze to see bundle composition.');
        })
        .catch(() => {
          console.log('Bundle analyzer not available in this environment.');
        });
    } catch {
      console.log('Bundle analyzer not available in this environment.');
    }
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Start monitoring long tasks
    performanceMonitor.monitorLongTasks();
    
    // Track bundle size info
    performanceMonitor.trackBundleSize();
    
    // Set up error tracking for performance issues
    window.addEventListener('error', (event) => {
      if (event.error && event.error.stack) {
        console.error('JavaScript error affecting performance:', event.error);
      }
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection affecting performance:', event.reason);
    });
  }
}