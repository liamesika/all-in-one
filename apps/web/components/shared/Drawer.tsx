'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UniversalButton } from './UniversalButton';
import { useFocusTrap } from '../../hooks/useKeyboardNavigation';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
  onApply?: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'full';
  showFooter?: boolean;
  resetLabel?: string;
  applyLabel?: string;
  className?: string;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full',
};

export function Drawer({
  isOpen,
  onClose,
  onReset,
  onApply,
  title,
  children,
  position = 'right',
  width = 'md',
  showFooter = true,
  resetLabel = 'Reset',
  applyLabel = 'Apply',
  className = '',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Trap focus within drawer when open
  useFocusTrap(drawerRef, isOpen);

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

  // Prevent body scroll when drawer is open
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

  const positionClasses =
    position === 'left'
      ? 'left-0 transform -translate-x-full data-[open=true]:translate-x-0'
      : 'right-0 transform translate-x-full data-[open=true]:translate-x-0';

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        data-open={isOpen}
        className={`fixed top-0 ${positionClasses} h-full ${widthClasses[width]} w-full bg-white dark:bg-[#1A2F4B] shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2
            id="drawer-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <UniversalButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close drawer"
            className="!w-11 !h-11 !min-w-[44px] !min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </UniversalButton>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {children}
        </div>

        {/* Footer - Fixed (optional) */}
        {showFooter && (onReset || onApply) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-[#0E1A2B]">
            {onReset && (
              <UniversalButton
                variant="outline"
                size="md"
                onClick={onReset}
                className="!min-w-[88px] !min-h-[44px]"
              >
                {resetLabel}
              </UniversalButton>
            )}
            {onApply && (
              <UniversalButton
                variant="primary"
                size="md"
                onClick={onApply}
                className="!min-w-[88px] !min-h-[44px]"
              >
                {applyLabel}
              </UniversalButton>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Mobile-optimized variant with bottom sheet on very small screens
export function MobileDrawer(props: DrawerProps) {
  return (
    <div className="sm:hidden">
      <Drawer {...props} width="full" position="right" />
    </div>
  );
}

// Desktop-optimized variant
export function DesktopDrawer(props: DrawerProps) {
  return (
    <div className="hidden sm:block">
      <Drawer {...props} />
    </div>
  );
}

export default Drawer;
