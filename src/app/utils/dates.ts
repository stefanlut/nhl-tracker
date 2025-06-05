export function getWeekDates() {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  // Get Monday (even if it's in the past)
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);
  
  return {
    monday: monday.toISOString().split('T')[0]
  };
}

/**
 * Get today's date in YYYY-MM-DD format using local time
 * This prevents timezone issues where UTC date might be different from local date
 */
export function getTodayLocal(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
