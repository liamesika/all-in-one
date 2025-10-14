// apps/web/lib/animations.ts - EFFINITY Design System Animation Utilities
// Comprehensive animation system following 8pt grid and Effinity brand standards

/**
 * Animation Configuration
 * All timings follow the Effinity standard: 200-300ms for responsiveness
 */
export const ANIMATION_TIMING = {
  fast: '150ms',
  normal: '200ms',
  medium: '300ms',
  slow: '400ms',
} as const;

export const EASING = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

/**
 * Page Transition Animations
 * For smooth page-to-page navigation
 */
export const pageTransitions = {
  fadeIn: 'animate-fade-in',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  bounceIn: 'animate-bounce-in',
} as const;

/**
 * Hover Effect Classes
 * For interactive elements like cards and buttons
 */
export const hoverEffects = {
  // Lift effect - moves element up on hover
  lift: 'hover-lift',

  // Card interactive - enhanced hover for cards
  cardInteractive: 'card-interactive',

  // Card hover - premium card animation
  cardHover: 'card-hover',

  // Card hover effect - with blue glow
  cardHoverEffect: 'card-hover-effect',

  // Magnetic button - scales on hover
  buttonMagnetic: 'btn-magnetic',

  // Button animate - shine effect on hover
  buttonAnimate: 'btn-animate',

  // Button ripple - ripple effect on click
  buttonRipple: 'btn-ripple',

  // Button gradient - animated gradient background
  buttonGradient: 'btn-gradient',
} as const;

/**
 * Loading State Animations
 * For async operations and data fetching
 */
export const loadingStates = {
  // Spinner animations
  spinner: 'animate-spin',

  // Pulse animation - for loading placeholders
  pulse: 'animate-pulse',
  pulseSlow: 'animate-pulse-slow',

  // Shimmer loading effect
  shimmer: 'animate-shimmer',

  // Float animation - for floating elements
  float: 'animate-float',

  // Glow effect - for emphasis
  glow: 'animate-glow',
} as const;

/**
 * Micro-interactions
 * Subtle animations for better UX feedback
 */
export const microInteractions = {
  // Wiggle animation - for errors or attention
  wiggle: 'animate-wiggle',

  // Heartbeat - for favorites or likes
  heartbeat: 'animate-heartbeat',

  // Text shimmer - for premium text
  textShimmer: 'text-shimmer',

  // Text gradient - for branded text
  textGradient: 'text-gradient',

  // Typing animation - for dynamic text
  typing: 'animate-typing',
} as const;

/**
 * Success/Error Feedback Animations
 * For user feedback on actions
 */
export const feedbackAnimations = {
  success: {
    scale: 'animate-scale-in',
    bounce: 'animate-bounce-in',
  },
  error: {
    wiggle: 'animate-wiggle',
  },
  info: {
    slideUp: 'animate-slide-up',
    fadeIn: 'animate-fade-in',
  },
} as const;

/**
 * Staggered Animation Classes
 * For sequential element appearances
 */
export const staggeredAnimations = {
  delay1: 'animate-fade-in-1',
  delay2: 'animate-fade-in-2',
  delay3: 'animate-fade-in-3',
  delay4: 'animate-fade-in-4',
} as const;

/**
 * Visual Effects
 * Premium effects for enhanced UI
 */
export const visualEffects = {
  // Glass morphism effect
  glass: 'glass-effect',

  // Shadow effects
  shadowGlowBlue: 'shadow-glow-blue',
  shadowGlowBlueIntense: 'shadow-glow-blue-intense',

  // Focus ring effects
  focusRing: 'focus-ring',
  focusRingEnhanced: 'focus-ring-enhanced',
} as const;

/**
 * Scroll Animation Class
 * For elements that animate on scroll
 */
export const scrollAnimations = {
  fadeIn: 'scroll-fade-in',
  fadeInInView: 'scroll-fade-in in-view',
} as const;

/**
 * Animation Utility Functions
 */

/**
 * Apply staggered animations to children elements
 * @param startDelay - Starting delay in milliseconds (default: 100)
 * @param delayIncrement - Delay increment between elements (default: 100)
 */
export function getStaggeredStyle(index: number, startDelay = 100, delayIncrement = 100): React.CSSProperties {
  return {
    animationDelay: `${startDelay + (index * delayIncrement)}ms`,
  };
}

/**
 * Create custom animation inline style
 * @param name - Animation name
 * @param duration - Duration in milliseconds
 * @param easing - Easing function
 * @param delay - Delay in milliseconds
 */
