// apps/web/lib/gestures.ts - EFFINITY Touch Gesture System
// Comprehensive touch gesture detection for native-app-like mobile experience

/**
 * EFFINITY GESTURE SYSTEM
 * =======================
 * Touch gesture detection and handling utilities
 * - Swipe detection (left, right, up, down)
 * - Pull-to-refresh
 * - Long-press
 * - Pinch-to-zoom
 * - Touch feedback
 * - Haptic feedback (where supported)
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;
export type GestureCallback = () => void;

/**
 * Gesture Configuration
 */
export const GESTURE_CONFIG = {
  // Swipe thresholds
  swipeMinDistance: 50,      // Minimum swipe distance in pixels
  swipeMaxTime: 300,         // Maximum time for swipe in ms
  swipeVelocityThreshold: 0.3, // Minimum velocity for swipe

  // Long press
  longPressDuration: 500,    // Duration for long press in ms
  longPressMoveThreshold: 10, // Max movement allowed during long press

  // Pull to refresh
  pullToRefreshThreshold: 80, // Distance to trigger refresh
  pullToRefreshMaxDistance: 150, // Maximum pull distance

  // Pinch to zoom
  pinchThreshold: 10,        // Minimum distance change for pinch
  pinchMaxScale: 3,          // Maximum zoom scale
  pinchMinScale: 0.5,        // Minimum zoom scale

  // Touch feedback
  touchFeedbackDuration: 100, // Duration of touch feedback in ms
} as const;

/**
 * Touch Point Interface
 */
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Swipe Event Data
 */
export interface SwipeEventData {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  duration: number;
}

/**
 * Swipe Detection Hook
 * Usage: const swipeHandlers = useSwipeDetection({ onSwipeLeft: () => {...} });
 */
export function useSwipeDetection(callbacks: {
  onSwipeLeft?: GestureCallback;
  onSwipeRight?: GestureCallback;
  onSwipeUp?: GestureCallback;
  onSwipeDown?: GestureCallback;
  onSwipe?: (data: SwipeEventData) => void;
}) {
  const touchStart = React.useRef<TouchPoint | null>(null);
  const touchEnd = React.useRef<TouchPoint | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if swipe meets minimum requirements
    if (
      distance < GESTURE_CONFIG.swipeMinDistance ||
      deltaTime > GESTURE_CONFIG.swipeMaxTime ||
      velocity < GESTURE_CONFIG.swipeVelocityThreshold
    ) {
      return;
    }

    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let direction: SwipeDirection = null;

    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
      if (direction === 'left' && callbacks.onSwipeLeft) {
        callbacks.onSwipeLeft();
      } else if (direction === 'right' && callbacks.onSwipeRight) {
        callbacks.onSwipeRight();
      }
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
      if (direction === 'up' && callbacks.onSwipeUp) {
        callbacks.onSwipeUp();
      } else if (direction === 'down' && callbacks.onSwipeDown) {
        callbacks.onSwipeDown();
      }
    }

    // Call generic swipe callback
    if (callbacks.onSwipe && direction) {
      callbacks.onSwipe({
        direction,
        distance,
        velocity,
        duration: deltaTime,
      });
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Long Press Detection Hook
 * Usage: const longPressHandlers = useLongPress(() => {...});
 */
export function useLongPress(callback: GestureCallback, options?: {
  duration?: number;
  moveThreshold?: number;
}) {
  const duration = options?.duration || GESTURE_CONFIG.longPressDuration;
  const moveThreshold = options?.moveThreshold || GESTURE_CONFIG.longPressMoveThreshold;

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const startPoint = React.useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = React.useRef(false);

  const handleStart = (x: number, y: number) => {
    startPoint.current = { x, y };
    isLongPressRef.current = false;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      callback();
      triggerHapticFeedback('medium');
    }, duration);
  };

  const handleMove = (x: number, y: number) => {
    if (!startPoint.current) return;

    const deltaX = x - startPoint.current.x;
    const deltaY = y - startPoint.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too far
    if (distance > moveThreshold) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPoint.current = null;
    isLongPressRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };
}

