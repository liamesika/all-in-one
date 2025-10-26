'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  dateRange: string;
  agent: string;
  dealType: string;
  status: string;
  source: string;
  search: string;
}

const DEFAULT_FILTERS: FilterState = {
  dateRange: '30d',
  agent: 'all',
  dealType: 'all',
  status: 'all',
  source: 'all',
  search: '',
};

export function useFilters(initialFilters?: Partial<FilterState>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters: FilterState = {
      dateRange: searchParams.get('dateRange') || initialFilters?.dateRange || DEFAULT_FILTERS.dateRange,
      agent: searchParams.get('agent') || initialFilters?.agent || DEFAULT_FILTERS.agent,
      dealType: searchParams.get('dealType') || initialFilters?.dealType || DEFAULT_FILTERS.dealType,
      status: searchParams.get('status') || initialFilters?.status || DEFAULT_FILTERS.status,
      source: searchParams.get('source') || initialFilters?.source || DEFAULT_FILTERS.source,
      search: searchParams.get('search') || initialFilters?.search || DEFAULT_FILTERS.search,
    };
    return urlFilters;
  });

  // Debounced URL update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.set(key, value);
        }
      });

      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.push(newUrl, { scroll: false });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
