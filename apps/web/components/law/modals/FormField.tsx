'use client';

/**
 * FormField Component
 * Reusable form field with label, input, error handling, and RTL support
 */

import { ReactNode } from 'react';
import { useLanguage } from '@/lib/language-context';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'datetime-local' | 'number' | 'textarea' | 'select';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  children?: ReactNode; // For select options
  className?: string;
  rows?: number; // For textarea
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  disabled = false,
  children,
  className = '',
  rows = 4,
  min,
  max,
  step,
}: FormFieldProps) {
  const { language } = useLanguage();

  const baseInputClasses = `
    w-full px-3 py-2
    border rounded-lg
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
    ${error
      ? 'border-red-500 dark:border-red-500'
      : 'border-gray-300 dark:border-gray-700'
    }
  `;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={baseInputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
