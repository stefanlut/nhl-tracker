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
