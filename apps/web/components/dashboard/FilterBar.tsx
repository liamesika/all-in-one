'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  agent?: string;
  onAgentChange?: (value: string) => void;
  dealType?: string;
  onDealTypeChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  source?: string;
  onSourceChange?: (value: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  dateRangeOptions?: FilterOption[];
  agentOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  sourceOptions?: FilterOption[];
}

export function FilterBar({
  dateRange = '30d',
  onDateRangeChange,
  agent = 'all',
  onAgentChange,
  dealType = 'all',
  onDealTypeChange,
  status = 'all',
  onStatusChange,
  source = 'all',
  onSourceChange,
  search = '',
  onSearchChange,
  dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'This Year' },
  ],
  agentOptions = [
    { value: 'all', label: 'All Agents' },
  ],
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'viewing', label: 'Viewing Scheduled' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'closed', label: 'Closed' },
    { value: 'lost', label: 'Lost' },
  ],
  sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'yad2', label: 'Yad2' },
    { value: 'madlan', label: 'Madlan' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'referral', label: 'Referral' },
    { value: 'direct', label: 'Direct' },
  ],
}: FilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const activeFilterCount = [
    dateRange !== '30d',
    agent !== 'all',
    dealType !== 'all',
    status !== 'all',
    source !== 'all',
    search !== '',
  ].filter(Boolean).length;

  // Announce filter changes to screen readers
  useEffect(() => {
    if (activeFilterCount > 0) {
      setAnnouncement(`${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`);
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeFilterCount]);

  return (
    <>
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {/* Desktop Filter Bar */}
      <div
        className="hidden lg:block rounded-xl p-6 mb-6 border"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Date Range */}
          <div>
            <label htmlFor="filter-dateRange" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                analytics.filterChanged('dateRange', e.target.value);
                onDateRangeChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Filter by date range"
              id="filter-dateRange"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Deal Type */}
          <div>
            <label htmlFor="filter-dealType" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Deal Type
            </label>
            <select
              value={dealType}
              onChange={(e) => {
                analytics.filterChanged('dealType', e.target.value);
                onDealTypeChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Filter by deal type"
              id="filter-dealType"
            >
              <option value="all">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="filter-status" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                analytics.filterChanged('status', e.target.value);
                onStatusChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Filter by status"
              id="filter-status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label htmlFor="filter-source" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Source
            </label>
            <select
              value={source}
              onChange={(e) => {
                analytics.filterChanged('source', e.target.value);
                onSourceChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Filter by source"
              id="filter-source"
            >
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Agent */}
          <div>
            <label htmlFor="filter-agent" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Agent
            </label>
            <select
              value={agent}
              onChange={(e) => {
                analytics.filterChanged('agent', e.target.value);
                onAgentChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Filter by agent"
              id="filter-agent"
            >
              {agentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="filter-search" className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Properties, leads..."
              value={search}
              onChange={(e) => {
                analytics.filterChanged('search', e.target.value);
                onSearchChange?.(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg placeholder-gray-400 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                color: '#111827',
              }}
              aria-label="Search properties and leads"
              id="filter-search"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            color: '#111827',
          }}
          aria-label="Open filters"
          aria-expanded={mobileFiltersOpen}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} style={{ color: '#6B7280' }} />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: '#3B82F6',
                  color: '#FFFFFF',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setMobileFiltersOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="mobile-filters-title" className="text-lg font-semibold" style={{ color: '#111827' }}>
                Filters
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X size={20} style={{ color: '#6B7280' }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => {
                    analytics.filterChanged('dateRange', e.target.value);
                    onDateRangeChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Deal Type
                </label>
                <select
                  value={dealType}
                  onChange={(e) => {
                    analytics.filterChanged('dealType', e.target.value);
                    onDealTypeChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    analytics.filterChanged('status', e.target.value);
                    onStatusChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => {
                    analytics.filterChanged('source', e.target.value);
                    onSourceChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agent */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Agent
                </label>
                <select
                  value={agent}
                  onChange={(e) => {
                    analytics.filterChanged('agent', e.target.value);
                    onAgentChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                >
                  {agentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Properties, leads..."
                  value={search}
                  onChange={(e) => {
                    analytics.filterChanged('search', e.target.value);
                    onSearchChange?.(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full px-4 py-3 rounded-lg font-medium"
                style={{
                  background: '#3B82F6',
                  color: '#FFFFFF',
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
