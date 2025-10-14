// apps/web/lib/spacing.ts - EFFINITY Design System Spacing & Layout
// Strict 8pt grid system enforcement for consistent visual harmony

/**
 * EFFINITY 8PT GRID SYSTEM
 * =========================
 * ALL spacing values MUST be divisible by 8 or 4
 * This creates visual harmony and consistent rhythm throughout the UI
 *
 * Base unit: 8px
 * Half unit: 4px (for fine adjustments)
 *
 * Examples: 8px, 12px, 16px, 24px, 32px ✓
 * Invalid: 10px, 11px, 15px, 25px ✗
 */

/**
 * Spacing Scale - 8pt Grid System
 * All values are divisible by 4 or 8
 */
export const SPACING = {
  0: '0',          // 0px
  1: '0.25rem',    // 4px  - Minimal spacing
  2: '0.5rem',     // 8px  - Base unit
  3: '0.75rem',    // 12px - Half + Base
  4: '1rem',       // 16px - Double base
  5: '1.25rem',    // 20px - Used sparingly
  6: '1.5rem',     // 24px - Common spacing
  8: '2rem',       // 32px - Section spacing
  10: '2.5rem',    // 40px - Large spacing
  12: '3rem',      // 48px - Extra large spacing
  16: '4rem',      // 64px - Hero spacing
  20: '5rem',      // 80px - Massive spacing
  24: '6rem',      // 96px - Page-level spacing
  32: '8rem',      // 128px - Ultra spacing
} as const;

/**
 * Padding Utilities - 8pt grid aligned
 */
export const padding = {
  // All sides
  p0: 'p-0',       // 0px
  p1: 'p-1',       // 4px
  p2: 'p-2',       // 8px
  p3: 'p-3',       // 12px
  p4: 'p-4',       // 16px
  p6: 'p-6',       // 24px
  p8: 'p-8',       // 32px
  p10: 'p-10',     // 40px
  p12: 'p-12',     // 48px
  p16: 'p-16',     // 64px
  p20: 'p-20',     // 80px
  p24: 'p-24',     // 96px

  // Horizontal (x-axis)
  px0: 'px-0',
  px1: 'px-1',
  px2: 'px-2',
  px3: 'px-3',
  px4: 'px-4',
  px6: 'px-6',
  px8: 'px-8',
  px12: 'px-12',
  px16: 'px-16',

  // Vertical (y-axis)
  py0: 'py-0',
  py1: 'py-1',
  py2: 'py-2',
  py3: 'py-3',
  py4: 'py-4',
  py6: 'py-6',
  py8: 'py-8',
  py12: 'py-12',
  py16: 'py-16',

  // Individual sides
  pt2: 'pt-2',   // top 8px
  pt4: 'pt-4',   // top 16px
  pt6: 'pt-6',   // top 24px
  pt8: 'pt-8',   // top 32px

  pb2: 'pb-2',   // bottom 8px
  pb4: 'pb-4',   // bottom 16px
  pb6: 'pb-6',   // bottom 24px
  pb8: 'pb-8',   // bottom 32px

  pl2: 'pl-2',   // left 8px
  pl4: 'pl-4',   // left 16px
  pl6: 'pl-6',   // left 24px
  pl8: 'pl-8',   // left 32px

  pr2: 'pr-2',   // right 8px
  pr4: 'pr-4',   // right 16px
  pr6: 'pr-6',   // right 24px
  pr8: 'pr-8',   // right 32px
} as const;

/**
 * Margin Utilities - 8pt grid aligned
 */
export const margin = {
  // All sides
  m0: 'm-0',
  m1: 'm-1',
  m2: 'm-2',
  m3: 'm-3',
  m4: 'm-4',
  m6: 'm-6',
  m8: 'm-8',
  m10: 'm-10',
  m12: 'm-12',
  m16: 'm-16',
  m20: 'm-20',
  m24: 'm-24',

  // Auto margins
  mAuto: 'm-auto',
  mxAuto: 'mx-auto',
  myAuto: 'my-auto',

  // Horizontal (x-axis)
  mx0: 'mx-0',
  mx1: 'mx-1',
  mx2: 'mx-2',
  mx3: 'mx-3',
  mx4: 'mx-4',
  mx6: 'mx-6',
  mx8: 'mx-8',
  mx12: 'mx-12',

  // Vertical (y-axis)
  my0: 'my-0',
  my1: 'my-1',
  my2: 'my-2',
  my3: 'my-3',
  my4: 'my-4',
  my6: 'my-6',
  my8: 'my-8',
  my12: 'my-12',

  // Individual sides
  mt2: 'mt-2',
  mt4: 'mt-4',
  mt6: 'mt-6',
  mt8: 'mt-8',

  mb2: 'mb-2',
  mb4: 'mb-4',
  mb6: 'mb-6',
  mb8: 'mb-8',

  ml2: 'ml-2',
  ml4: 'ml-4',
  ml6: 'ml-6',
  ml8: 'ml-8',

  mr2: 'mr-2',
  mr4: 'mr-4',
  mr6: 'mr-6',
  mr8: 'mr-8',

  // Negative margins (for overlapping effects)
  '-mt2': '-mt-2',
  '-mt4': '-mt-4',
  '-ml2': '-ml-2',
  '-ml4': '-ml-4',
} as const;

