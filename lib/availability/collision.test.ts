import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import {
  collidingWithSchedule,
  fitsSchedule,
} from "./collision";
import {
  DEFAULT_WORK_SCHEDULE,
  type Weekday,
  type WorkdaySchedule,
  type WorkSchedule,
} from "./work-schedule";

const now = new Date("2026-06-19T12:00:00"); // a Friday

function appt(
  date: string,
  time: string,
  status: Appointment["status"] = "scheduled",
  id = `${date}-${time}`,
): Appointment {
  return { id, date, time, status } as Appointment;
}

function withWeekday(weekday: Weekday, patch: Partial<WorkdaySchedule>): WorkSchedule {
  return DEFAULT_WORK_SCHEDULE.map((d) =>
    d.weekday === weekday ? { ...d, ...patch } : d,
  );
}

// Monday 09:30 fits DEFAULT (Mon 09:00–13:00); Wednesday 14:20 fits (Wed 14:00–19:00).
const monday = appt("2026-06-22", "09:30");
const wednesday = appt("2026-06-24", "14:20");
const past = appt("2026-06-17", "09:30"); // derives Completed
const cancelled = appt("2026-06-23", "09:30", "cancelled");

describe("fitsSchedule", () => {
  it("is true when the weekday is worked and the time is within a range", () => {
    expect(fitsSchedule(monday, DEFAULT_WORK_SCHEDULE)).toBe(true);
  });

  it("is false when the weekday is not worked", () => {
    expect(
      fitsSchedule(monday, withWeekday("monday", { isWorkingDay: false, ranges: [] })),
    ).toBe(false);
  });

  it("is false when the time falls outside every range", () => {
    expect(
      fitsSchedule(wednesday, withWeekday("wednesday", { ranges: [{ start: "15:00", end: "19:00" }] })),
    ).toBe(false);
  });
});

describe("collidingWithSchedule", () => {
  const cast = [monday, wednesday, past, cancelled];

  it("finds no collisions when nothing is reduced", () => {
    expect(collidingWithSchedule(cast, DEFAULT_WORK_SCHEDULE, now)).toEqual([]);
  });

  it("flags the future Scheduled Appointment stranded by un-marking a weekday", () => {
    const collisions = collidingWithSchedule(
      cast,
      withWeekday("monday", { isWorkingDay: false, ranges: [] }),
      now,
    );
    expect(collisions.map((a) => a.id)).toEqual([monday.id]);
  });

  it("flags an Appointment whose time falls outside a narrowed range", () => {
    const collisions = collidingWithSchedule(
      cast,
      withWeekday("wednesday", { ranges: [{ start: "15:00", end: "19:00" }] }),
      now,
    );
    expect(collisions.map((a) => a.id)).toEqual([wednesday.id]);
  });

  it("never flags past (Completed) or Cancelled Appointments", () => {
    const allClosed: WorkSchedule = DEFAULT_WORK_SCHEDULE.map((d) => ({
      ...d,
      isWorkingDay: false,
      ranges: [],
    }));
    const collisions = collidingWithSchedule(cast, allClosed, now);
    expect(collisions.map((a) => a.id)).toEqual([monday.id, wednesday.id]);
  });
});
