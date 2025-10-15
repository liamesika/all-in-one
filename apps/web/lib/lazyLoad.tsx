import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy load a component with a loading fallback
 * Useful for modals, charts, and other heavy components
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: () => JSX.Element;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]"></div>
      </div>
    )),
    ssr: options?.ssr ?? false,
  });
}

/**
 * Lazy load a modal component
 * Modals don't need SSR and have a specific loading state
 */
export function lazyLoadModal<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#1A2F4B] rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF] mx-auto"></div>
        </div>
      </div>
    ),
    ssr: false,
  });
}

/**
 * Lazy load a chart component
 * Charts are heavy and don't need SSR
 */
export function lazyLoadChart<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-[#0E1A2B] rounded-lg animate-pulse">
        <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
      </div>
    ),
    ssr: false,
  });
}
