import { describe, expect, it } from "vitest";
import {
  BOOKING_WINDOW_DAYS,
  availableTimesFor,
  bookingWindow,
  classifyBookingDateTime,
  type AvailabilityDependencies,
} from "./availability";
import type { WorkSchedule } from "./work-schedule";

// A schedule where every weekday is worked 09:00–10:00 — handy for isolating
// the calendar exclusions from the slot math.
const everyDayNineToTen: WorkSchedule = (
  [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const
).map((weekday) => ({
  weekday,
  isWorkingDay: true,
  ranges: [{ start: "09:00", end: "10:00" }],
}));

function deps(
  overrides: Partial<AvailabilityDependencies> = {},
): AvailabilityDependencies {
  return {
    workSchedule: everyDayNineToTen,
    unavailableDays: [],
    scheduledTimesOn: () => [],
    ...overrides,
  };
}

describe("availableTimesFor", () => {
  it("expands a worked range into 20-minute Time Slots (end exclusive)", async () => {
    // 2026-06-22 is a Monday.
    expect(await availableTimesFor("2026-06-22", "FirstVisit", deps())).toEqual([
      "09:00",
      "09:20",
      "09:40",
    ]);
  });

  it("returns no slots on a weekend", async () => {
    // 2026-06-20 is a Saturday.
    expect(await availableTimesFor("2026-06-20", "FirstVisit", deps())).toEqual([]);
  });

  it("returns no slots on a fixed holiday (Christmas)", async () => {
    expect(await availableTimesFor("2026-12-25", "FirstVisit", deps())).toEqual([]);
  });

  it("returns no slots on an Unavailable Day", async () => {
    expect(
      await availableTimesFor("2026-06-22", "FirstVisit", deps({ unavailableDays: ["2026-06-22"] })),
    ).toEqual([]);
  });

  it("returns no slots on a non-working weekday", async () => {
    const mondayOff: WorkSchedule = everyDayNineToTen.map((d) =>
      d.weekday === "monday" ? { ...d, isWorkingDay: false } : d,
    );
    expect(
      await availableTimesFor("2026-06-22", "FirstVisit", deps({ workSchedule: mondayOff })),
    ).toEqual([]);
  });

  it("removes times already taken by Scheduled Appointments", async () => {
    expect(
      await availableTimesFor(
        "2026-06-22", "FirstVisit",
        deps({ scheduledTimesOn: () => ["09:20"] }),
      ),
    ).toEqual(["09:00", "09:40"]);
  });
});

describe("bookingWindow", () => {
  const now = () => new Date("2026-06-19T08:00:00"); // a Friday

  it("opens tomorrow and never offers the same day", async () => {
    const days = await bookingWindow("FirstVisit", deps({ now }));
    expect(days).not.toContain("2026-06-19"); // today
    expect(days.every((d) => d > "2026-06-19")).toBe(true);
  });

  it("excludes weekends, and the earliest open day is the following Monday", async () => {
    const days = await bookingWindow("FirstVisit", deps({ now }));
    // Sat 20th and Sun 21st are weekends; Mon 22nd is the first bookable day.
    expect(days).not.toContain("2026-06-20");
    expect(days).not.toContain("2026-06-21");
    expect(days[0]).toBe("2026-06-22");
  });

  it("stays within 30 days ahead", async () => {
    const days = await bookingWindow("FirstVisit", deps({ now }));
    expect(days.every((d) => d <= "2026-07-19")).toBe(true);
    expect(BOOKING_WINDOW_DAYS).toBe(30);
  });

  it("excludes days with no remaining Time Slots (fully booked)", async () => {
    // Monday the 22nd has only 09:00/09:20/09:40; book them all.
    const days = await bookingWindow("FirstVisit", 
      deps({
        now,
        scheduledTimesOn: (date) =>
          date === "2026-06-22" ? ["09:00", "09:20", "09:40"] : [],
      }),
    );
    expect(days).not.toContain("2026-06-22");
    expect(days).toContain("2026-06-23"); // Tuesday still open
  });
});

describe("classifyBookingDateTime", () => {
  const now = () => new Date("2026-06-19T08:00:00"); // a Friday

  it("returns 'ok' for a free slot on a bookable day", async () => {
    expect(
      await classifyBookingDateTime("2026-06-22", "09:20", "FirstVisit", deps({ now })),
    ).toBe("ok");
  });

  it("returns 'outside-window' for the same day (no same-day booking)", async () => {
    expect(
      await classifyBookingDateTime("2026-06-19", "09:20", "FirstVisit", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'outside-window' beyond 30 days ahead", async () => {
    expect(
      await classifyBookingDateTime("2026-08-01", "09:20", "FirstVisit", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'outside-window' on a weekend", async () => {
    expect(
      await classifyBookingDateTime("2026-06-20", "09:20", "FirstVisit", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'slot-taken' when the chosen time is already booked", async () => {
    expect(
      await classifyBookingDateTime(
        "2026-06-22",
        "09:20", "FirstVisit",
        deps({ now, scheduledTimesOn: () => ["09:20"] }),
      ),
    ).toBe("slot-taken");
  });
});

describe("Availability per Visit Kind", () => {
  // Mondays: consults in the morning, procedures in the afternoon. Every other
  // weekday (Tue–Fri) worked 09:00–10:00 for every kind.
  const split: WorkSchedule = everyDayNineToTen.map((day) =>
    day.weekday === "monday"
      ? {
          ...day,
          ranges: [
            { start: "09:00", end: "09:40", kinds: ["FirstVisit", "FollowUp"] },
            {
              start: "16:00",
              end: "16:40",
              kinds: ["Cryosurgery", "Electrocoagulation", "Biopsy"],
            },
          ],
        }
      : day,
  );
  const now = () => new Date("2026-06-19T12:00:00"); // a Friday

  it("offers a kind only the times of ranges that accept it", async () => {
    const monday = "2026-06-22";
    expect(
      await availableTimesFor(monday, "FollowUp", deps({ workSchedule: split })),
    ).toEqual(["09:00", "09:20"]);
    expect(
      await availableTimesFor(monday, "Biopsy", deps({ workSchedule: split })),
    ).toEqual(["16:00", "16:20"]);
  });

  it("leaves a day out of a kind's Booking Window when no range accepts it", async () => {
    const onlyConsultsOnMonday = split.map((day) =>
      day.weekday === "monday"
        ? { ...day, ranges: [day.ranges[0]] }
        : { ...day, isWorkingDay: false, ranges: [] },
    );

    expect(
      await bookingWindow(
        "FirstVisit",
        deps({ workSchedule: onlyConsultsOnMonday, now }),
      ),
    ).toContain("2026-06-22");
    expect(
      await bookingWindow(
        "Biopsy",
        deps({ workSchedule: onlyConsultsOnMonday, now }),
      ),
    ).toEqual([]);
  });

  it("refuses a time offered only to another kind", async () => {
    expect(
      await classifyBookingDateTime(
        "2026-06-22",
        "09:00",
        "Biopsy",
        deps({ workSchedule: split, now }),
      ),
    ).toBe("slot-taken");
  });

  it("treats a day closed to the kind as outside its Booking Window", async () => {
    const consultsOnly = split.map((day) =>
      day.weekday === "monday" ? { ...day, ranges: [day.ranges[0]] } : day,
    );
    expect(
      await classifyBookingDateTime(
        "2026-06-22",
        "16:00",
        "Biopsy",
        deps({ workSchedule: consultsOnly, now }),
      ),
    ).toBe("outside-window");
  });
});
