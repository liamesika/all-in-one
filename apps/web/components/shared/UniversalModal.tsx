'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { UniversalButton } from './UniversalButton';

/**
 * UniversalModal Component
 *
 * Standardized modal/dialog component with overlay, animations, and consistent styling
 * Used across all verticals for dialogs, confirmations, and forms
 *
 * @example
 * <UniversalModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Create New Project"
 * >
 *   <p>Modal content goes here</p>
 * </UniversalModal>
 */

export interface UniversalModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal description
   */
  description?: string;

  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking overlay closes modal
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether pressing Escape closes modal
   */
  closeOnEscape?: boolean;

  /**
   * Additional CSS classes for modal container
   */
  className?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Footer content (typically action buttons)
   */
  footer?: React.ReactNode;
}

export function UniversalModal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  children,
  footer,
}: UniversalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full animate-slide-up',
          sizeStyles[size],
          'bg-white dark:bg-[#1A2F4B]',
          'rounded-lg shadow-xl',
          'border border-gray-200 dark:border-[#2979FF]/20',
          'max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-4 p-2 rounded-lg',
                  'text-gray-400 hover:text-gray-600',
                  'dark:text-gray-500 dark:hover:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-[#0E1A2B]',
                  'transition-colors'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2979FF]/20 bg-gray-50 dark:bg-[#0E1A2B]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Confirmation Modal
 * Pre-configured modal for confirmation dialogs
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}: ConfirmModalProps) {
  const variantConfig = {
    danger: { buttonVariant: 'danger' as const, icon: '⚠️' },
    warning: { buttonVariant: 'primary' as const, icon: '⚠️' },
    info: { buttonVariant: 'primary' as const, icon: 'ℹ️' },
  };

  const config = variantConfig[variant];

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center">
        <div className="text-4xl mb-4">{config.icon}</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <UniversalButton
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </UniversalButton>
        <UniversalButton
          variant={config.buttonVariant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </UniversalButton>
      </div>
    </UniversalModal>
  );
}

/**
 * Form Modal
 * Pre-configured modal for forms with submit/cancel actions
 */
export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: React.ReactNode;
  size?: UniversalModalProps['size'];
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  children,
  size = 'md',
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <UniversalButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </UniversalButton>
          <UniversalButton
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {submitText}
          </UniversalButton>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </UniversalModal>
  );
}
