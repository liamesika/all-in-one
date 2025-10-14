// apps/web/lib/typography.ts - EFFINITY Design System Typography
// Strict 4-size, 2-weight system following Effinity brand standards

/**
 * EFFINITY TYPOGRAPHY STANDARDS
 * ==============================
 * STRICT ENFORCEMENT: Use ONLY 4 font sizes and 2 font weights
 *
 * Font Sizes:
 * - Size 1: Large headings (24px / 1.5rem)
 * - Size 2: Subheadings/Important content (18px / 1.125rem)
 * - Size 3: Body text (16px / 1rem) - DEFAULT
 * - Size 4: Small text/Labels (14px / 0.875rem)
 *
 * Font Weights:
 * - Semibold (600): Headings and emphasis
 * - Regular (400): Body text and general content
 *
 * All spacing follows the 8pt grid system (8px, 16px, 24px, 32px)
 */

/**
 * Font Size Scale - STRICT 4 SIZES ONLY
 */
export const FONT_SIZES = {
  size1: '1.5rem',    // 24px - Large headings
  size2: '1.125rem',  // 18px - Subheadings/Important content
  size3: '1rem',      // 16px - Body text (DEFAULT)
  size4: '0.875rem',  // 14px - Small text/Labels
} as const;

/**
 * Font Weight Scale - STRICT 2 WEIGHTS ONLY
 */
export const FONT_WEIGHTS = {
  semibold: '600', // Headings and emphasis
  regular: '400',  // Body text and general content
} as const;

/**
 * Line Heights - Optimized for readability
 * Following 8pt grid where possible
 */
export const LINE_HEIGHTS = {
  tight: '1.25',   // 20px for 16px text
  normal: '1.5',   // 24px for 16px text (8pt grid aligned)
  relaxed: '1.75', // 28px for 16px text
} as const;

/**
 * Letter Spacing - Subtle adjustments for premium feel
 */
export const LETTER_SPACING = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
} as const;

/**
 * Typography Classes - CSS class names following Effinity standards
 */
export const typographyClasses = {
  // Size 1: Large headings (24px, Semibold)
  heading1: 'text-[1.5rem] font-semibold leading-tight tracking-tight',

  // Size 2: Subheadings (18px, Semibold)
  heading2: 'text-[1.125rem] font-semibold leading-normal',

  // Size 3: Body text (16px, Regular) - DEFAULT
  body: 'text-base font-normal leading-normal',

  // Size 3: Body text emphasized (16px, Semibold)
  bodyEmphasized: 'text-base font-semibold leading-normal',

  // Size 4: Small text (14px, Regular)
  small: 'text-sm font-normal leading-normal',

  // Size 4: Small text emphasized (14px, Semibold)
  smallEmphasized: 'text-sm font-semibold leading-normal',

  // Size 4: Labels (14px, Semibold)
  label: 'text-sm font-semibold leading-normal',

  // Size 4: Caption (14px, Regular)
  caption: 'text-sm font-normal leading-normal text-gray-600',
} as const;

/**
 * Component-Specific Typography
 * Pre-configured for common UI components
 */
export const componentTypography = {
  // Button text (Size 4, Semibold)
  button: 'text-sm font-semibold',

  // Input placeholder (Size 4, Regular)
  inputPlaceholder: 'text-sm font-normal',

  // Input value (Size 3, Regular)
  inputValue: 'text-base font-normal',

  // Input label (Size 4, Semibold)
  inputLabel: 'text-sm font-semibold',

  // Card title (Size 2, Semibold)
  cardTitle: 'text-[1.125rem] font-semibold',

  // Card description (Size 3, Regular)
  cardDescription: 'text-base font-normal',

  // Modal title (Size 1, Semibold)
  modalTitle: 'text-[1.5rem] font-semibold',

  // Modal body (Size 3, Regular)
  modalBody: 'text-base font-normal',

  // Table header (Size 4, Semibold)
  tableHeader: 'text-sm font-semibold uppercase tracking-wide',

  // Table cell (Size 4, Regular)
  tableCell: 'text-sm font-normal',

  // Badge (Size 4, Semibold)
  badge: 'text-sm font-semibold',

  // Tooltip (Size 4, Regular)
  tooltip: 'text-sm font-normal',

  // Alert title (Size 3, Semibold)
  alertTitle: 'text-base font-semibold',

  // Alert description (Size 4, Regular)
  alertDescription: 'text-sm font-normal',
} as const;

/**
 * Responsive Typography Scale
 * Maintains hierarchy on mobile with adjusted sizes
 */
export const responsiveTypography = {
  // Heading 1 - responsive
  heading1Responsive: 'text-xl md:text-[1.5rem] font-semibold leading-tight tracking-tight',

  // Heading 2 - responsive
  heading2Responsive: 'text-lg md:text-[1.125rem] font-semibold leading-normal',

  // Body - remains consistent
  bodyResponsive: 'text-base font-normal leading-normal',

  // Small - remains consistent
  smallResponsive: 'text-sm font-normal leading-normal',
} as const;

