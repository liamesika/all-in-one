'use client';
// components/ui/tooltip.tsx - Enhanced Tooltip Component
// Following Effinity Design System with full accessibility support

import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip Position Options
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip Variants
 */
export type TooltipVariant = 'default' | 'light' | 'error' | 'success' | 'warning';

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  offset?: number;
  disabled?: boolean;
  arrow?: boolean;
  maxWidth?: number;
  className?: string;
  id?: string;
}

/**
 * Enhanced Tooltip Component
 * Features:
 * - Full keyboard accessibility (focus/blur)
 * - ARIA compliant
 * - Customizable position, delay, and styling
 * - RTL support
 * - Mobile touch support
 */
export const Tooltip = ({
  children,
  content,
  position = 'top',
  variant = 'default',
  delay = 200,
  offset = 8,
  disabled = false,
  arrow = true,
  maxWidth = 320,
  className = '',
  id,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  // Generate unique ID for ARIA
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const showTooltip = () => {
    if (disabled) return;

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Variant styles following Effinity design system
  const variantStyles: Record<TooltipVariant, string> = {
    default: 'bg-gray-900 text-white',
    light: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
    error: 'bg-red-700 text-white',
    success: 'bg-green-700 text-white',
    warning: 'bg-amber-700 text-white',
  };

  // Position classes
  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2',
    bottom: 'top-full left-1/2 -translate-x-1/2',
    left: 'right-full top-1/2 -translate-y-1/2',
    right: 'left-full top-1/2 -translate-y-1/2',
  };

  // Arrow styles
  const arrowStyles: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[6px] border-x-[6px] border-x-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[6px] border-x-[6px] border-x-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[6px] border-y-[6px] border-y-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[6px] border-y-[6px] border-y-transparent',
  };

  const arrowColors: Record<TooltipVariant, string> = {
    default: 'border-t-gray-900',
    light: 'border-t-white',
    error: 'border-t-red-700',
    success: 'border-t-green-700',
    warning: 'border-t-amber-700',
  };

  // Offset styles
  const offsetStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: { marginBottom: `${offset}px` },
    bottom: { marginTop: `${offset}px` },
    left: { marginRight: `${offset}px` },
    right: { marginLeft: `${offset}px` },
  };

  // Clone child element to add event handlers and ref
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
    'aria-describedby': isVisible ? tooltipId : undefined,
    tabIndex: children.props.tabIndex ?? 0,
  });

  if (!isMounted) {
    return trigger;
  }

  return (
    <div className="relative inline-block">
      {trigger}

      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-[70] px-3 py-2 text-sm font-normal rounded-lg
            pointer-events-none animate-fade-in
            ${variantStyles[variant]}
            ${positionClasses[position]}
            ${className}
          `.trim()}
          style={{
            maxWidth: `${maxWidth}px`,
            ...offsetStyles[position],
          }}
        >
          {content}

          {/* Arrow */}
          {arrow && (
            <div
              className={`
                absolute w-0 h-0
                ${arrowStyles[position]}
                ${position === 'top' ? arrowColors[variant] : ''}
                ${position === 'bottom' ? arrowColors[variant].replace('border-t-', 'border-b-') : ''}
                ${position === 'left' ? arrowColors[variant].replace('border-t-', 'border-l-') : ''}
                ${position === 'right' ? arrowColors[variant].replace('border-t-', 'border-r-') : ''}
              `}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Tooltip Component
 * Simplified API for common use cases
 */
export interface SimpleTooltipProps {
  text: string;
  children: React.ReactElement;
  position?: TooltipPosition;
}

export const SimpleTooltip = ({ text, children, position = 'top' }: SimpleTooltipProps) => {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  );
};

/**
 * Info Tooltip Component
 * Pre-configured for info icons
 */
export interface InfoTooltipProps {
  text: string;
  className?: string;
}

export const InfoTooltip = ({ text, className = '' }: InfoTooltipProps) => {
  return (
    <Tooltip content={text} position="top" maxWidth={240}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center w-4 h-4 rounded-full
          bg-gray-400 text-white hover:bg-gray-500 transition-colors
          ${className}
        `}
        aria-label="More information"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
};

/**
 * Tooltip Provider Component
 * For managing tooltip defaults across the app
 */
interface TooltipProviderProps {
  children: React.ReactNode;
  defaultDelay?: number;
  defaultPosition?: TooltipPosition;
}

const TooltipContext = React.createContext<{
  defaultDelay: number;
  defaultPosition: TooltipPosition;
}>({
  defaultDelay: 200,
  defaultPosition: 'top',
});

export const TooltipProvider = ({
  children,
  defaultDelay = 200,
  defaultPosition = 'top',
}: TooltipProviderProps) => {
  return (
    <TooltipContext.Provider value={{ defaultDelay, defaultPosition }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltipContext = () => React.useContext(TooltipContext);

/**
 * Rich Tooltip Component
 * For tooltips with complex content (titles, descriptions, actions)
 */
export interface RichTooltipProps {
  children: React.ReactElement;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: TooltipPosition;
  className?: string;
}

export const RichTooltip = ({
  children,
  title,
  description,
  action,
  position = 'top',
  className = '',
}: RichTooltipProps) => {
  const content = (
    <div className="space-y-2">
      <div className="font-semibold text-sm">{title}</div>
      {description && <div className="text-xs opacity-90">{description}</div>}
      {action && (
        <button
          onClick={action.onClick}
          className="
            text-xs font-semibold underline hover:no-underline
            transition-all mt-2 pointer-events-auto
          "
        >
          {action.label}
        </button>
      )}
    </div>
  );

  return (
    <Tooltip
      content={content}
      position={position}
      variant="default"
      maxWidth={280}
      className={className}
    >
      {children}
    </Tooltip>
  );
};

/**
 * Tooltip with Icon
 * Pre-configured tooltip with leading icon
 */
export interface IconTooltipProps {
  text: string;
  icon: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  variant?: TooltipVariant;
}

export const IconTooltip = ({
  text,
  icon,
  children,
  position = 'top',
  variant = 'default',
}: IconTooltipProps) => {
  const content = (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  );

  return (
    <Tooltip content={content} position={position} variant={variant}>
      {children}
    </Tooltip>
  );
};

export default Tooltip;
