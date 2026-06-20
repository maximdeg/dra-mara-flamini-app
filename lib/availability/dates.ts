import type { Weekday } from "./work-schedule";

// Calendar helpers for Availability. Dates are ISO "YYYY-MM-DD" strings and are
// interpreted at local midnight, so weekday/holiday checks match the clinic's
// local calendar.

const WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whether a string is a real calendar date in ISO "YYYY-MM-DD" form. */
export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && toISODate(parsed) === value;
}

function parse(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function addDays(iso: string, days: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[parse(iso).getDay()];
}

export function isWeekend(iso: string): boolean {
  const weekday = weekdayOf(iso);
  return weekday === "saturday" || weekday === "sunday";
}

/** Fixed annual holidays that are never bookable: New Year and Christmas. */
export function isFixedHoliday(iso: string): boolean {
  const [, month, day] = iso.split("-").map(Number);
  return (month === 1 && day === 1) || (month === 12 && day === 25);
}
