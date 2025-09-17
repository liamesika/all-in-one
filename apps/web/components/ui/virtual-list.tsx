// Virtual scrolling component for performance optimization
'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';

// Temporary fallback to avoid react-window SSR issues
// TODO: Re-enable after fixing SSR
// import { FixedSizeList, VariableSizeList, ListChildComponentProps } from 'react-window';
// import InfiniteLoader from 'react-window-infinite-loader';

// Virtual table component for large datasets
interface VirtualTableProps<T> {
  items: T[];
  itemHeight?: number;
  height?: number;
  width?: string | number;
  columns: Array<{
    key: keyof T | string;
    header: string;
    width: number;
    render?: (item: T, index: number) => React.ReactNode;
  }>;
  onLoadMore?: () => Promise<void>;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  className?: string;
  rowClassName?: string;
  onRowClick?: (item: T, index: number) => void;
}

// Simple fallback table component (non-virtualized)
export function VirtualTable<T extends { id: string | number }>({
  items,
  itemHeight = 60,
  height = 400,
  width = '100%',
  columns,
  onLoadMore,
  hasNextPage = false,
  isLoadingMore = false,
  className = '',
  rowClassName = '',
  onRowClick,
}: VirtualTableProps<T>) {

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && hasNextPage && !isLoadingMore) {
      await onLoadMore();
    }
  }, [onLoadMore, hasNextPage, isLoadingMore]);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`} style={{ width, maxHeight: height }}>
      {/* Header */}
      <div className="bg-gray-50 border-b flex">
        {columns.map((column, index) => (
          <div
            key={index}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ maxHeight: height - 50 }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex border-b hover:bg-gray-50 cursor-pointer ${rowClassName}`}
            style={{ minHeight: itemHeight }}
            onClick={() => onRowClick?.(item, index)}
          >
            {columns.map((column, colIndex) => (
              <div
                key={colIndex}
                className="px-4 py-3 text-sm text-gray-900 flex items-center"
                style={{ width: column.width, minWidth: column.width }}
              >
                {column.render
                  ? column.render(item, index)
                  : String(item[column.key as keyof T] || '')
                }
              </div>
            ))}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}

        {/* Load more button */}
        {hasNextPage && !isLoadingMore && (
          <div className="flex items-center justify-center p-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple virtualized list component fallback
interface VirtualListProps<T> {
  items: T[];
  itemHeight?: number;
  height?: number;
  width?: string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => Promise<void>;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  className?: string;
}

export function VirtualList<T extends { id: string | number }>({
  items,
  itemHeight = 60,
  height = 400,
  width = '100%',
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoadingMore = false,
  className = '',
}: VirtualListProps<T>) {

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && hasNextPage && !isLoadingMore) {
      await onLoadMore();
    }
  }, [onLoadMore, hasNextPage, isLoadingMore]);

  return (
    <div className={`overflow-y-auto ${className}`} style={{ height, width }}>
      {items.map((item, index) => (
        <div key={item.id} style={{ minHeight: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Loading more...</span>
        </div>
      )}

      {/* Load more button */}
      {hasNextPage && !isLoadingMore && (
        <div className="flex items-center justify-center p-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default VirtualTable;