/**
 * Pull to Refresh Hook
 * Usage: const pullToRefreshHandlers = usePullToRefresh(() => {...});
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startY = React.useRef(0);
  const isPulling = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger if at top of page
    if (window.scrollY > 0) return;

    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;

    // Only pull down (positive delta)
    if (delta > 0) {
      const distance = Math.min(delta, GESTURE_CONFIG.pullToRefreshMaxDistance);
      setPullDistance(distance);

      // Prevent default scroll if pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;

    isPulling.current = false;

    // Trigger refresh if pulled far enough
    if (pullDistance >= GESTURE_CONFIG.pullToRefreshThreshold) {
      setIsRefreshing(true);
      triggerHapticFeedback('light');

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Animate back to 0
      setPullDistance(0);
    }
  };

  return {
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Pinch to Zoom Hook
 * Usage: const pinchHandlers = usePinchZoom({ onZoom: (scale) => {...} });
 */
export function usePinchZoom(callbacks: {
  onZoom?: (scale: number) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}) {
  const initialDistance = React.useRef<number | null>(null);
  const currentScale = React.useRef(1);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      callbacks.onZoomStart?.();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current !== null) {
      e.preventDefault();

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;

      // Clamp scale
      const clampedScale = Math.min(
        Math.max(scale, GESTURE_CONFIG.pinchMinScale),
        GESTURE_CONFIG.pinchMaxScale
      );

      currentScale.current = clampedScale;
      callbacks.onZoom?.(clampedScale);
    }
  };

  const handleTouchEnd = () => {
    if (initialDistance.current !== null) {
      initialDistance.current = null;
      callbacks.onZoomEnd?.();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Haptic Feedback
 * Trigger device vibration (if supported)
 */
export function triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };

  navigator.vibrate(patterns[intensity]);
}

/**
 * Touch Feedback Visual Effect
 * Add ripple effect on touch
 */
export function createTouchRipple(
  element: HTMLElement,
  x: number,
  y: number,
  color = 'rgba(41, 121, 255, 0.3)' // EFFINITY blue
) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();

  const size = Math.max(rect.width, rect.height);
  const rippleX = x - rect.left - size / 2;
  const rippleY = y - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    pointer-events: none;
    transform: scale(0);
    opacity: 1;
    left: ${rippleX}px;
    top: ${rippleY}px;
    animation: ripple-effect 600ms ease-out;
  `;

  // Add ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Touch Feedback Hook
 * Add visual and haptic feedback to elements
 */
export function useTouchFeedback(options?: {
  haptic?: boolean;
  ripple?: boolean;
  rippleColor?: string;
}) {
  const elementRef = React.useRef<HTMLElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!elementRef.current) return;

    // Haptic feedback
    if (options?.haptic !== false) {
      triggerHapticFeedback('light');
    }

    // Ripple effect
    if (options?.ripple !== false) {
      const touch = e.touches[0];
      createTouchRipple(
        elementRef.current,
        touch.clientX,
        touch.clientY,
        options?.rippleColor
      );
    }
  };

  return {
    ref: elementRef,
    onTouchStart: handleTouchStart,
  };
}

/**
 * Prevent Default Behavior
 * Utility to prevent unwanted touch behaviors
 */
export function preventTouchBehaviors(element: HTMLElement, behaviors: {
  scrolling?: boolean;
  zooming?: boolean;
  selection?: boolean;
  contextMenu?: boolean;
}) {
  if (behaviors.scrolling) {
    element.style.touchAction = 'none';
  }

  if (behaviors.zooming) {
    element.style.touchAction = 'manipulation';
  }

  if (behaviors.selection) {
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
  }

  if (behaviors.contextMenu) {
    element.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

/**
 * Momentum Scrolling
 * Enable smooth momentum scrolling on iOS
 */
export function enableMomentumScrolling(element: HTMLElement) {
  element.style.webkitOverflowScrolling = 'touch';
  element.style.overflowY = 'auto';
}

/**
 * Disable Bounce Effect (iOS)
 * Prevent rubber-band scrolling effect
 */
export function disableBounceEffect(element: HTMLElement) {
  element.style.overscrollBehavior = 'none';
}

// React import for hooks
import React from 'react';

/**
 * Export all gesture utilities
 */
export const gestures = {
  config: GESTURE_CONFIG,
  hooks: {
    useSwipeDetection,
    useLongPress,
    usePullToRefresh,
    usePinchZoom,
    useTouchFeedback,
  },
  utils: {
    triggerHapticFeedback,
    createTouchRipple,
    preventTouchBehaviors,
    enableMomentumScrolling,
    disableBounceEffect,
  },
} as const;

export default gestures;
