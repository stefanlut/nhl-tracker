import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { getWeekDates } from '../../../utils/dates';

describe('Date Utilities', () => {
  describe('getWeekDates', () => {
    let originalDate: DateConstructor;
    
    beforeAll(() => {
      originalDate = Date;
    });

    afterAll(() => {
      global.Date = originalDate;
    });

    const createMockDate = (date: Date): DateConstructor => {
      const MockDate = class extends Date {
        constructor() {
          super();
          return date;
        }
      } as DateConstructor;

      MockDate.now = () => date.getTime();
      MockDate.parse = originalDate.parse;
      MockDate.UTC = originalDate.UTC;

      return MockDate;
    };

    it('returns correct Monday date for a Wednesday', () => {
      // Mock date to be Wednesday, January 3, 2024
      const mockDate = new Date(2024, 0, 3);
      global.Date = createMockDate(mockDate);

      const { monday } = getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return Monday Jan 1, 2024
    });

    it('returns correct Monday date for a Sunday', () => {
      // Mock date to be Sunday, January 7, 2024
      const mockDate = new Date(2024, 0, 7);
      global.Date = createMockDate(mockDate);

      const { monday } = getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return Monday Jan 1, 2024
    });

    it('returns correct Monday date for a Monday', () => {
      // Mock date to be Monday, January 1, 2024
      const mockDate = new Date(2024, 0, 1);
      global.Date = createMockDate(mockDate);

      const { monday } = getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return same date
    });
  });
});