export function createAnimationStyle(
  name: string,
  duration: number = 200,
  easing: string = EASING.default,
  delay: number = 0
): React.CSSProperties {
  return {
    animation: `${name} ${duration}ms ${easing} ${delay}ms both`,
  };
}

/**
 * Create transition inline style
 * @param property - CSS property to transition
 * @param duration - Duration in milliseconds
 * @param easing - Easing function
 */
export function createTransitionStyle(
  property: string = 'all',
  duration: number = 200,
  easing: string = EASING.default
): React.CSSProperties {
  return {
    transition: `${property} ${duration}ms ${easing}`,
  };
}

/**
 * Preset Animation Combinations
 * Common animation patterns used throughout the app
 */
export const presetAnimations = {
  // Card entrance animation
  cardEntrance: `${pageTransitions.fadeIn} ${hoverEffects.cardHover}`,

  // Button with ripple and lift
  buttonInteractive: `${hoverEffects.buttonRipple} ${hoverEffects.lift}`,

  // Modal entrance
  modalEntrance: pageTransitions.scaleIn,

  // Toast notification
  toastEntrance: pageTransitions.slideUp,

  // Loading skeleton
  loadingSkeleton: loadingStates.shimmer,

  // Success feedback
  successFeedback: feedbackAnimations.success.bounce,

  // Error feedback
  errorFeedback: feedbackAnimations.error.wiggle,
} as const;

/**
 * Responsive Animation Helpers
 * Disable heavy animations on mobile for performance
 */
export function getResponsiveAnimationClass(
  desktopClass: string,
  mobileClass?: string
): string {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return mobileClass || desktopClass;
  }
  return desktopClass;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Conditionally apply animation class based on user preferences
 */
export function safeAnimationClass(animationClass: string): string {
  return prefersReducedMotion() ? '' : animationClass;
}

/**
 * Animation Event Handlers
 * Utility functions for animation lifecycle
 */
export const animationHandlers = {
  /**
   * Execute callback after animation completes
   */
  onAnimationEnd: (element: HTMLElement, callback: () => void) => {
    const handler = () => {
      callback();
      element.removeEventListener('animationend', handler);
    };
    element.addEventListener('animationend', handler);
  },

  /**
   * Execute callback after transition completes
   */
  onTransitionEnd: (element: HTMLElement, callback: () => void) => {
    const handler = () => {
      callback();
      element.removeEventListener('transitionend', handler);
    };
    element.addEventListener('transitionend', handler);
  },
};

/**
 * Skeleton Loading Classes
 * For async data loading states
 */
export const skeletonClasses = {
  base: 'animate-shimmer bg-gray-200 rounded',
  text: 'h-4 animate-shimmer bg-gray-200 rounded',
  title: 'h-8 animate-shimmer bg-gray-200 rounded',
  avatar: 'h-12 w-12 rounded-full animate-shimmer bg-gray-200',
  card: 'h-32 animate-shimmer bg-gray-200 rounded-lg',
  button: 'h-11 w-24 animate-shimmer bg-gray-200 rounded-lg',
} as const;

/**
 * Loading State Component Props
 * For consistent loading implementations
 */
export interface LoadingProps {
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Animation Performance Optimization
 * Best practices for smooth animations
 */
export const animationBestPractices = {
  // Use transform and opacity for best performance
  performantProperties: ['transform', 'opacity'] as const,

  // Avoid animating these properties
  avoidAnimating: ['width', 'height', 'top', 'left'] as const,

  // Use will-change for complex animations
  willChange: 'will-change: transform, opacity;',

  // Force GPU acceleration
  gpuAcceleration: 'transform: translateZ(0);',
} as const;

/**
 * Export all animation utilities as a single object
 */
export const animations = {
  timing: ANIMATION_TIMING,
  easing: EASING,
  page: pageTransitions,
  hover: hoverEffects,
  loading: loadingStates,
  micro: microInteractions,
  feedback: feedbackAnimations,
  staggered: staggeredAnimations,
  effects: visualEffects,
  scroll: scrollAnimations,
  presets: presetAnimations,
  skeleton: skeletonClasses,
  utils: {
    getStaggeredStyle,
    createAnimationStyle,
    createTransitionStyle,
    getResponsiveAnimationClass,
    prefersReducedMotion,
    safeAnimationClass,
  },
  handlers: animationHandlers,
  performance: animationBestPractices,
} as const;

export default animations;
