import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Thailand timezone constant
export const THAILAND_TIMEZONE = 'Asia/Bangkok';

// Utility function to format date as YYYY-MM-DD in Thailand timezone
export function formatDateForDB(date: Date): string {
  return date.toLocaleDateString('en-CA', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Utility function to format date for display in Thailand timezone
export function formatDateForDisplay(date: Date, locale: string = 'th-TH'): string {
  return date.toLocaleDateString(locale, {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility function to get today's date in Thailand timezone
export function getTodayInThailand(): Date {
  const now = new Date();
  const thailandTime = new Date(now.toLocaleString("en-US", { timeZone: THAILAND_TIMEZONE }));
  return new Date(thailandTime.getFullYear(), thailandTime.getMonth(), thailandTime.getDate());
}

// Utility function to add days to a date in Thailand timezone
export function addDaysInThailand(date: Date, days: number): Date {
  const result = new Date(date);
  const thailandTime = new Date(result.toLocaleString("en-US", { timeZone: THAILAND_TIMEZONE }));
  thailandTime.setDate(thailandTime.getDate() + days);
  return new Date(thailandTime.getFullYear(), thailandTime.getMonth(), thailandTime.getDate());
}

// Get day of week (0-6) in Thailand timezone
// This is timezone-safe and works consistently across all environments
export function getDayOfWeekInThailand(date: Date): number {
  const dateString = formatDateForDB(date); // Get YYYY-MM-DD in Bangkok TZ
  const [year, month, day] = dateString.split('-').map(Number);
  const bangkokDate = new Date(year, month - 1, day);
  return bangkokDate.getDay();
}

// Get day of month in Thailand timezone
// This is timezone-safe and works consistently across all environments
export function getDayOfMonthInThailand(date: Date): number {
  const dateString = formatDateForDB(date); // Get YYYY-MM-DD in Bangkok TZ
  const [year, month, day] = dateString.split('-').map(Number);
  return day;
}

// Legacy functions (keep for backward compatibility but use timezone-safe versions above)
// Utility function to format date for input fields (YYYY-MM-DD) using local time
export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  return formatDateForDB(date);
}

// Utility function to create Date object from input string in local timezone
export function parseDateFromInput(dateString: string): Date {
  if (!dateString) return new Date();

  // Parse the date string and create a Date object in local timezone
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
