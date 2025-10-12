'use client';

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
  dateRange,
  onDateRangeChange,
  location,
  onLocationChange,
  agent,
  onAgentChange,
  dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
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
  return (
    <div
      className="rounded-xl p-4 mb-6"
      style={{
        background: 'var(--re-midnight-blue)',
        boxShadow: 'var(--re-shadow-sm)',
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Filter */}
        {onDateRangeChange && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--re-steel-gray)' }}
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
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--re-deep-navy)',
                color: 'var(--re-white)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Filter */}
        {onLocationChange && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--re-steel-gray)' }}
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
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--re-deep-navy)',
                color: 'var(--re-white)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Agent Filter */}
        {onAgentChange && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--re-steel-gray)' }}
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
            <select
              value={agent}
              onChange={(e) => onAgentChange(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--re-deep-navy)',
                color: 'var(--re-white)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {agentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
