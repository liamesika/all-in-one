/**
 * Calendar navigation utilities for arrow key support
 */

export interface CalendarNavigation {
  currentDate: Date;
  focusedDay: Date | null;
}

/**
 * Move focus to the previous day
 */
export function moveToPreviousDay(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  newDate.setDate(newDate.getDate() - 1);
  return newDate;
}

/**
 * Move focus to the next day
 */
export function moveToNextDay(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

/**
 * Move focus one week up (previous week, same day)
 */
export function moveToPreviousWeek(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  newDate.setDate(newDate.getDate() - 7);
  return newDate;
}

/**
 * Move focus one week down (next week, same day)
 */
export function moveToNextWeek(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  newDate.setDate(newDate.getDate() + 7);
  return newDate;
}

/**
 * Move to start of current week (Sunday)
 */
export function moveToWeekStart(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  const day = newDate.getDay();
  newDate.setDate(newDate.getDate() - day);
  return newDate;
}

/**
 * Move to end of current week (Saturday)
 */
export function moveToWeekEnd(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  const day = newDate.getDay();
  newDate.setDate(newDate.getDate() + (6 - day));
  return newDate;
}

/**
 * Move to previous month, preserving the day number if possible
 */
export function moveToPreviousMonth(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  const currentDay = newDate.getDate();

  // Set to first day of current month, then subtract one day to get last day of previous month
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() - 1);

  // Get last day of the new month
  const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  // Set to the same day number, or last day if that day doesn't exist in the new month
  newDate.setDate(Math.min(currentDay, lastDayOfMonth));

  return newDate;
}

/**
 * Move to next month, preserving the day number if possible
 */
export function moveToNextMonth(focusedDay: Date): Date {
  const newDate = new Date(focusedDay);
  const currentDay = newDate.getDate();

  newDate.setMonth(newDate.getMonth() + 1);

  // Get last day of the new month
  const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  // Set to the same day number, or last day if that day doesn't exist in the new month
  newDate.setDate(Math.min(currentDay, lastDayOfMonth));

  return newDate;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format date for event creation (ISO string at 9:00 AM)
 */
export function formatDateForEvent(date: Date, hour: number = 9): string {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  return newDate.toISOString().slice(0, 16);
}