/**
 * Gap Utilities - 8pt grid aligned (for Flexbox/Grid)
 */
export const gap = {
  gap0: 'gap-0',
  gap1: 'gap-1',   // 4px
  gap2: 'gap-2',   // 8px
  gap3: 'gap-3',   // 12px
  gap4: 'gap-4',   // 16px
  gap6: 'gap-6',   // 24px
  gap8: 'gap-8',   // 32px
  gap12: 'gap-12', // 48px
  gap16: 'gap-16', // 64px

  // Horizontal gap
  gapX2: 'gap-x-2',
  gapX3: 'gap-x-3',
  gapX4: 'gap-x-4',
  gapX6: 'gap-x-6',
  gapX8: 'gap-x-8',

  // Vertical gap
  gapY2: 'gap-y-2',
  gapY3: 'gap-y-3',
  gapY4: 'gap-y-4',
  gapY6: 'gap-y-6',
  gapY8: 'gap-y-8',
} as const;

/**
 * Space Between Utilities - 8pt grid aligned
 */
export const spaceBetween = {
  spaceX2: 'space-x-2',
  spaceX3: 'space-x-3',
  spaceX4: 'space-x-4',
  spaceX6: 'space-x-6',
  spaceX8: 'space-x-8',

  spaceY2: 'space-y-2',
  spaceY3: 'space-y-3',
  spaceY4: 'space-y-4',
  spaceY6: 'space-y-6',
  spaceY8: 'space-y-8',
} as const;

/**
 * Container Max-Widths
 * Standard breakpoints for content containers
 */
export const containerWidths = {
  sm: 'max-w-screen-sm',    // 640px
  md: 'max-w-screen-md',    // 768px
  lg: 'max-w-screen-lg',    // 1024px
  xl: 'max-w-screen-xl',    // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
  prose: 'max-w-prose',     // ~65ch for optimal reading
} as const;

/**
 * Container Classes
 * Pre-configured container patterns
 */
export const containers = {
  // Standard page container
  page: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',

  // Narrow content container
  narrow: 'max-w-screen-md mx-auto px-4 sm:px-6',

  // Wide content container
  wide: 'max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8',

  // Full width container
  full: 'w-full px-4 sm:px-6 lg:px-8',

  // Card container (with padding)
  card: 'p-6',

  // Modal container
  modal: 'p-6 sm:p-8',

  // Section container (vertical spacing)
  section: 'py-12 sm:py-16',
} as const;

/**
 * Responsive Breakpoints
 * Tailwind default breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-Index Scale
 * Consistent layering system
 */
export const zIndex = {
  base: 'z-0',
  raised: 'z-10',
  dropdown: 'z-20',
  sticky: 'z-30',
  fixed: 'z-40',
  modalBackdrop: 'z-50',
  modal: 'z-50',
  popover: 'z-60',
  tooltip: 'z-70',
  notification: 'z-80',
  max: 'z-[9999]',
} as const;

/**
 * Component Spacing Presets
 * Standard spacing for common UI patterns
 */
export const componentSpacing = {
  // Button padding
  buttonSm: 'px-3 py-2',      // Small: 12px x 8px
  buttonMd: 'px-6 py-3',      // Medium: 24px x 12px
  buttonLg: 'px-8 py-4',      // Large: 32px x 16px

  // Input padding
  input: 'px-3 py-2',         // 12px x 8px

  // Card padding
  cardSm: 'p-4',              // 16px
  cardMd: 'p-6',              // 24px
  cardLg: 'p-8',              // 32px

  // Modal padding
  modal: 'p-6',               // 24px

  // Table cell padding
  tableCell: 'px-6 py-4',     // 24px x 16px

  // List item padding
  listItem: 'px-4 py-3',      // 16px x 12px

  // Section spacing
  sectionSm: 'py-8',          // 32px
  sectionMd: 'py-12',         // 48px
  sectionLg: 'py-16',         // 64px
  sectionXl: 'py-24',         // 96px
} as const;

/**
 * RTL/LTR Logical Spacing
 * For multi-language support (Hebrew RTL + English LTR)
 */
