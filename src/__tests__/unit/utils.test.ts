import { calculateDaysBetween, isValidDateRange, formatDate, isWeekend, getBusinessDays } from '../../utils/date';

describe('Date Utils', () => {
  describe('calculateDaysBetween', () => {
    it('should calculate days between two dates correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      const result = calculateDaysBetween(startDate, endDate);
      expect(result).toBe(5);
    });

    it('should return 1 for same day', () => {
      const date = new Date('2024-01-01');
      const result = calculateDaysBetween(date, date);
      expect(result).toBe(1);
    });
  });

  describe('isValidDateRange', () => {
    it('should return true for valid date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      const result = isValidDateRange(startDate, endDate);
      expect(result).toBe(true);
    });

    it('should return false for invalid date range', () => {
      const startDate = new Date('2024-01-05');
      const endDate = new Date('2024-01-01');
      const result = isValidDateRange(startDate, endDate);
      expect(result).toBe(false);
    });

    it('should return false for past dates', () => {
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2020-01-05');
      const result = isValidDateRange(startDate, endDate);
      expect(result).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-01-06');
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-01-07');
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2024-01-08');
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('getBusinessDays', () => {
    it('should calculate business days correctly', () => {
      const startDate = new Date('2024-01-08');
      const endDate = new Date('2024-01-12');
      const result = getBusinessDays(startDate, endDate);
      expect(result).toBe(5);
    });

    it('should exclude weekends', () => {
      const startDate = new Date('2024-01-06');
      const endDate = new Date('2024-01-12');
      const result = getBusinessDays(startDate, endDate);
      expect(result).toBe(5);
    });
  });
});