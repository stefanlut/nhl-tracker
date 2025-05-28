import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import * as weeklyPage from '../page';

describe('Date Utilities', () => {
  describe('getWeekDates', () => {
    let originalDate: DateConstructor;
    
    beforeAll(() => {
      // Store original Date
      originalDate = Date;
    });

    afterAll(() => {
      // Restore original Date
      global.Date = originalDate;
    });

    it('returns correct Monday date for a Wednesday', () => {
      // Mock date to be Wednesday, January 3, 2024
      const mockDate = new Date(2024, 0, 3);
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;

      const { monday } = weeklyPage.getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return Monday Jan 1, 2024
    });

    it('returns correct Monday date for a Sunday', () => {
      // Mock date to be Sunday, January 7, 2024
      const mockDate = new Date(2024, 0, 7);
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;

      const { monday } = weeklyPage.getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return Monday Jan 1, 2024
    });

    it('returns correct Monday date for a Monday', () => {
      // Mock date to be Monday, January 1, 2024
      const mockDate = new Date(2024, 0, 1);
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;

      const { monday } = weeklyPage.getWeekDates();
      expect(monday).toBe('2024-01-01'); // Should return same date
    });
  });
});
