'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UniversalButton } from './UniversalButton';
import { useFocusTrap } from '../../hooks/useKeyboardNavigation';

/**
 * BottomSheet Component
 *
 * Mobile-optimized bottom sheet for actions and menus.
 * Slides up from bottom with backdrop, designed for touch interactions.
 *
 * Features:
 * - Slides from bottom with smooth animation
 * - Backdrop overlay
 * - Focus trap for accessibility
 * - Escape key to close
 * - Body scroll lock when open
 * - Safe area padding for notched devices
 */

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  maxHeight?: '50vh' | '75vh' | '90vh';
  showHandle?: boolean;
}

const maxHeightClasses = {
  '50vh': 'max-h-[50vh]',
  '75vh': 'max-h-[75vh]',
  '90vh': 'max-h-[90vh]',
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxHeight = '75vh',
  showHandle = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Trap focus within sheet when open
  useFocusTrap(sheetRef, isOpen);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        data-open={isOpen}
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A2F4B] rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${maxHeightClasses[maxHeight]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        {/* Handle (drag indicator) */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="sheet-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <UniversalButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
            className="!w-11 !h-11 !min-w-[44px] !min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </UniversalButton>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto overscroll-contain px-6 py-4 pb-safe">
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * BulkActionsMenu Component
 *
 * Kebab menu for bulk actions that opens a bottom sheet on mobile.
 * Displays inline on desktop.
 */

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface BulkActionsMenuProps {
  actions: BulkAction[];
  selectedCount: number;
  title?: string;
  className?: string;
}

export function BulkActionsMenu({
  actions,
  selectedCount,
  title,
  className = '',
}: BulkActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="sm:hidden">
        <UniversalButton
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="!min-h-[44px]"
        >
          Actions ({selectedCount})
        </UniversalButton>

        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={title || `${selectedCount} selected`}
        >
          <div className="space-y-2">
            {actions.map((action) => (
              <UniversalButton
                key={action.id}
                variant={action.variant === 'danger' ? 'danger' : 'outline'}
                size="md"
                fullWidth
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.disabled}
                loading={action.loading}
                leftIcon={action.icon}
                className="!min-h-[48px] !justify-start"
              >
                {action.label}
              </UniversalButton>
            ))}
          </div>
        </BottomSheet>
      </div>

      {/* Desktop: Inline Buttons */}
      <div className={`hidden sm:flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedCount} selected
        </span>
        {actions.map((action) => (
          <UniversalButton
            key={action.id}
            variant={action.variant === 'danger' ? 'danger' : 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            leftIcon={action.icon}
            className="!min-h-[44px]"
          >
            {action.label}
          </UniversalButton>
        ))}
      </div>
    </>
  );
}

export default BottomSheet;