export const logicalSpacing = {
  // Padding inline (horizontal)
  ps2: 'ps-2',  // padding-inline-start
  ps4: 'ps-4',
  ps6: 'ps-6',
  ps8: 'ps-8',

  pe2: 'pe-2',  // padding-inline-end
  pe4: 'pe-4',
  pe6: 'pe-6',
  pe8: 'pe-8',

  // Margin inline (horizontal)
  ms2: 'ms-2',  // margin-inline-start
  ms4: 'ms-4',
  ms6: 'ms-6',
  ms8: 'ms-8',

  me2: 'me-2',  // margin-inline-end
  me4: 'me-4',
  me6: 'me-6',
  me8: 'me-8',

  // Auto margins
  msAuto: 'ms-auto',
  meAuto: 'me-auto',
} as const;

/**
 * Spacing Utility Functions
 */

/**
 * Validate if spacing value follows 8pt grid
 * @param value - Spacing value in pixels
 * @returns boolean
 */
export function isValid8ptGrid(value: number): boolean {
  return value % 4 === 0;
}

/**
 * Get nearest valid 8pt grid value
 * @param value - Input value in pixels
 * @returns Nearest valid 8pt grid value
 */
export function getNearestValid8ptValue(value: number): number {
  return Math.round(value / 4) * 4;
}

/**
 * Convert spacing token to rem value
 * @param spacingKey - Key from SPACING object
 * @returns rem value as string
 */
export function getSpacingValue(spacingKey: keyof typeof SPACING): string {
  return SPACING[spacingKey];
}

/**
 * Create inline spacing style
 * @param spacing - Spacing value in pixels (must be 8pt grid aligned)
 * @returns CSS style object
 */
export function createSpacingStyle(spacing: number): React.CSSProperties {
  if (!isValid8ptGrid(spacing)) {
    console.warn(`Warning: ${spacing}px is not aligned to 8pt grid. Using nearest valid value.`);
    spacing = getNearestValid8ptValue(spacing);
  }
  return {
    padding: `${spacing}px`,
  };
}

/**
 * Stack Layouts - Vertical spacing between children
 */
export const stackLayouts = {
  stackTight: 'flex flex-col gap-2',    // 8px gap
  stackNormal: 'flex flex-col gap-4',   // 16px gap
  stackRelaxed: 'flex flex-col gap-6',  // 24px gap
  stackLoose: 'flex flex-col gap-8',    // 32px gap
} as const;

/**
 * Grid Layouts - Common grid patterns
 */
export const gridLayouts = {
  // Responsive grid - 1 col mobile, 2 cols tablet, 3 cols desktop
  grid3Col: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',

  // Responsive grid - 1 col mobile, 2 cols desktop
  grid2Col: 'grid grid-cols-1 md:grid-cols-2 gap-6',

  // Fixed 2 column grid
  grid2ColFixed: 'grid grid-cols-2 gap-6',

  // Fixed 3 column grid
  grid3ColFixed: 'grid grid-cols-3 gap-6',

  // Fixed 4 column grid
  grid4ColFixed: 'grid grid-cols-4 gap-6',

  // Auto-fit grid (responsive without breakpoints)
  gridAutoFit: 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6',
} as const;

/**
 * Flex Layouts - Common flex patterns
 */
export const flexLayouts = {
  // Horizontal flex with items centered
  flexCenter: 'flex items-center justify-center',

  // Horizontal flex with items at start
  flexStart: 'flex items-center justify-start',

  // Horizontal flex with items at end
  flexEnd: 'flex items-center justify-end',

  // Horizontal flex with space between
  flexBetween: 'flex items-center justify-between',

  // Horizontal flex with gap
  flexRowGap2: 'flex items-center gap-2',
  flexRowGap4: 'flex items-center gap-4',
  flexRowGap6: 'flex items-center gap-6',

  // Vertical flex
  flexCol: 'flex flex-col',
  flexColGap2: 'flex flex-col gap-2',
  flexColGap4: 'flex flex-col gap-4',
  flexColGap6: 'flex flex-col gap-6',
} as const;

/**
 * Best Practices for Spacing
 */
export const spacingBestPractices = {
  // Component internal padding
  componentPadding: '16px or 24px (p-4 or p-6)',

  // Element spacing within components
  elementSpacing: '8px or 12px (gap-2 or gap-3)',

  // Section spacing
  sectionSpacing: '32px, 48px, or 64px (py-8, py-12, or py-16)',

  // Form field spacing
  formFieldSpacing: '16px (gap-4 or space-y-4)',

  // Button spacing
  buttonSpacing: '8px between buttons (gap-2)',

  // Card spacing
  cardSpacing: '24px internal padding (p-6)',
} as const;

/**
 * Export all spacing utilities as a single object
 */
export const spacing = {
  scale: SPACING,
  padding,
  margin,
  gap,
  spaceBetween,
  containers,
  containerWidths,
  breakpoints,
  zIndex,
  components: componentSpacing,
  logical: logicalSpacing,
  stack: stackLayouts,
  grid: gridLayouts,
  flex: flexLayouts,
  bestPractices: spacingBestPractices,
  utils: {
    isValid8ptGrid,
    getNearestValid8ptValue,
    getSpacingValue,
    createSpacingStyle,
  },
} as const;

export default spacing;
