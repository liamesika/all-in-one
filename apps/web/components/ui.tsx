'use client';
// components/ui.tsx - Effinity Design System Components
import React from 'react';

// Card Components - 8pt Grid + Effinity Colors
export const Card = ({className='', ...p}: any) =>
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...p} />;

export const CardHeader = ({className='', ...p}: any) =>
  <div className={`flex flex-col space-y-2 p-6 ${className}`} {...p} />;

export const CardTitle = ({className='', ...p}: any) =>
  <h3 className={`text-base font-semibold text-gray-900 tracking-tight ${className}`} {...p} />;

export const CardDescription = ({className='', ...p}: any) =>
  <p className={`text-sm font-normal text-gray-700 ${className}`} {...p} />;

export const CardContent = ({className='', ...p}: any) =>
  <div className={`p-6 pt-0 ${className}`} {...p} />;

// Button Component - Effinity Design System
export const Button = ({ 
  href, 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'default', 
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props 
}: any) => {
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg font-semibold 
    transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-blue-500 focus-visible:ring-offset-2 
    disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
    min-h-11
  `;
  
  const variantClasses = {
    primary: 'bg-blue-800 text-white hover:bg-blue-900 focus-visible:ring-blue-500 shadow-sm hover:shadow',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-600 border border-gray-200',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-blue-500',
    accent: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm hover:shadow',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow'
  }[variant] || variantClasses.primary;
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',    // Small: 32px height, 12px text
    default: 'h-11 px-6 text-sm', // Default: 44px height, 14px text
    lg: 'h-12 px-8 text-base'       // Large: 48px height, 16px text
  }[size] || sizeClasses.default;
  
  const finalClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();
  
  const commonProps = {
    className: finalClasses,
    disabled,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    ...props
  };
  
  return href
    ? <a href={href} role="button" {...commonProps}>{children}</a>
    : <button {...commonProps}>{children}</button>;
};

// Subtle Button - Minimal Style
export const SubtleButton = ({href, children, className='', ...props}: any) => {
  const classes = `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-normal border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors ${className}`;

  return href
    ? <a href={href} className={classes}>{children}</a>
    : <button className={classes} {...props}>{children}</button>;
};

// Input Component - Effinity Design System
export const Input = ({
  className = '', 
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  id,
  ...props
}: any) => {
  const baseClasses = `
    flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
    text-sm font-normal text-gray-900 placeholder:text-gray-500 transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
    focus-visible:ring-offset-2 hover:border-gray-400
    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
    file:border-0 file:bg-transparent file:text-sm file:font-normal
  `;
  
  return (
    <input 
      id={id}
      className={`${baseClasses} ${className}`.trim()}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      {...props} 
    />
  );
};

// Label Component - Effinity Typography
export const Label = ({
  className = '', 
  htmlFor,
  children,
  required = false,
  ...props
}: any) => (
  <label 
    htmlFor={htmlFor}
    className={`
      text-sm font-semibold leading-none text-gray-700
      peer-disabled:cursor-not-allowed peer-disabled:opacity-70
      ${className}
    `.trim()}
    {...props}
  >
    {children}
    {required && (
      <span className="text-red-500 ml-1" aria-label="required field">*</span>
    )}
  </label>
);

// Textarea Component - Effinity Design System
export const Textarea = ({
  className = '', 
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  id,
  rows = 3,
  ...props
}: any) => {
  const baseClasses = `
    flex min-h-24 w-full rounded-lg border border-gray-300 bg-white 
    px-3 py-2 text-sm font-normal placeholder:text-gray-500 transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
    focus-visible:ring-offset-2 hover:border-gray-400 resize-vertical
    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
  `;
  
  return (
    <textarea 
      id={id}
      rows={rows}
      className={`${baseClasses} ${className}`.trim()}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      {...props}
    />
  );
};

// Badge Component - Effinity Design System
export const Badge = ({className='', variant='default', ...props}: any) => {
  const variantClasses = {
    default: 'bg-gray-900 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    primary: 'bg-blue-600 text-white',
    accent: 'bg-blue-500 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    danger: 'bg-red-600 text-white'
  }[variant] || 'bg-gray-900 text-white';
  
  return <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold transition-colors ${variantClasses} ${className}`} {...props} />;
};

// Progress Component - Effinity Design System
export const Progress = ({value = 0, className='', ...props}: any) =>
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
    <div className="h-full bg-blue-600 transition-all duration-300" style={{width: `${Math.min(100, Math.max(0, value))}%`}} />
  </div>;

