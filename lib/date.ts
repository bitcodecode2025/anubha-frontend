/**
 * Timezone-safe date utilities for frontend
 * All dates are formatted in Asia/Kolkata (IST) timezone
 * regardless of server or browser timezone.
 */

import { formatInTimeZone } from "date-fns-tz";

export const BUSINESS_TIMEZONE = "Asia/Kolkata";

/**
 * Format a date in IST timezone
 * @param date - Date object or ISO string
 * @param pattern - date-fns format pattern (default: "dd MMM yyyy")
 * @returns Formatted date string in IST
 */
export function formatDateIST(
  date: Date | string,
  pattern: string = "dd MMM yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, BUSINESS_TIMEZONE, pattern);
}

/**
 * Format a time in IST timezone
 * @param date - Date object or ISO string
 * @param pattern - date-fns format pattern (default: "hh:mm a")
 * @returns Formatted time string in IST
 */
export function formatTimeIST(
  date: Date | string,
  pattern: string = "hh:mm a"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, BUSINESS_TIMEZONE, pattern);
}

/**
 * Format a date and time in IST timezone
 * @param date - Date object or ISO string
 * @param pattern - date-fns format pattern (default: "dd MMM yyyy, hh:mm a")
 * @returns Formatted date-time string in IST
 */
export function formatDateTimeIST(
  date: Date | string,
  pattern: string = "dd MMM yyyy, hh:mm a"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, BUSINESS_TIMEZONE, pattern);
}

/**
 * Get date string in YYYY-MM-DD format in IST timezone
 * Used for slot selection and API calls
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format (IST)
 */
export function getDateStringIST(date: Date): string {
  return formatInTimeZone(date, BUSINESS_TIMEZONE, "yyyy-MM-dd");
}
