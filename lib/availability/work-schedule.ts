/**
 * The Work Schedule — the Professional's recurring weekly availability: which
 * weekdays are worked and the time ranges within each working day (CONTEXT.md).
 *
 * Time Slots are derived from this (see availability.ts). For now the schedule
 * is seeded with a default; slice 13 lets the Professional edit it.
 */
export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/** A worked time range within a day, "HH:MM" 24-hour, end exclusive. */
export interface TimeRange {
  start: string;
  end: string;
}

export interface WorkdaySchedule {
  weekday: Weekday;
  isWorkingDay: boolean;
  ranges: TimeRange[];
}

/** The full weekly schedule: one entry per weekday. */
export type WorkSchedule = WorkdaySchedule[];

/** Weekdays in display order, Monday → Sunday. */
export const WEEKDAYS_IN_ORDER: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

function isValidTime(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }
  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/**
 * Coerce untrusted input (from the editing form) into a well-formed
 * WorkSchedule: exactly one entry per weekday in order, ranges kept only when
 * both ends are valid "HH:MM" and start precedes end, and ranges dropped for a
 * non-working day. This is the trust boundary for Work Schedule edits.
 */
export function sanitizeWorkSchedule(input: unknown): WorkSchedule {
  const days: unknown[] = Array.isArray(input) ? input : [];
  const entryFor = (weekday: Weekday): Record<string, unknown> =>
    (days.find(
      (d): d is Record<string, unknown> =>
        typeof d === "object" && d !== null && (d as { weekday?: unknown }).weekday === weekday,
    ) ?? {}) as Record<string, unknown>;

  return WEEKDAYS_IN_ORDER.map((weekday) => {
    const entry = entryFor(weekday);
    const isWorkingDay = Boolean(entry.isWorkingDay);
    const rawRanges = Array.isArray(entry.ranges) ? entry.ranges : [];
    const ranges: TimeRange[] = isWorkingDay
      ? rawRanges
          .filter(
            (r): r is TimeRange =>
              typeof r === "object" &&
              r !== null &&
              isValidTime((r as TimeRange).start) &&
              isValidTime((r as TimeRange).end) &&
              (r as TimeRange).start < (r as TimeRange).end,
          )
          .map((r) => ({ start: r.start, end: r.end }))
      : [];
    return { weekday, isWorkingDay, ranges };
  });
}

/**
 * Seeded default Work Schedule, carried over from the prototype's mock store.
 * Weekends are non-working. Replaced by Professional-managed data in slice 13.
 */
export const DEFAULT_WORK_SCHEDULE: WorkSchedule = [
  { weekday: "monday", isWorkingDay: true, ranges: [
    { start: "09:00", end: "13:00" },
    { start: "16:00", end: "19:00" },
  ] },
  { weekday: "tuesday", isWorkingDay: true, ranges: [
    { start: "09:00", end: "13:00" },
  ] },
  { weekday: "wednesday", isWorkingDay: true, ranges: [
    { start: "14:00", end: "19:00" },
  ] },
  { weekday: "thursday", isWorkingDay: true, ranges: [
    { start: "09:00", end: "13:00" },
  ] },
  { weekday: "friday", isWorkingDay: true, ranges: [
    { start: "09:00", end: "12:00" },
  ] },
  { weekday: "saturday", isWorkingDay: false, ranges: [] },
  { weekday: "sunday", isWorkingDay: false, ranges: [] },
];
