// Performance monitoring utilities
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds (good/needs-improvement/poor)
  LCP_THRESHOLDS: [2500, 4000], // Largest Contentful Paint
  FID_THRESHOLDS: [100, 300],   // First Input Delay
  CLS_THRESHOLDS: [0.1, 0.25],  // Cumulative Layout Shift
  FCP_THRESHOLDS: [1800, 3000], // First Contentful Paint
  TTFB_THRESHOLDS: [800, 1800], // Time to First Byte
};

// Performance API endpoint
const ANALYTICS_ENDPOINT = '/webapi/performance/metrics';

// Send metric to analytics
function sendToAnalytics(metric: Metric, additionalData: Record<string, any> = {}) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      saveData: (navigator as any).connection.saveData,
    } : null,
    ...additionalData,
  });

  // Use sendBeacon for reliability, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }
}

// Performance rating based on thresholds
export function getRating(value: number, thresholds: number[]): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
}

// Initialize Core Web Vitals monitoring
export function initPerformanceMonitoring() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Custom performance marks
  if (performance.mark) {
    performance.mark('app-init');
  }

  // Resource timing monitoring
  monitorResourceTiming();
  
  // Memory usage monitoring (if available)
  monitorMemoryUsage();

  // Network information
  monitorNetworkInfo();
}

// Monitor resource timing
function monitorResourceTiming() {
  if (!performance.getEntriesByType) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Only track significant resources
        if (resourceEntry.duration > 100 || resourceEntry.transferSize > 50000) {
          sendToAnalytics({
            name: 'resource-timing',
            value: resourceEntry.duration,
            rating: getRating(resourceEntry.duration, [500, 1000]),
            delta: 0,
            id: resourceEntry.name,
          } as Metric, {
            resourceType: getResourceType(resourceEntry.name),
            transferSize: resourceEntry.transferSize,
            decodedBodySize: resourceEntry.decodedBodySize,
            encodedBodySize: resourceEntry.encodedBodySize,
          });
        }
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    console.warn('Resource timing observer not supported');
  }
}

// Get resource type from URL
function getResourceType(url: string): string {
  if (url.includes('.js')) return 'script';
  if (url.includes('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
  if (url.includes('_next/static')) return 'next-asset';
  if (url.includes('/api/') || url.includes('/webapi/')) return 'api';
  return 'other';
}

// Monitor memory usage
function monitorMemoryUsage() {
  if (!(performance as any).memory) return;

  const memory = (performance as any).memory;
  
  // Send memory info every 30 seconds
  setInterval(() => {
    sendToAnalytics({
      name: 'memory-usage',
      value: memory.usedJSHeapSize,
      rating: getRating(memory.usedJSHeapSize / 1024 / 1024, [50, 100]), // MB
      delta: 0,
      id: 'heap-size',
    } as Metric, {
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    });
  }, 30000);
}

// Monitor network information
function monitorNetworkInfo() {
  const connection = (navigator as any).connection;
  if (!connection) return;

  const networkInfo = {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };

  sendToAnalytics({
    name: 'network-info',
    value: connection.downlink || 0,
    rating: 'good',
    delta: 0,
    id: 'connection',
  } as Metric, networkInfo);

  // Listen for network changes
  connection.addEventListener('change', () => {
    sendToAnalytics({
      name: 'network-change',
      value: connection.downlink || 0,
      rating: 'good',
      delta: 0,
      id: 'connection-change',
    } as Metric, {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    });
  });
}

// Performance measurement utility
export class PerformanceMeasurer {
  private startTimes: Map<string, number> = new Map();

  start(label: string) {
    this.startTimes.set(label, performance.now());
    if (performance.mark) {
      performance.mark(`${label}-start`);
    }
  }

  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);

    if (performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }

    // Send to analytics if significant
    if (duration > 10) {
      sendToAnalytics({
        name: 'custom-timing',
        value: duration,
        rating: getRating(duration, [100, 500]),
        delta: 0,
        id: label,
      } as Metric);
    }

    return duration;
  }
}

// Global performance measurer instance
export const performanceMeasurer = new PerformanceMeasurer();

// API response time monitoring
export function trackAPICall(url: string, method: string = 'GET') {
  const startTime = performance.now();
  
  return {
    finish: (success: boolean, statusCode?: number) => {
      const duration = performance.now() - startTime;
      
      sendToAnalytics({
        name: 'api-timing',
        value: duration,
        rating: getRating(duration, [500, 1500]),
        delta: 0,
        id: url,
      } as Metric, {
        method,
        success,
        statusCode,
        endpoint: url.replace(/\/\d+/g, '/:id'), // Normalize IDs
      });
    }
  };
}

// Page load performance
export function trackPageLoad(pageName: string, additionalData: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    measurePageLoad(pageName, additionalData);
  } else {
    window.addEventListener('load', () => measurePageLoad(pageName, additionalData));
  }
}

function measurePageLoad(pageName: string, additionalData: Record<string, any>) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return;

  const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
  const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
  const firstByte = navigation.responseStart - navigation.fetchStart;

  sendToAnalytics({
    name: 'page-load',
    value: pageLoadTime,
    rating: getRating(pageLoadTime, [2000, 4000]),
    delta: 0,
    id: pageName,
  } as Metric, {
    domContentLoaded,
    firstByte,
    ...additionalData,
  });
}

// Error tracking
export function trackError(error: Error, context: string = '') {
  sendToAnalytics({
    name: 'error',
    value: 1,
    rating: 'poor',
    delta: 0,
    id: error.name,
  } as Metric, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
  });
}

// Bundle size tracking (use with webpack-bundle-analyzer)
export function reportBundleSize(bundleName: string, size: number) {
  sendToAnalytics({
    name: 'bundle-size',
    value: size,
    rating: getRating(size / 1024, [250, 500]), // KB
    delta: 0,
    id: bundleName,
  } as Metric);
}