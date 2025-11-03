import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  threshold?: number; // milliseconds
  moveTolerance?: number; // pixels
  onLongPress: () => void;
  onCancel?: () => void;
}

export function useLongPress({
  threshold = 500,
  moveTolerance = 10,
  onLongPress,
  onCancel,
}: UseLongPressOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = useRef(false);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startPos.current = null;
    isLongPressRef.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
      isLongPressRef.current = false;

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, threshold);
    },
    [threshold, onLongPress]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startPos.current.x);
      const deltaY = Math.abs(touch.clientY - startPos.current.y);

      if (deltaX > moveTolerance || deltaY > moveTolerance) {
        clear();
        onCancel?.();
      }
    },
    [moveTolerance, clear, onCancel]
  );

  const handleTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startPos.current = { x: e.clientX, y: e.clientY };
      isLongPressRef.current = false;

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, threshold);
    },
    [threshold, onLongPress]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!startPos.current) return;

      const deltaX = Math.abs(e.clientX - startPos.current.x);
      const deltaY = Math.abs(e.clientY - startPos.current.y);

      if (deltaX > moveTolerance || deltaY > moveTolerance) {
        clear();
        onCancel?.();
      }
    },
    [moveTolerance, clear, onCancel]
  );

  const handleMouseUp = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
}