// Alert Component - Effinity Design System
export const Alert = ({
  className = '', 
  variant = 'default', 
  role = 'alert',
  'aria-live': ariaLive = 'polite',
  children,
  ...props
}: any) => {
  const variantClasses = {
    default: 'border-blue-200 text-blue-800 bg-blue-50',
    destructive: 'border-red-200 text-red-800 bg-red-50',
    success: 'border-green-200 text-green-800 bg-green-50',
    warning: 'border-yellow-200 text-yellow-800 bg-yellow-50'
  }[variant] || 'border-gray-200 text-gray-800 bg-gray-50';
  
  return (
    <div 
      role={role}
      aria-live={ariaLive}
      className={`
        relative w-full rounded-lg border p-4 text-sm font-normal
        ${variantClasses} ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({className = '', ...props}: any) =>
  <div className={`text-sm font-normal leading-relaxed ${className}`} {...props} />;

// Accessibility Components - Effinity Design System

// Skip Link component for keyboard navigation
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content', className = '' }) => (
  <a
    href={href}
    className={`
      sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
      z-50 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white 
      transition-all focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-white focus-visible:ring-offset-2
      ${className}
    `.trim()}
  >
    {children}
  </a>
);

// Screen Reader Only text component
export const VisuallyHidden = ({ children, className = '', ...props }: any) => (
  <span className={`sr-only ${className}`} {...props}>
    {children}
  </span>
);

// Focus trap component for modals
export const FocusTrap = ({ children, className = '', ...props }: any) => (
  <div
    className={className}
    onKeyDown={(e) => {
      if (e.key === 'Tab') {
        // Basic focus trap implementation
        const focusableElements = (e.currentTarget as HTMLElement)
          .querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
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
      }
    }}
    {...props}
  >
    {children}
  </div>
);

// Modal Component - EFFINITY Design System
export const Modal = ({
  isOpen = false,
  onClose,
  children,
  className = '',
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  ...props
}: any) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }[size] || 'max-w-2xl';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <FocusTrap className={`relative w-full ${sizeClasses} animate-scale-in`}>
        <div className={`rounded-lg border border-gray-200 bg-white shadow-xl ${className}`}>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </FocusTrap>
    </div>
  );
};

export const ModalHeader = ({ className = '', children, ...props }: any) => (
  <div className={`flex flex-col space-y-2 p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalTitle = ({ className = '', children, ...props }: any) => (
  <h2 className={`text-xl font-semibold text-gray-900 leading-tight ${className}`} {...props}>
    {children}
  </h2>
);

export const ModalContent = ({ className = '', children, ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ className = '', children, ...props }: any) => (
  <div className={`flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// Tooltip Component - EFFINITY Design System
export const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 200,
  ...props
}: any) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }[position] || 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900'
  }[position] || 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900';

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none animate-fade-in ${positionClasses}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses}`} />
        </div>
      )}
    </div>
  );
};

// Dropdown Component - EFFINITY Design System
export const Dropdown = ({
  trigger,
  children,
  isOpen = false,
  onToggle,
  position = 'bottom-left',
  className = '',
  ...props
}: any) => {
  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2'
  }[position] || 'top-full left-0 mt-2';

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => onToggle?.(false)}
            aria-hidden="true"
          />
          <div className={`absolute z-20 min-w-48 ${positionClasses} animate-scale-in`}>
            <div className="rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-gray-900/5 overflow-hidden">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className = '',
  disabled = false,
  destructive = false,
  ...props
}: any) => {
  const baseClasses = 'block w-full px-4 py-3 text-left text-sm transition-colors cursor-pointer';
  const stateClasses = disabled
    ? 'text-gray-400 cursor-not-allowed'
    : destructive
    ? 'text-red-600 hover:bg-red-50'
    : 'text-gray-700 hover:bg-gray-50';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${stateClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Loading Spinner - EFFINITY Design System
export const Spinner = ({ size = 'md', className = '', color = 'primary', ...props }: any) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }[size] || 'h-6 w-6';

  const colorClasses = {
    primary: 'text-blue-600',
    neutral: 'text-gray-600',
    white: 'text-white'
  }[color] || 'text-blue-600';

  return (
    <div
      className={`animate-spin ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Enhanced Select Component - EFFINITY Design System
export const Select = ({
  options = [],
  value,
  onValueChange,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((option: any) => option.value === value);

  return (
    <Dropdown
      isOpen={isOpen}
      onToggle={setIsOpen}
      className={className}
      trigger={
        <button
          className={`
            flex h-11 w-full items-center justify-between rounded-lg border border-gray-300
            bg-white px-3 py-2 text-sm placeholder:text-gray-500
            focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
            hover:border-gray-400 transition-colors
          `}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
    >
      {options.map((option: any) => (
        <DropdownItem
          key={option.value}
          onClick={() => {
            onValueChange?.(option.value);
            setIsOpen(false);
          }}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};