/**
 * Color Combinations - Typography with semantic colors
 * Following 60/30/10 Effinity color rule
 */
export const typographyColors = {
  // Primary text (30% - complementary)
  primary: 'text-gray-900',

  // Secondary text (30% - complementary)
  secondary: 'text-gray-700',

  // Muted text (30% - complementary)
  muted: 'text-gray-600',

  // Disabled text
  disabled: 'text-gray-400',

  // Accent text (10% - Effinity blue)
  accent: 'text-blue-700',

  // Success text
  success: 'text-green-700',

  // Warning text
  warning: 'text-amber-700',

  // Error text
  error: 'text-red-700',

  // White text (on dark backgrounds)
  inverse: 'text-white',
} as const;

/**
 * Typography Utility Functions
 */

/**
 * Combine typography class with color
 */
export function withColor(typographyClass: string, colorClass: string): string {
  return `${typographyClass} ${colorClass}`;
}

/**
 * Create heading class with custom size (within Effinity constraints)
 * @param size - 1, 2, 3, or 4 (Effinity size system)
 * @param emphasized - Use semibold weight
 */
export function createTextClass(size: 1 | 2 | 3 | 4, emphasized = false): string {
  const sizeMap = {
    1: 'text-[1.5rem]',
    2: 'text-[1.125rem]',
    3: 'text-base',
    4: 'text-sm',
  };
  const weight = emphasized ? 'font-semibold' : 'font-normal';
  return `${sizeMap[size]} ${weight} leading-normal`;
}

/**
 * RTL/LTR Text Alignment Utilities
 * Supports both Hebrew (RTL) and English (LTR)
 */
export const textAlignment = {
  start: 'text-start', // Aligns to start (left in LTR, right in RTL)
  end: 'text-end',     // Aligns to end (right in LTR, left in RTL)
  center: 'text-center',
  justify: 'text-justify',
} as const;

/**
 * Text Truncation Utilities
 */
export const textTruncation = {
  // Single line truncate
  truncate: 'truncate',

  // Multi-line truncate (2 lines)
  truncate2: 'line-clamp-2',

  // Multi-line truncate (3 lines)
  truncate3: 'line-clamp-3',

  // Multi-line truncate (4 lines)
  truncate4: 'line-clamp-4',
} as const;

/**
 * Text Transform Utilities
 */
export const textTransform = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  normal: 'normal-case',
} as const;

/**
 * Preset Typography Combinations
 * Common patterns used throughout the Effinity platform
 */
export const presetTypography = {
  // Page title - Size 1, Semibold, Primary color
  pageTitle: withColor(typographyClasses.heading1, typographyColors.primary),

  // Section heading - Size 2, Semibold, Primary color
  sectionHeading: withColor(typographyClasses.heading2, typographyColors.primary),

  // Body paragraph - Size 3, Regular, Secondary color
  bodyParagraph: withColor(typographyClasses.body, typographyColors.secondary),

  // Small caption - Size 4, Regular, Muted color
  caption: withColor(typographyClasses.caption, typographyColors.muted),

  // Emphasized text - Size 3, Semibold, Accent color
  emphasized: withColor(typographyClasses.bodyEmphasized, typographyColors.accent),

  // Error message - Size 4, Regular, Error color
  error: withColor(typographyClasses.small, typographyColors.error),

  // Success message - Size 4, Regular, Success color
  success: withColor(typographyClasses.small, typographyColors.success),

  // Label - Size 4, Semibold, Primary color
  label: withColor(typographyClasses.label, typographyColors.primary),
} as const;

/**
 * Typography Best Practices for Effinity Design System
 */
export const typographyBestPractices = {
  // Maximum line length for readability (in characters)
  maxLineLength: 75,

  // Optimal line length for readability (in characters)
  optimalLineLength: 60,

  // Recommended paragraph spacing (8pt grid aligned)
  paragraphSpacing: '1rem', // 16px

  // Recommended section spacing (8pt grid aligned)
  sectionSpacing: '2rem', // 32px

  // Font stack
  fontFamily: 'Inter, system-ui, sans-serif',

  // Font smoothing for premium appearance
  fontSmoothing: 'antialiased',
} as const;

/**
 * Accessibility Helpers
 */
export const a11yTypography = {
  // Screen reader only text
  srOnly: 'sr-only',

  // Focus visible text (for keyboard navigation)
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',

  // Skip link
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
} as const;

/**
 * Export all typography utilities as a single object
 */
export const typography = {
  sizes: FONT_SIZES,
  weights: FONT_WEIGHTS,
  lineHeights: LINE_HEIGHTS,
  letterSpacing: LETTER_SPACING,
  classes: typographyClasses,
  components: componentTypography,
  responsive: responsiveTypography,
  colors: typographyColors,
  alignment: textAlignment,
  truncation: textTruncation,
  transform: textTransform,
  presets: presetTypography,
  bestPractices: typographyBestPractices,
  a11y: a11yTypography,
  utils: {
    withColor,
    createTextClass,
  },
} as const;

export default typography;
