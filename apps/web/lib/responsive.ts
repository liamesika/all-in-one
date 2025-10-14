// apps/web/lib/responsive.ts - EFFINITY Mobile-First Responsive System
// Comprehensive mobile optimization utilities for native-app-like experience

/**
 * EFFINITY RESPONSIVE SYSTEM
 * ==========================
 * Mobile-first approach with touch-optimized sizing
 * Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
 * Minimum touch target: 44px (Apple/Google guidelines)
 * RTL/LTR support for multi-language (Hebrew + English)
 */

/**
 * Breakpoints - Mobile-first responsive system
 * Following industry standards and EFFINITY design requirements
 */
export const BREAKPOINTS = {
  mobile: 320,    // Minimum mobile width
  sm: 640,        // Small tablets
  md: 768,        // Tablets
  lg: 1024,       // Desktop
  xl: 1280,       // Large desktop
  '2xl': 1440,    // Wide screens
  max: 1920,      // Ultra-wide
} as const;

/**
 * Media Query Strings - For use in CSS-in-JS or inline styles
 */
export const MEDIA_QUERIES = {
  mobile: `(min-width: ${BREAKPOINTS.mobile}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,

  // Max-width queries (mobile-first approach)
  maxMobile: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  maxTablet: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  maxDesktop: `(max-width: ${BREAKPOINTS.xl - 1}px)`,

  // Orientation
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Touch support
  touch: '(pointer: coarse)',
  mouse: '(pointer: fine)',

  // Hover capability
  canHover: '(hover: hover)',
  noHover: '(hover: none)',

  // Dark mode
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',

  // Reduced motion (accessibility)
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

/**
 * Touch Target Sizes - Minimum 44px per Apple/Google guidelines
 * All interactive elements must meet these sizes on mobile
 */
export const TOUCH_TARGETS = {
  minimum: '44px',      // Absolute minimum (Apple/Google guidelines)
  comfortable: '48px',  // More comfortable for thumbs
  large: '56px',        // Large buttons/CTAs
  icon: '40px',         // Small icons (still above minimum)
} as const;

/**
 * Responsive Container Classes
 * Mobile-first padding that adapts to screen size
 */
export const responsiveContainers = {
  // Standard page container with responsive padding
  page: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',

  // Narrow content (forms, articles)
  narrow: 'max-w-screen-md mx-auto px-4 sm:px-6',

  // Wide content
  wide: 'max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8',

  // Full width with padding
  full: 'w-full px-4 sm:px-6 lg:px-8',

  // No padding (flush to edges)
  flush: 'w-full',
} as const;

/**
 * Responsive Typography Scale
 * Font sizes that adapt gracefully from mobile to desktop
 */
export const responsiveTypography = {
  // Heading 1 - Hero text
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-semibold',

  // Heading 2 - Page titles
  h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',

  // Heading 3 - Section headings
  h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',

  // Heading 4 - Subsection headings
  h4: 'text-base sm:text-lg font-semibold',

  // Body text (16px minimum on mobile)
  body: 'text-base leading-normal',

  // Small text (14px minimum)
  small: 'text-sm leading-normal',

  // Button text (always 14px, never smaller)
  button: 'text-sm font-semibold',
} as const;

/**
 * Responsive Spacing - Adapts to screen size
 * Follows 8pt grid at all breakpoints
 */
export const responsiveSpacing = {
  // Section spacing
  sectionY: 'py-8 sm:py-12 lg:py-16',
  sectionX: 'px-4 sm:px-6 lg:px-8',

  // Card spacing
  cardPadding: 'p-4 sm:p-6',

  // Element gaps
  gapTight: 'gap-2 sm:gap-3',
  gapNormal: 'gap-4 sm:gap-6',
  gapLoose: 'gap-6 sm:gap-8',

  // Modal/drawer spacing
  modalPadding: 'p-4 sm:p-6',
} as const;

/**
 * Mobile-Specific Layout Classes
 * Optimized for touch and thumb zones
 */
export const mobileLayouts = {
  // Stack layout (vertical on mobile, horizontal on desktop)
  stack: 'flex flex-col lg:flex-row gap-4',

  // Grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',

  // Grid layout (1 col mobile, 2 cols desktop)
  grid2: 'grid grid-cols-1 lg:grid-cols-2 gap-4',

  // Bottom fixed container (for mobile nav/actions)
  bottomFixed: 'fixed bottom-0 left-0 right-0 z-50',

  // Safe area insets (for iOS notch/home indicator)
  safeArea: 'pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]',
  safeBottom: 'pb-[env(safe-area-inset-bottom)]',
  safeTop: 'pt-[env(safe-area-inset-top)]',

  // Full height mobile view (accounting for mobile browsers)
  fullHeight: 'min-h-[100dvh]', // dvh = dynamic viewport height (accounts for mobile browser chrome)

  // Scrollable container (touch optimized)
  scrollContainer: 'overflow-auto -webkit-overflow-scrolling-touch',
} as const;

/**
 * Hide/Show Utilities - Responsive visibility
 * Show/hide elements at different breakpoints
 */
export const visibility = {
  // Show only on mobile
  mobileOnly: 'block lg:hidden',

  // Show only on tablet and up
  tabletUp: 'hidden md:block',

  // Show only on desktop
  desktopOnly: 'hidden lg:block',

  // Hide on mobile
  hideMobile: 'hidden lg:block',

  // Hide on desktop
  hideDesktop: 'block lg:hidden',
} as const;

/**
 * Touch Interaction Classes
 * Optimized for touch devices
 */
export const touchInteraction = {
  // Touch-friendly button
  button: 'min-h-[44px] px-6 py-3 touch-manipulation',

  // Touch-friendly icon button
  iconButton: 'min-w-[44px] min-h-[44px] p-2 touch-manipulation',

  // Touch-friendly input
  input: 'min-h-[44px] px-3 py-2 text-base', // 16px minimum to prevent iOS zoom

  // Touch-friendly checkbox/radio
  checkbox: 'w-5 h-5 touch-manipulation',

  // Prevent text selection during swipe
  noSelect: 'select-none',

  // Enable smooth scrolling
  smoothScroll: 'scroll-smooth',

  // Prevent pull-to-refresh (when needed)
  noPullToRefresh: 'overscroll-none',
} as const;

/**
 * Mobile Navigation Patterns
 */
export const mobileNavigation = {
  // Bottom tab bar
  bottomBar: 'fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around safe-bottom',

  // Top app bar
  topBar: 'sticky top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-40 safe-top',

  // Drawer menu
  drawer: 'fixed inset-0 z-50 bg-white transform transition-transform',
  drawerOverlay: 'fixed inset-0 bg-black bg-opacity-50 z-40',
} as const;

/**
 * Utility Functions
 */

/**
 * Check if current viewport is mobile
 * @returns boolean
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is tablet
 * @returns boolean
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 * @returns boolean
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Check if device supports touch
 * @returns boolean
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if device is iOS
 * @returns boolean
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 * @returns boolean
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Check if running as PWA
 * @returns boolean
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Get safe area insets (for iOS notch)
 * @returns object with top, right, bottom, left insets
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
}

/**
 * Get current breakpoint name
 * @returns Breakpoint name
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  if (typeof window === 'undefined') return 'mobile';

  const width = window.innerWidth;
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'mobile';
}

/**
 * Match media query and return boolean
 * @param query Media query string
 * @returns boolean
 */
export function matchMedia(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

/**
 * Get viewport dimensions
 * @returns object with width and height
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Custom React Hook - useMediaQuery
 * Usage: const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;

  const [matches, setMatches] = React.useState(() => {
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// React import for hooks
import React from 'react';

/**
 * Custom React Hook - useBreakpoint
 * Returns current breakpoint name
 */
export function useBreakpoint(): keyof typeof BREAKPOINTS {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('mobile');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Custom React Hook - useViewportSize
 * Returns current viewport dimensions
 */
export function useViewportSize() {
  const [size, setSize] = React.useState(getViewportDimensions());

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize(getViewportDimensions());
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

/**
 * Custom React Hook - useTouchDevice
 * Returns whether device supports touch
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
}

/**
 * Export all responsive utilities as a single object
 */
export const responsive = {
  breakpoints: BREAKPOINTS,
  mediaQueries: MEDIA_QUERIES,
  touchTargets: TOUCH_TARGETS,
  containers: responsiveContainers,
  typography: responsiveTypography,
  spacing: responsiveSpacing,
  layouts: mobileLayouts,
  visibility,
  touch: touchInteraction,
  navigation: mobileNavigation,
  utils: {
    isMobileViewport,
    isTabletViewport,
    isDesktopViewport,
    isTouchDevice,
    isIOS,
    isAndroid,
    isPWA,
    getSafeAreaInsets,
    getCurrentBreakpoint,
    matchMedia,
    getViewportDimensions,
  },
  hooks: {
    useMediaQuery,
    useBreakpoint,
    useViewportSize,
    useTouchDevice,
  },
} as const;

export default responsive;
