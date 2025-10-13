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
      className="rounded-xl p-6 mb-6 shadow-xl border border-gray-800"
      style={{
        background: '#1A2F4B',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Picker with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
            <svg
              className="w-5 h-5"
              style={{ color: '#2979FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#0E1A2B',
              border: '1px solid #374151',
            }}
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Market Type with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
            <svg
              className="w-5 h-5"
              style={{ color: '#2979FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <select
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#0E1A2B',
              border: '1px solid #374151',
            }}
          >
            <option value="all">All Markets</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {/* Agent Filter with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
            <svg
              className="w-5 h-5"
              style={{ color: '#2979FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <select
            value={agent}
            onChange={(e) => onAgentChange?.(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#0E1A2B',
              border: '1px solid #374151',
            }}
          >
            {agentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
            <svg
              className="w-5 h-5"
              style={{ color: '#2979FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <select
            value={location}
            onChange={(e) => onLocationChange?.(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
            style={{
              background: '#0E1A2B',
              border: '1px solid #374151',
            }}
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
            <svg
              className="w-5 h-5"
              style={{ color: '#2979FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search properties, leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg text-white placeholder-gray-400 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            style={{
              background: '#0E1A2B',
              border: '1px solid #374151',
            }}
          />
        </div>
      </div>
    </div>
  );
}
