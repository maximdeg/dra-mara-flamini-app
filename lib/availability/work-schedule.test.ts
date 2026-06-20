import { describe, expect, it } from "vitest";
import {
  sanitizeWorkSchedule,
  WEEKDAYS_IN_ORDER,
} from "./work-schedule";

describe("sanitizeWorkSchedule", () => {
  it("produces one entry per weekday in Monday→Sunday order, all non-working for empty input", () => {
    const schedule = sanitizeWorkSchedule([]);
    expect(schedule.map((d) => d.weekday)).toEqual(WEEKDAYS_IN_ORDER);
    expect(schedule.every((d) => !d.isWorkingDay && d.ranges.length === 0)).toBe(
      true,
    );
  });

  it("keeps valid ranges on a working day", () => {
    const schedule = sanitizeWorkSchedule([
      {
        weekday: "monday",
        isWorkingDay: true,
        ranges: [{ start: "09:00", end: "13:00" }],
      },
    ]);
    const monday = schedule.find((d) => d.weekday === "monday")!;
    expect(monday.isWorkingDay).toBe(true);
    expect(monday.ranges).toEqual([{ start: "09:00", end: "13:00" }]);
  });

  it("drops invalid ranges and ranges where start does not precede end", () => {
    const schedule = sanitizeWorkSchedule([
      {
        weekday: "tuesday",
        isWorkingDay: true,
        ranges: [
          { start: "13:00", end: "09:00" }, // inverted
          { start: "25:00", end: "26:00" }, // out of bounds
          { start: "09:00", end: "11:00" }, // valid
        ],
      },
    ]);
    const tuesday = schedule.find((d) => d.weekday === "tuesday")!;
    expect(tuesday.ranges).toEqual([{ start: "09:00", end: "11:00" }]);
  });

  it("clears ranges for a non-working day", () => {
    const schedule = sanitizeWorkSchedule([
      {
        weekday: "wednesday",
        isWorkingDay: false,
        ranges: [{ start: "09:00", end: "13:00" }],
      },
    ]);
    const wednesday = schedule.find((d) => d.weekday === "wednesday")!;
    expect(wednesday.isWorkingDay).toBe(false);
    expect(wednesday.ranges).toEqual([]);
  });
});
