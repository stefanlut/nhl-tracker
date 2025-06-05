import { getTodayLocal } from '@/app/utils/dates';

describe('getTodayLocal', () => {
  it('should return today\'s date in YYYY-MM-DD format using local time', () => {
    const result = getTodayLocal();
    
    // Should match the format YYYY-MM-DD
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Should match today's local date
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(result).toBe(expected);
  });
  
  it('should return consistent local date regardless of time of day', () => {
    const localDate = getTodayLocal();
    
    // Should always return the local date in correct format
    expect(localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Should be consistent with manual local date calculation
    const now = new Date();
    const expectedLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(localDate).toBe(expectedLocal);
  });
});
