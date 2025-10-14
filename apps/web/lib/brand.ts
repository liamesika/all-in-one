// apps/web/lib/brand.ts - EFFINITY Brand System
// Comprehensive brand colors, gradients, and identity utilities

/**
 * EFFINITY BRAND IDENTITY
 * =======================
 * Professional, modern, tech-forward aesthetic
 * Deep royal blue (#2979FF) with dark navy backgrounds
 * Metallic/silver accents for premium feel
 * Consistent with 60/30/10 color rule
 */

/**
 * Primary Brand Colors
 */
export const BRAND = {
  colors: {
    // Primary blues
    primary: '#2979FF',       // Royal blue - main brand color
    darkBg: '#0E1A2B',        // Deep navy - dark backgrounds
    mediumBg: '#1A2F4B',      // Medium navy - elevated surfaces
    lightBlue: '#60A5FA',     // Light blue - accents/highlights

    // Metallic accents
    steel: '#9EA7B3',         // Steel gray
    silver: '#CFD4DD',        // Silver mist
    platinum: '#E8EBF0',      // Platinum light

    // Semantic colors
    success: '#10B981',       // Green
    warning: '#F59E0B',       // Amber
    error: '#EF4444',         // Red
    info: '#3B82F6',          // Blue

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  /**
   * Brand Gradients
   */
  gradients: {
    // Primary brand gradient (for hero sections, CTAs)
    primary: 'linear-gradient(135deg, #0E1A2B 0%, #1A2F4B 40%, #2979FF 100%)',

    // Subtle background gradient
    subtleBlue: 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)',
    subtleDark: 'linear-gradient(180deg, #0E1A2B 0%, #1A2F4B 100%)',

    // Metallic accent gradient
    metallic: 'linear-gradient(135deg, #9EA7B3 0%, #CFD4DD 50%, #9EA7B3 100%)',
    silver: 'linear-gradient(135deg, #CFD4DD 0%, #E8EBF0 50%, #CFD4DD 100%)',

    // Button gradients
    buttonPrimary: 'linear-gradient(180deg, #2979FF 0%, #1D4ED8 100%)',
    buttonHover: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',

    // Glow effects
    glowBlue: 'radial-gradient(circle, rgba(41, 121, 255, 0.3) 0%, transparent 70%)',
    glowIntense: 'radial-gradient(circle, rgba(41, 121, 255, 0.5) 0%, rgba(41, 121, 255, 0.1) 50%, transparent 100%)',

    // Hero gradients
    heroLight: 'radial-gradient(circle at top right, #2979FF 0%, #60A5FA 50%, #FFFFFF 100%)',
    heroDark: 'radial-gradient(circle at top right, #2979FF 0%, #1A2F4B 50%, #0E1A2B 100%)',
  },

  /**
   * Brand Shadows
   */
  shadows: {
    // Standard shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Brand glow shadows
    glow: '0 0 20px rgba(41, 121, 255, 0.3)',
    glowIntense: '0 0 50px rgba(41, 121, 255, 0.5), 0 0 100px rgba(41, 121, 255, 0.2)',
    glowSoft: '0 0 10px rgba(41, 121, 255, 0.2)',

    // Card shadows
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 15px -3px rgba(41, 121, 255, 0.1), 0 4px 6px -2px rgba(41, 121, 255, 0.05)',
    cardElevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

    // Inner shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  /**
   * Brand Typography
   */
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Monaco, Courier New, monospace',
    },
    fontSmoothing: {
      antialiased: '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;',
    },
  },

  /**
   * Brand Spacing (8pt grid aligned)
   */
  spacing: {
    xs: '4px',    // 0.5rem
    sm: '8px',    // 1rem
    md: '16px',   // 2rem
    lg: '24px',   // 3rem
    xl: '32px',   // 4rem
    '2xl': '48px', // 6rem
    '3xl': '64px', // 8rem
  },

  /**
   * Brand Border Radius
   */
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  /**
   * Brand Animations
   */
  animations: {
    // Transition durations
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },

    // Easing functions
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },

    // Keyframes
    fadeIn: 'fadeIn 300ms ease-in-out',
    fadeOut: 'fadeOut 300ms ease-in-out',
    slideUp: 'slideUp 300ms ease-out',
    slideDown: 'slideDown 300ms ease-out',
    slideLeft: 'slideLeft 300ms ease-out',
    slideRight: 'slideRight 300ms ease-out',
    scaleIn: 'scaleIn 200ms ease-out',
    scaleOut: 'scaleOut 200ms ease-in',
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
} as const;

