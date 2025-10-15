'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

/**
 * UniversalTable Component
 *
 * Standardized table component with sorting, pagination, and consistent styling
 * Used across all verticals for data display
 *
 * @example
 * <UniversalTable>
 *   <UniversalTableHeader>
 *     <UniversalTableRow>
 *       <UniversalTableHead>Name</UniversalTableHead>
 *       <UniversalTableHead>Status</UniversalTableHead>
 *     </UniversalTableRow>
 *   </UniversalTableHeader>
 *   <UniversalTableBody>
 *     <UniversalTableRow>
 *       <UniversalTableCell>John Doe</UniversalTableCell>
 *       <UniversalTableCell>Active</UniversalTableCell>
 *     </UniversalTableRow>
 *   </UniversalTableBody>
 * </UniversalTable>
 */

interface UniversalTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /**
   * Whether table should have hover effect on rows
   */
  hoverable?: boolean;

  /**
   * Whether table should have striped rows
   */
  striped?: boolean;

  /**
   * Whether table should have borders
   */
  bordered?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Table content
   */
  children: React.ReactNode;
}

export function UniversalTable({
  hoverable = true,
  striped = false,
  bordered = false,
  className,
  children,
  ...props
}: UniversalTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-[#2979FF]/20">
      <table
        className={cn(
          'w-full text-sm text-left',
          'text-gray-700 dark:text-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * Table Header
 */
interface UniversalTableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function UniversalTableHeader({
  className,
  children,
  ...props
}: UniversalTableHeaderProps) {
  return (
    <thead
      className={cn(
        'bg-gray-50 dark:bg-[#0E1A2B]',
        'border-b border-gray-200 dark:border-[#2979FF]/20',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

/**
 * Table Body
 */
interface UniversalTableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function UniversalTableBody({
  className,
  children,
  ...props
}: UniversalTableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-200 dark:divide-[#2979FF]/20', className)} {...props}>
      {children}
    </tbody>
  );
}

/**
 * Table Row
 */
interface UniversalTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Whether row is selected
   */
  selected?: boolean;

  /**
   * Whether row should have hover effect
   */
  hoverable?: boolean;

  children: React.ReactNode;
}

export function UniversalTableRow({
  selected = false,
  hoverable = true,
  className,
  children,
  ...props
}: UniversalTableRowProps) {
  return (
    <tr
      className={cn(
        'bg-white dark:bg-[#1A2F4B]',
        hoverable && 'hover:bg-gray-50 dark:hover:bg-[#243A5E] transition-colors',
        selected && 'bg-blue-50 dark:bg-[#2979FF]/10',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * Table Head Cell
 */
interface UniversalTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Whether column is sortable
   */
  sortable?: boolean;

  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc' | null;

  /**
   * Sort handler
   */
  onSort?: () => void;

  children: React.ReactNode;
}

export function UniversalTableHead({
  sortable = false,
  sortDirection = null,
  onSort,
  className,
  children,
  ...props
}: UniversalTableHeadProps) {
  const content = (
    <>
      <span>{children}</span>
      {sortable && (
        <span className="ml-2 inline-block">
          {sortDirection === 'asc' && <ChevronUp className="w-4 h-4" />}
          {sortDirection === 'desc' && <ChevronDown className="w-4 h-4" />}
          {sortDirection === null && <ChevronsUpDown className="w-4 h-4 opacity-50" />}
        </span>
      )}
    </>
  );

  return (
    <th
      className={cn(
        'px-6 py-3',
        'font-semibold text-gray-900 dark:text-white',
        'text-left',
        sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-[#1A2F4B]',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center">
          {content}
        </div>
      ) : (
        content
      )}
    </th>
  );
}

/**
 * Table Cell
 */
interface UniversalTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function UniversalTableCell({
  className,
  children,
  ...props
}: UniversalTableCellProps) {
  return (
    <td
      className={cn(
        'px-6 py-4',
        'text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * Table Footer
 */
interface UniversalTableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function UniversalTableFooter({
  className,
  children,
  ...props
}: UniversalTableFooterProps) {
  return (
    <tfoot
      className={cn(
        'bg-gray-50 dark:bg-[#0E1A2B]',
        'border-t border-gray-200 dark:border-[#2979FF]/20',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
}

/**
 * Empty State for Tables
 */
interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmptyState({
  icon,
  title = 'No data available',
  description,
  action,
}: TableEmptyStateProps) {
  return (
    <UniversalTableRow hoverable={false}>
      <UniversalTableCell colSpan={100}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {icon && (
            <div className="mb-4 text-gray-400 dark:text-gray-600">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
              {description}
            </p>
          )}
          {action && <div>{action}</div>}
        </div>
      </UniversalTableCell>
    </UniversalTableRow>
  );
}

/**
 * Table Pagination
 */
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-[#0E1A2B] border-t border-gray-200 dark:border-[#2979FF]/20">
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <span>
          Showing <span className="font-semibold">{startItem}</span> to{' '}
          <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> results
        </span>
        {onPageSizeChange && (
          <>
            <span className="mx-2">|</span>
            <label htmlFor="pageSize" className="mr-2">
              Per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded hover:bg-gray-50 dark:hover:bg-[#243A5E] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded',
                  page === currentPage
                    ? 'bg-[#2979FF] text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 hover:bg-gray-50 dark:hover:bg-[#243A5E]'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded hover:bg-gray-50 dark:hover:bg-[#243A5E] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
