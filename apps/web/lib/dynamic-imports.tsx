import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/performance/lazy-loading';

// Heavy components that should be code-split
export const PropertyImportModal = dynamic(
  () => import('@/components/PropertyImport').then(mod => ({ default: mod.PropertyImport })),
  {
    loading: () => <LoadingSpinner message="Loading import tool..." />,
    ssr: false // Don't server-side render this component
  }
);

// Temporary fallback: replaced recharts for Vercel build compatibility
export const ChartComponents = {
  LineChart: () => <div className="p-4 border rounded bg-gray-50 text-gray-600">Charts temporarily disabled for build compatibility</div>,
  BarChart: () => <div className="p-4 border rounded bg-gray-50 text-gray-600">Charts temporarily disabled for build compatibility</div>,
  PieChart: () => <div className="p-4 border rounded bg-gray-50 text-gray-600">Charts temporarily disabled for build compatibility</div>
};

export const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').catch(() => ({
    default: () => <div className="p-4 border rounded bg-gray-50 text-gray-600">Rich Text Editor not available</div>
  })),
  {
    loading: () => <LoadingSpinner message="Loading editor..." />,
    ssr: false
  }
);

export const FileUploader = dynamic(
  () => import('@/components/ui/file-uploader'),
  {
    loading: () => <LoadingSpinner message="Loading uploader..." />,
    ssr: false
  }
);

export const DataExporter = dynamic(
  () => import('@/components/ui/data-exporter'),
  {
    loading: () => <LoadingSpinner message="Loading exporter..." />,
    ssr: false
  }
);

// Modal components (heavy and conditionally loaded)
export const Modals = {
  PropertyModal: dynamic(() => import('@/components/modals/property-modal'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  }),
  LeadModal: dynamic(() => import('@/components/modals/lead-modal'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  }),
  CampaignModal: dynamic(() => import('@/components/modals/campaign-modal'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  })
};

// Dashboard widgets (heavy with data processing)
export const DashboardWidgets = {
  AnalyticsChart: dynamic(() => import('@/components/dashboard/analytics-chart'), {
    loading: () => (
      <div className="h-48 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    ),
    ssr: false
  }),
  
  LeadsTable: dynamic(() => import('@/components/dashboard/leads-table'), {
    loading: () => (
      <div className="h-64 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <LoadingSpinner message="Loading leads..." />
      </div>
    ),
    ssr: false
  }),
  
  PropertiesTable: dynamic(() => import('@/components/performance/optimized-properties-table').then(mod => ({ default: mod.OptimizedPropertiesTable })), {
    loading: () => (
      <div className="h-96 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <LoadingSpinner message="Loading properties..." />
      </div>
    ),
    ssr: false
  }),
  
  KPICards: dynamic(() => import('@/components/KpiCards'), {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: true // KPI cards can be SSR since they're above the fold
  })
};

// Form components (progressive enhancement)
export const Forms = {
  PropertyForm: dynamic(() => import('@/components/forms/property-form'), {
    loading: () => <LoadingSpinner message="Loading form..." />,
    ssr: false
  }),
  
  LeadForm: dynamic(() => import('@/components/leads/Form'), {
    loading: () => <LoadingSpinner message="Loading form..." />,
    ssr: false
  }),
  
  CampaignForm: dynamic(() => import('@/components/campaigns/campaign-form'), {
    loading: () => <LoadingSpinner message="Loading campaign form..." />,
    ssr: false
  })
};

// Utility function for preloading components
export function preloadComponent(componentPromise: () => Promise<any>) {
  return componentPromise().catch(err => {
    console.warn('Failed to preload component:', err);
  });
}

// Hook for preloading components on user interaction
export function usePreloadOnInteraction(components: Array<() => Promise<any>>) {
  const preloadAll = () => {
    components.forEach(comp => preloadComponent(comp));
  };

  return {
    onMouseEnter: preloadAll,
    onFocus: preloadAll
  };
}