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
    expect(await availableTimesFor("2026-06-22", deps())).toEqual([
      "09:00",
      "09:20",
      "09:40",
    ]);
  });

  it("returns no slots on a weekend", async () => {
    // 2026-06-20 is a Saturday.
    expect(await availableTimesFor("2026-06-20", deps())).toEqual([]);
  });

  it("returns no slots on a fixed holiday (Christmas)", async () => {
    expect(await availableTimesFor("2026-12-25", deps())).toEqual([]);
  });

  it("returns no slots on an Unavailable Day", async () => {
    expect(
      await availableTimesFor("2026-06-22", deps({ unavailableDays: ["2026-06-22"] })),
    ).toEqual([]);
  });

  it("returns no slots on a non-working weekday", async () => {
    const mondayOff: WorkSchedule = everyDayNineToTen.map((d) =>
      d.weekday === "monday" ? { ...d, isWorkingDay: false } : d,
    );
    expect(
      await availableTimesFor("2026-06-22", deps({ workSchedule: mondayOff })),
    ).toEqual([]);
  });

  it("removes times already taken by Scheduled Appointments", async () => {
    expect(
      await availableTimesFor(
        "2026-06-22",
        deps({ scheduledTimesOn: () => ["09:20"] }),
      ),
    ).toEqual(["09:00", "09:40"]);
  });
});

describe("bookingWindow", () => {
  const now = () => new Date("2026-06-19T08:00:00"); // a Friday

  it("opens tomorrow and never offers the same day", async () => {
    const days = await bookingWindow(deps({ now }));
    expect(days).not.toContain("2026-06-19"); // today
    expect(days.every((d) => d > "2026-06-19")).toBe(true);
  });

  it("excludes weekends, and the earliest open day is the following Monday", async () => {
    const days = await bookingWindow(deps({ now }));
    // Sat 20th and Sun 21st are weekends; Mon 22nd is the first bookable day.
    expect(days).not.toContain("2026-06-20");
    expect(days).not.toContain("2026-06-21");
    expect(days[0]).toBe("2026-06-22");
  });

  it("stays within 30 days ahead", async () => {
    const days = await bookingWindow(deps({ now }));
    expect(days.every((d) => d <= "2026-07-19")).toBe(true);
    expect(BOOKING_WINDOW_DAYS).toBe(30);
  });

  it("excludes days with no remaining Time Slots (fully booked)", async () => {
    // Monday the 22nd has only 09:00/09:20/09:40; book them all.
    const days = await bookingWindow(
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
      await classifyBookingDateTime("2026-06-22", "09:20", deps({ now })),
    ).toBe("ok");
  });

  it("returns 'outside-window' for the same day (no same-day booking)", async () => {
    expect(
      await classifyBookingDateTime("2026-06-19", "09:20", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'outside-window' beyond 30 days ahead", async () => {
    expect(
      await classifyBookingDateTime("2026-08-01", "09:20", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'outside-window' on a weekend", async () => {
    expect(
      await classifyBookingDateTime("2026-06-20", "09:20", deps({ now })),
    ).toBe("outside-window");
  });

  it("returns 'slot-taken' when the chosen time is already booked", async () => {
    expect(
      await classifyBookingDateTime(
        "2026-06-22",
        "09:20",
        deps({ now, scheduledTimesOn: () => ["09:20"] }),
      ),
    ).toBe("slot-taken");
  });
});
