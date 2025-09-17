// Virtual scrolling component for performance optimization
'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { FixedSizeList, VariableSizeList, ListChildComponentProps } from 'react-window';

// @ts-ignore - Type issue with react-window
const List = FixedSizeList as any;
import InfiniteLoader from 'react-window-infinite-loader';

// @ts-ignore - Type issue with react-window-infinite-loader
const InfiniteLoaderComponent = InfiniteLoader as any;

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
  const listRef = useRef<any>(null);
  
  // Calculate total width
  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  // Infinite loading setup
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  const isItemLoaded = useCallback((index: number) => !!items[index], [items]);

  // Row renderer
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = items[index];
    
    // Loading row
    if (!item) {
      return (
        <div style={style} className="flex items-center justify-center border-b">
          <div className="animate-pulse flex space-x-4 w-full p-4">
            {columns.map((col, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-shimmer"
                style={{ width: col.width }}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        style={style}
        className={`flex border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer hover-lift ${rowClassName}`}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((col, colIndex) => (
          <div
            key={`${item.id}-${String(col.key)}`}
            className="flex items-center px-4 py-2 text-sm truncate"
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.render 
              ? col.render(item, index)
              : String((item as any)[col.key] || '-')
            }
          </div>
        ))}
      </div>
    );
  }, [items, columns, rowClassName, onRowClick]);

  // Header component
  const Header = useMemo(() => (
    <div 
      className="flex bg-gray-50 border-b border-gray-200 sticky top-0 z-10"
      style={{ width: totalWidth }}
    >
      {columns.map((col) => (
        <div
          key={String(col.key)}
          className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700"
          style={{ width: col.width, minWidth: col.width }}
        >
          {col.header}
        </div>
      ))}
    </div>
  ), [columns, totalWidth]);

  if (onLoadMore) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
        {Header}
        <InfiniteLoaderComponent
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={onLoadMore}
        >
          {({ onItemsRendered, ref }: any) => (
            <List
              ref={(list: any) => {
                listRef.current = list;
                if (typeof ref === 'function') ref(list);
                else if (ref) (ref as any).current = list;
              }}
              height={height}
              itemCount={itemCount}
              itemSize={itemHeight}
              onItemsRendered={onItemsRendered}
              width={totalWidth}
              style={{ minWidth: width }}
            >
              {Row}
            </List>
          )}
        </InfiniteLoaderComponent>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {Header}
      <List
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width={totalWidth}
        style={{ minWidth: width }}
      >
        {Row}
      </List>
    </div>
  );
}

// Virtual grid component for card-based layouts
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  gap?: number;
  height?: number;
  className?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => Promise<void>;
  hasNextPage?: boolean;
}

export function VirtualGrid<T extends { id: string | number }>({
  items,
  itemHeight,
  itemWidth,
  gap = 16,
  height = 400,
  className = '',
  renderItem,
  onLoadMore,
  hasNextPage = false,
}: VirtualGridProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate columns based on container width
  const columnsCount = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.floor((containerWidth + gap) / (itemWidth + gap)) || 1;
  }, [containerWidth, itemWidth, gap]);

  // Calculate rows count
  const rowsCount = Math.ceil(items.length / columnsCount);
  const itemCount = hasNextPage ? rowsCount + 1 : rowsCount;

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Row renderer
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const startIndex = index * columnsCount;
    const endIndex = Math.min(startIndex + columnsCount, items.length);
    const rowItems = items.slice(startIndex, endIndex);

    // Loading row
    if (rowItems.length === 0 && hasNextPage) {
      return (
        <div style={style} className="flex justify-center items-center">
          <div className="animate-pulse">Loading more...</div>
        </div>
      );
    }

    return (
      <div style={style} className="flex" role="row">
        {rowItems.map((item, colIndex) => (
          <div
            key={item.id}
            className="flex-shrink-0"
            style={{
              width: itemWidth,
              marginRight: colIndex < rowItems.length - 1 ? gap : 0,
            }}
            role="gridcell"
          >
            {renderItem(item, startIndex + colIndex)}
          </div>
        ))}
      </div>
    );
  }, [items, columnsCount, itemWidth, gap, renderItem, hasNextPage]);

  const isItemLoaded = useCallback((index: number) => {
    const startIndex = index * columnsCount;
    return startIndex < items.length;
  }, [items.length, columnsCount]);

  if (onLoadMore) {
    return (
      <div ref={containerRef} className={className}>
        <InfiniteLoaderComponent
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={onLoadMore}
        >
          {({ onItemsRendered, ref }: any) => (
            <List
              ref={ref}
              height={height}
              itemCount={itemCount}
              itemSize={itemHeight + gap}
              onItemsRendered={onItemsRendered}
              width="100%"
            >
              {Row}
            </List>
          )}
        </InfiniteLoaderComponent>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <List
        height={height}
        itemCount={rowsCount}
        itemSize={itemHeight + gap}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

// Optimized list component with automatic virtualization threshold
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  virtualizationThreshold?: number;
  className?: string;
  emptyMessage?: string;
  onLoadMore?: () => Promise<void>;
  hasNextPage?: boolean;
}

export function OptimizedList<T extends { id: string | number }>({
  items,
  renderItem,
  itemHeight = 60,
  virtualizationThreshold = 50,
  className = '',
  emptyMessage = 'No items found',
  onLoadMore,
  hasNextPage = false,
}: OptimizedListProps<T>) {
  // Use virtualization for large lists
  const shouldVirtualize = items.length > virtualizationThreshold;

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  if (shouldVirtualize) {
    return (
      <div className={className}>
        {onLoadMore ? (
          <InfiniteLoaderComponent
            isItemLoaded={(index: number) => !!items[index]}
            itemCount={hasNextPage ? items.length + 1 : items.length}
            loadMoreItems={onLoadMore}
          >
            {({ onItemsRendered, ref }: any) => (
              <List
                ref={ref}
                height={Math.min(itemHeight * 10, itemHeight * items.length)}
                itemCount={hasNextPage ? items.length + 1 : items.length}
                itemSize={itemHeight}
                onItemsRendered={onItemsRendered}
              >
                {({ index, style }: any) => {
                  const item = items[index];
                  return (
                    <div style={style}>
                      {item ? renderItem(item, index) : <div>Loading...</div>}
                    </div>
                  );
                }}
              </List>
            )}
          </InfiniteLoaderComponent>
        ) : (
          <List
            height={Math.min(itemHeight * 10, itemHeight * items.length)}
            itemCount={items.length}
            itemSize={itemHeight}
          >
            {({ index, style }: any) => (
              <div style={style}>
                {renderItem(items[index], index)}
              </div>
            )}
          </List>
        )}
      </div>
    );
  }

  // Regular rendering for small lists
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={item.id}>
          {renderItem(item, index)}
        </div>
      ))}
      {hasNextPage && onLoadMore && (
        <div className="p-4 text-center">
          <button
            onClick={onLoadMore}
            className="btn-primary"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}