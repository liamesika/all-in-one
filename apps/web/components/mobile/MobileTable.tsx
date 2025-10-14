'use client';

// apps/web/components/mobile/MobileTable.tsx - EFFINITY Mobile-Optimized Table
// Horizontal scroll tables with sticky headers and card view toggle

import React from 'react';
import { ChevronRight, Grid, List } from 'lucide-react';

/**
 * MobileTable Props
 */
export interface MobileTableProps<T = any> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
  }[];
  onRowClick?: (item: T) => void;
  showToggle?: boolean;
  className?: string;
}

/**
 * MobileTable Component
 * Responsive table that switches between table and card view
 */
export function MobileTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  showToggle = true,
  className = '',
}: MobileTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<'table' | 'card'>('card');

  if (viewMode === 'card') {
    return (
      <div className={className}>
        {showToggle && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setViewMode('table')}
              className="px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <List className="w-4 h-4 inline me-2" />
              Table View
            </button>
          </div>
        )}

        <div className="space-y-3">
          {data.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onRowClick?.(item)}
              className={`
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg p-4
                ${onRowClick ? 'cursor-pointer active:scale-[0.98]' : ''}
                transition-transform
              `}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {col.label}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white text-end">
                    {col.render ? col.render(item) : item[col.key]}
                  </span>
                </div>
              ))}
              {onRowClick && (
                <div className="flex justify-end mt-2">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showToggle && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setViewMode('card')}
            className="px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Grid className="w-4 h-4 inline me-2" />
            Card View
          </button>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-white"
                  style={{ minWidth: col.width || '120px' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MobileTable;