/**
 * Logo Specifications
 */
export const LOGO_SPECS = {
  sizes: {
    xs: 24,      // Small icons
    sm: 32,      // Navigation
    md: 48,      // Standard
    lg: 64,      // Headers
    xl: 96,      // Hero sections
    '2xl': 128,  // Splash screens
  },

  minSize: 16,   // Minimum readable size
  maxSize: 512,  // Maximum size for clarity

  // Color variants
  variants: {
    full: 'Full color logo with text',
    icon: 'Icon only (no text)',
    white: 'White version for dark backgrounds',
    blue: 'Blue version for light backgrounds',
    monochrome: 'Single color version',
  },

  // File formats
  formats: ['SVG', 'PNG', 'WebP'],

  // Usage guidelines
  clearSpace: '16px minimum around logo',
  alignment: 'Center or left-aligned preferred',
} as const;

/**
 * Brand Voice & Messaging
 */
export const BRAND_VOICE = {
  tone: ['Professional', 'Modern', 'Confident', 'Clear', 'Helpful'],
  style: ['Concise', 'Action-oriented', 'User-focused', 'Technical but accessible'],
  avoid: ['Jargon overload', 'Overly casual', 'Passive voice', 'Vague promises'],
} as const;

/**
 * Tailwind CSS Classes for Brand Elements
 */
export const brandClasses = {
  // Backgrounds
  bgPrimary: 'bg-[#2979FF]',
  bgDark: 'bg-[#0E1A2B]',
  bgMedium: 'bg-[#1A2F4B]',

  // Text colors
  textPrimary: 'text-[#2979FF]',
  textDark: 'text-[#0E1A2B]',
  textLight: 'text-white',

  // Buttons
  btnPrimary: 'bg-[#2979FF] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg transition-colors',
  btnSecondary: 'bg-[#1A2F4B] hover:bg-[#0E1A2B] text-white font-semibold px-6 py-3 rounded-lg transition-colors',
  btnOutline: 'border-2 border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors',

  // Cards
  card: 'bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 rounded-lg shadow-sm',
  cardElevated: 'bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 rounded-lg shadow-lg',

  // Badges
  badge: 'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full',
  badgePrimary: 'bg-[#2979FF]/10 text-[#2979FF]',
  badgeSuccess: 'bg-green-100 text-green-700',
  badgeWarning: 'bg-amber-100 text-amber-700',
  badgeError: 'bg-red-100 text-red-700',
} as const;

/**
 * Utility Functions
 */

/**
 * Get brand color with opacity
 */
export function getBrandColorWithOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Apply brand gradient to element
 */
export function applyBrandGradient(element: HTMLElement, gradient: keyof typeof BRAND.gradients) {
  element.style.background = BRAND.gradients[gradient];
}

/**
 * Get shadow for elevation level
 */
export function getShadowForElevation(level: 1 | 2 | 3 | 4 | 5): string {
  const shadows = {
    1: BRAND.shadows.sm,
    2: BRAND.shadows.md,
    3: BRAND.shadows.lg,
    4: BRAND.shadows.xl,
    5: BRAND.shadows['2xl'],
  };
  return shadows[level];
}

/**
 * Validate brand compliance
 * Check if colors match brand guidelines
 */
export function validateBrandCompliance(colors: {
  primary: string;
  secondary: string;
  accent: string;
}): boolean {
  return colors.primary === BRAND.colors.primary;
}

/**
 * Export all brand utilities
 */
export default BRAND;
