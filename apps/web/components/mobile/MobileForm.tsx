'use client';

// apps/web/components/mobile/MobileForm.tsx - EFFINITY Mobile-Optimized Form
// Large touch-friendly inputs with bottom sheet selects

import React from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * MobileInput Component
 * 44px minimum height, 16px font to prevent iOS zoom
 */
export function MobileInput({
  label,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full min-h-[44px] px-3 py-2
          text-base text-gray-900 dark:text-white
          bg-white dark:bg-gray-800
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-600
          placeholder:text-gray-500
          ${props.className || ''}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * MobileTextarea Component
 */
export function MobileTextarea({
  label,
  error,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full min-h-[88px] px-3 py-2
          text-base text-gray-900 dark:text-white
          bg-white dark:bg-gray-800
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-600
          placeholder:text-gray-500
          ${props.className || ''}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * MobileSelect Component with Bottom Sheet
 */
export function MobileSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  className = '',
}: {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`
          w-full min-h-[44px] px-3 py-2
          flex items-center justify-between
          text-base text-start
          bg-white dark:bg-gray-800
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-600
        `}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {label || 'Select'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-64px)]">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-4
                    text-start text-base
                    ${value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-900 dark:text-white'}
                    hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * MobileFormActions
 * Fixed bottom action bar for forms
 */
export function MobileFormActions({
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  className = '',
}: {
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 pb-[env(safe-area-inset-bottom)] ${className}`}>
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 min-h-[44px] px-6 py-3 text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px] px-6 py-3 text-base font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </div>
  );
}

export default MobileInput;
