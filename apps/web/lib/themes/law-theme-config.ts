/**
 * Law Theme Configuration
 * Tailwind-compatible token exports for Law vertical
 */

export const lawTheme = {
  colors: {
    law: {
      // Backgrounds
      bg: 'var(--law-bg)',
      surface: 'var(--law-surface)',
      'surface-raised': 'var(--law-surface-raised)',
      'surface-overlay': 'var(--law-surface-overlay)',

      // Primary
      primary: 'var(--law-primary)',
      'primary-hover': 'var(--law-primary-hover)',
      'primary-pressed': 'var(--law-primary-pressed)',
      'primary-subtle': 'var(--law-primary-subtle)',

      // Accent
      accent: 'var(--law-accent)',
      'accent-hover': 'var(--law-accent-hover)',
      'accent-light': 'var(--law-accent-light)',

      // Secondary
      secondary: 'var(--law-secondary)',
      'secondary-hover': 'var(--law-secondary-hover)',
      'secondary-light': 'var(--law-secondary-light)',

      // Borders
      border: 'var(--law-border)',
      'border-light': 'var(--law-border-light)',
      'border-strong': 'var(--law-border-strong)',

      // Text
      'text-primary': 'var(--law-text-primary)',
      'text-secondary': 'var(--law-text-secondary)',
      'text-tertiary': 'var(--law-text-tertiary)',
      'text-inverse': 'var(--law-text-inverse)',

      // Status
      success: 'var(--law-success)',
      'success-bg': 'var(--law-success-bg)',
      'success-border': 'var(--law-success-border)',

      warning: 'var(--law-warning)',
      'warning-bg': 'var(--law-warning-bg)',
      'warning-border': 'var(--law-warning-border)',

      error: 'var(--law-error)',
      'error-bg': 'var(--law-error-bg)',
      'error-border': 'var(--law-error-border)',

      info: 'var(--law-info)',
      'info-bg': 'var(--law-info-bg)',
      'info-border': 'var(--law-info-border)',

      // Case Status
      'status-active': 'var(--law-status-active)',
      'status-pending': 'var(--law-status-pending)',
      'status-closed': 'var(--law-status-closed)',
      'status-archived': 'var(--law-status-archived)',
    },
  },

  borderRadius: {
    'law-sm': 'var(--law-radius-sm)',
    'law-md': 'var(--law-radius-md)',
    'law-lg': 'var(--law-radius-lg)',
    'law-xl': 'var(--law-radius-xl)',
  },

  boxShadow: {
    'law-sm': 'var(--law-shadow-sm)',
    'law-md': 'var(--law-shadow-md)',
    'law-lg': 'var(--law-shadow-lg)',
    'law-xl': 'var(--law-shadow-xl)',
  },

  spacing: {
    'law-1': 'var(--law-space-1)',
    'law-2': 'var(--law-space-2)',
    'law-3': 'var(--law-space-3)',
    'law-4': 'var(--law-space-4)',
    'law-5': 'var(--law-space-5)',
    'law-6': 'var(--law-space-6)',
    'law-8': 'var(--law-space-8)',
    'law-10': 'var(--law-space-10)',
    'law-12': 'var(--law-space-12)',
  },

  fontSize: {
    'law-xs': ['var(--law-font-size-xs)', { lineHeight: 'var(--law-line-height-tight)' }],
    'law-sm': ['var(--law-font-size-sm)', { lineHeight: 'var(--law-line-height-normal)' }],
    'law-base': ['var(--law-font-size-base)', { lineHeight: 'var(--law-line-height-normal)' }],
    'law-lg': ['var(--law-font-size-lg)', { lineHeight: 'var(--law-line-height-normal)' }],
    'law-xl': ['var(--law-font-size-xl)', { lineHeight: 'var(--law-line-height-tight)' }],
    'law-2xl': ['var(--law-font-size-2xl)', { lineHeight: 'var(--law-line-height-tight)' }],
    'law-3xl': ['var(--law-font-size-3xl)', { lineHeight: 'var(--law-line-height-tight)' }],
  },

  transitionDuration: {
    'law-fast': 'var(--law-transition-fast)',
    'law-base': 'var(--law-transition-base)',
    'law-slow': 'var(--law-transition-slow)',
  },

  zIndex: {
    'law-dropdown': 'var(--law-z-dropdown)',
    'law-sticky': 'var(--law-z-sticky)',
    'law-fixed': 'var(--law-z-fixed)',
    'law-modal-backdrop': 'var(--law-z-modal-backdrop)',
    'law-modal': 'var(--law-z-modal)',
    'law-popover': 'var(--law-z-popover)',
    'law-tooltip': 'var(--law-z-tooltip)',
  },
};

/**
 * Case Status Colors Utility
 */
export const caseStatusColors = {
  active: {
    bg: 'bg-law-info-bg',
    text: 'text-law-info',
    border: 'border-law-info-border',
  },
  pending: {
    bg: 'bg-law-warning-bg',
    text: 'text-law-warning',
    border: 'border-law-warning-border',
  },
  closed: {
    bg: 'bg-law-success-bg',
    text: 'text-law-success',
    border: 'border-law-success-border',
  },
  archived: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
  },
} as const;

/**
 * Priority Colors Utility
 */
export const priorityColors = {
  high: {
    bg: 'bg-law-error-bg',
    text: 'text-law-error',
    border: 'border-law-error-border',
  },
  medium: {
    bg: 'bg-law-warning-bg',
    text: 'text-law-warning',
    border: 'border-law-warning-border',
  },
  low: {
    bg: 'bg-law-info-bg',
    text: 'text-law-info',
    border: 'border-law-info-border',
  },
} as const;

/**
 * Invoice Status Colors Utility
 */
export const invoiceStatusColors = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
  },
  sent: {
    bg: 'bg-law-info-bg',
    text: 'text-law-info',
    border: 'border-law-info-border',
  },
  paid: {
    bg: 'bg-law-success-bg',
    text: 'text-law-success',
    border: 'border-law-success-border',
  },
  overdue: {
    bg: 'bg-law-error-bg',
    text: 'text-law-error',
    border: 'border-law-error-border',
  },
} as const;
