import { describe, it, expect } from 'vitest';
import {
  moveToPreviousDay,
  moveToNextDay,
  moveToPreviousWeek,
  moveToNextWeek,
  moveToWeekStart,
  moveToWeekEnd,
  moveToPreviousMonth,
  moveToNextMonth,
  isSameDay,
  formatDateForEvent,
} from './calendarUtils';

describe('calendarUtils', () => {
  describe('moveToPreviousDay', () => {
    it('should move to previous day', () => {
      const date = new Date('2025-01-15');
      const result = moveToPreviousDay(date);
      expect(result.getDate()).toBe(14);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should handle month boundary', () => {
      const date = new Date('2025-02-01');
      const result = moveToPreviousDay(date);
      expect(result.getDate()).toBe(31);
      expect(result.getMonth()).toBe(0); // January
    });
  });

  describe('moveToNextDay', () => {
    it('should move to next day', () => {
      const date = new Date('2025-01-15');
      const result = moveToNextDay(date);
      expect(result.getDate()).toBe(16);
    });

    it('should handle month boundary', () => {
      const date = new Date('2025-01-31');
      const result = moveToNextDay(date);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe('moveToPreviousWeek', () => {
    it('should move to same day previous week', () => {
      const date = new Date('2025-01-15'); // Wednesday
      const result = moveToPreviousWeek(date);
      expect(result.getDate()).toBe(8);
      expect(result.getDay()).toBe(date.getDay()); // Same day of week
    });
  });

  describe('moveToNextWeek', () => {
    it('should move to same day next week', () => {
      const date = new Date('2025-01-15'); // Wednesday
      const result = moveToNextWeek(date);
      expect(result.getDate()).toBe(22);
      expect(result.getDay()).toBe(date.getDay());
    });
  });

  describe('moveToWeekStart', () => {
    it('should move to Sunday of current week', () => {
      const date = new Date('2025-01-15'); // Wednesday
      const result = moveToWeekStart(date);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(12);
    });

    it('should stay on Sunday if already Sunday', () => {
      const date = new Date('2025-01-12'); // Sunday
      const result = moveToWeekStart(date);
      expect(result.getDay()).toBe(0);
      expect(result.getDate()).toBe(12);
    });
  });

  describe('moveToWeekEnd', () => {
    it('should move to Saturday of current week', () => {
      const date = new Date('2025-01-15'); // Wednesday
      const result = moveToWeekEnd(date);
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getDate()).toBe(18);
    });
  });

  describe('moveToPreviousMonth', () => {
    it('should preserve day number when valid', () => {
      const date = new Date('2025-03-15');
      const result = moveToPreviousMonth(date);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(15);
    });

    it('should adjust to last day when day does not exist', () => {
      const date = new Date('2025-03-31'); // March 31
      const result = moveToPreviousMonth(date);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28); // Feb 2025 has 28 days
    });
  });

  describe('moveToNextMonth', () => {
    it('should preserve day number when valid', () => {
      const date = new Date('2025-01-15');
      const result = moveToNextMonth(date);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(15);
    });

    it('should adjust to last day when day does not exist', () => {
      const date = new Date('2025-01-31');
      const result = moveToNextMonth(date);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28); // Feb 2025 has 28 days
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-15T15:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for null dates', () => {
      expect(isSameDay(null, new Date())).toBe(false);
      expect(isSameDay(new Date(), null)).toBe(false);
      expect(isSameDay(null, null)).toBe(false);
    });
  });

  describe('formatDateForEvent', () => {
    it('should format date with 9:00 AM default', () => {
      const date = new Date('2025-01-15');
      const result = formatDateForEvent(date);
      expect(result).toBe('2025-01-15T09:00');
    });

    it('should format date with custom hour', () => {
      const date = new Date('2025-01-15');
      const result = formatDateForEvent(date, 14);
      expect(result).toBe('2025-01-15T14:00');
    });
  });
});
