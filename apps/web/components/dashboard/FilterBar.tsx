'use client';

import { useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  location?: string;
  onLocationChange?: (value: string) => void;
  agent?: string;
  onAgentChange?: (value: string) => void;
  dateRangeOptions?: FilterOption[];
  locationOptions?: FilterOption[];
  agentOptions?: FilterOption[];
}

export function FilterBar({
  dateRange = '30d',
  onDateRangeChange,
  location = 'all',
  onLocationChange,
  agent = 'all',
  onAgentChange,
  dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ],
  locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'tel-aviv', label: 'Tel Aviv' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'haifa', label: 'Haifa' },
  ],
  agentOptions = [
    { value: 'all', label: 'All Agents' },
    { value: 'agent1', label: 'Sarah Cohen' },
    { value: 'agent2', label: 'David Levi' },
    { value: 'agent3', label: 'Rachel Gold' },
  ],
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketType, setMarketType] = useState('all');

  return (
    <div
      className="rounded-xl p-6 mb-6 border"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Picker - Clean, no icons */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
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

        {/* Market Type - Clean, no icons */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Market Type
          </label>
          <select
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              color: '#111827',
            }}
          >
            <option value="all">All Markets</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {/* Agent Filter - Clean, no icons */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Agent
          </label>
          <select
            value={agent}
            onChange={(e) => onAgentChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
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

        {/* Location Filter - Clean, no icons */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Location
          </label>
          <select
            value={location}
            onChange={(e) => onLocationChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              color: '#111827',
            }}
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search - Clean, no icons */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Properties, leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg placeholder-gray-400 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            style={{
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              color: '#111827',
            }}
          />
        </div>
      </div>
    </div>
  );
}
