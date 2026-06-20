import { addDays } from "../availability/dates";
import type { AppointmentView } from "./appointment-listing";

/**
 * The month-calendar builder — the pure grouping behind the dashboard calendar
 * view (slice 11). It takes the AppointmentViews for a month (already fetched
 * and Status-derived by the listing seam) and arranges them into a Monday-start
 * month grid. It does no I/O and derives no Status itself: the views carry their
 * derived Status, so the grid simply reflects it.
 */
export interface CalendarDay {
  /** ISO date, "YYYY-MM-DD". */
  date: string;
  /** Whether this cell belongs to the target month (vs. a grid spill day). */
  inMonth: boolean;
  /** Appointments on this day, in the order the listing returned them. */
  views: AppointmentView[];
  count: number;
}

export interface MonthCalendar {
  year: number;
  /** 1–12. */
  month: number;
  /** Whole weeks, each length 7, Monday → Sunday. */
  weeks: CalendarDay[][];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Monday-based weekday index of an ISO date: Monday=0 … Sunday=6. */
function mondayIndex(iso: string): number {
  const day = new Date(`${iso}T00:00:00`).getDay(); // 0 Sun … 6 Sat
  return (day + 6) % 7;
}

/** Inclusive ISO date bounds of a month — the range to query the listing seam. */
export function monthBounds(
  year: number,
  month: number,
): { from: string; to: string } {
  const prefix = `${year}-${pad(month)}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  return { from: `${prefix}-01`, to: `${prefix}-${pad(daysInMonth)}` };
}

export function buildMonthCalendar(
  year: number,
  month: number,
  views: AppointmentView[],
): MonthCalendar {
  const { from: firstISO, to: lastISO } = monthBounds(year, month);
  const prefix = firstISO.slice(0, 7);

  const byDate = new Map<string, AppointmentView[]>();
  for (const view of views) {
    const list = byDate.get(view.appointment.date) ?? [];
    list.push(view);
    byDate.set(view.appointment.date, list);
  }

  const days: CalendarDay[] = [];
  let cursor = addDays(firstISO, -mondayIndex(firstISO));
  do {
    const dayViews = byDate.get(cursor) ?? [];
    days.push({
      date: cursor,
      inMonth: cursor.startsWith(prefix),
      views: dayViews,
      count: dayViews.length,
    });
    cursor = addDays(cursor, 1);
  } while (cursor <= lastISO || days.length % 7 !== 0);

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return { year, month, weeks };
}
