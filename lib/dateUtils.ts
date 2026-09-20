/**
 * Deterministic Date Utilities for GoalPredict AI
 * Uses UTC-based calculations so SSR output and client hydration output match 100% identically across any timezone.
 */

/**
 * Formats a Date object to YYYY-MM-DD using UTC date components
 */
export function formatDateToISO(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's standard UTC date string (YYYY-MM-DD)
 */
export function getTodayDateString(d?: Date): string {
  return formatDateToISO(d || new Date());
}

/**
 * Alias for getTodayDateString
 */
export function getLocalDateString(d?: Date): string {
  return getTodayDateString(d);
}

/**
 * Returns tomorrow's standard UTC date string (YYYY-MM-DD)
 */
export function getTomorrowDateString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return formatDateToISO(d);
}

/**
 * Returns date offset string relative to UTC today (e.g. -1 for yesterday, +2 for in 2 days)
 */
export function getDateOffsetString(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return formatDateToISO(d);
}

/**
 * Extracts normalized YYYY-MM-DD from any date/datetime string
 */
export function normalizeDateString(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0].trim();
  }
  return dateStr.trim();
}

/**
 * Checks if a match date matches "today" in UTC
 */
export function isMatchToday(matchDate: string): boolean {
  if (!matchDate) return false;
  const cleanDate = normalizeDateString(matchDate);
  const today = getTodayDateString();
  return cleanDate === today;
}

/**
 * Checks if a match date matches "tomorrow" in UTC
 */
export function isMatchTomorrow(matchDate: string): boolean {
  if (!matchDate) return false;
  const cleanDate = normalizeDateString(matchDate);
  const tomorrow = getTomorrowDateString();
  return cleanDate === tomorrow;
}

/**
 * Formats match date cleanly with friendly labels like "Today", "Tomorrow"
 */
export function formatMatchDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const cleanDate = normalizeDateString(dateStr);

  if (isMatchToday(cleanDate)) {
    return 'Today';
  }
  if (isMatchTomorrow(cleanDate)) {
    return 'Tomorrow';
  }

  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (!isNaN(month) && !isNaN(day) && month >= 0 && month < 12) {
      return `${months[month]} ${day}`;
    }
  }

  return cleanDate;
}
