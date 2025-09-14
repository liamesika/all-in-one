'use client';

import React, { memo } from 'react';
import { useLanguage } from '@/lib/language-context';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = ''
}: PaginationProps) {
  const { language } = useLanguage();

  if (totalPages <= 1) return null;

  const isRTL = language === 'he';
  
  // Calculate visible page numbers
  const getVisiblePages = (): number[] => {
    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // Adjust if we're near the beginning or end
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const buttonClass = (active: boolean = false, disabled: boolean = false) => [
    'px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1',
    disabled
      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
      : active
      ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    loading && !disabled ? 'opacity-50 cursor-wait' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav
      className={`flex items-center justify-center space-x-1 ${isRTL ? 'rtl space-x-reverse' : ''} ${className}`}
      aria-label={language === 'he' ? 'ניווט עמודים' : 'Pagination Navigation'}
    >
      {/* First Page */}
      {showFirstLast && currentPage > 2 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={loading}
            className={buttonClass(false, !canGoPrevious)}
            aria-label={language === 'he' ? 'עמוד ראשון' : 'First page'}
          >
            {isRTL ? '⟪' : '⟪'}
          </button>
        </>
      )}

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious || loading}
        className={buttonClass(false, !canGoPrevious)}
        aria-label={language === 'he' ? 'עמוד קודם' : 'Previous page'}
      >
        {isRTL ? '⟨' : '⟨'}
      </button>

      {/* Page Numbers */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={loading}
            className={buttonClass(false, false)}
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-2 text-gray-400">…</span>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={loading}
          className={buttonClass(page === currentPage, false)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-2 text-gray-400">…</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={loading}
            className={buttonClass(false, false)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || loading}
        className={buttonClass(false, !canGoNext)}
        aria-label={language === 'he' ? 'עמוד הבא' : 'Next page'}
      >
        {isRTL ? '⟩' : '⟩'}
      </button>

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages - 1 && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={loading}
          className={buttonClass(false, !canGoNext)}
          aria-label={language === 'he' ? 'עמוד אחרון' : 'Last page'}
        >
          {isRTL ? '⟫' : '⟫'}
        </button>
      )}
    </nav>
  );
});

export { Pagination };