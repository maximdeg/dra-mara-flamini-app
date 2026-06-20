import { describe, expect, it } from "vitest";
import type { Appointment } from "./appointment";
import type { AppointmentView } from "./appointment-listing";
import type { DerivedStatus } from "./status";
import { buildMonthCalendar, monthBounds } from "./calendar";

function view(
  date: string,
  status: DerivedStatus,
  id = `apt-${date}-${status}`,
): AppointmentView {
  const appointment = { id, date, time: "09:00" } as Appointment;
  return { appointment, status };
}

describe("monthBounds", () => {
  it("gives inclusive first/last ISO dates of the month", () => {
    expect(monthBounds(2026, 6)).toEqual({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(monthBounds(2026, 2)).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });
});

describe("buildMonthCalendar", () => {
  it("lays June 2026 (1st is a Monday) into whole Monday-start weeks", () => {
    const calendar = buildMonthCalendar(2026, 6, []);

    // June 1 2026 is a Monday, so the grid starts exactly on the 1st.
    expect(calendar.weeks[0][0].date).toBe("2026-06-01");
    expect(calendar.weeks[0][0].inMonth).toBe(true);
    expect(calendar.weeks.every((w) => w.length === 7)).toBe(true);
    // 30 days from a Monday spills to complete the final week into July.
    const last = calendar.weeks.at(-1)!.at(-1)!;
    expect(last.inMonth).toBe(false);
    expect(last.date.startsWith("2026-07")).toBe(true);
  });

  it("starts the grid on the Monday on/before the 1st when the 1st is mid-week", () => {
    // July 1 2026 is a Wednesday → grid starts Monday June 29.
    const calendar = buildMonthCalendar(2026, 7, []);
    expect(calendar.weeks[0][0].date).toBe("2026-06-29");
    expect(calendar.weeks[0][0].inMonth).toBe(false);
    expect(calendar.weeks[0][2].date).toBe("2026-07-01");
    expect(calendar.weeks[0][2].inMonth).toBe(true);
  });

  it("groups appointments onto their day with a count", () => {
    const calendar = buildMonthCalendar(2026, 6, [
      view("2026-06-22", "scheduled"),
      view("2026-06-22", "scheduled"),
      view("2026-06-23", "scheduled"),
    ]);

    const cells = calendar.weeks.flat();
    expect(cells.find((c) => c.date === "2026-06-22")?.count).toBe(2);
    expect(cells.find((c) => c.date === "2026-06-23")?.count).toBe(1);
    expect(cells.find((c) => c.date === "2026-06-24")?.count).toBe(0);
  });

  it("reflects the derived Status carried on each view", () => {
    const calendar = buildMonthCalendar(2026, 6, [
      view("2026-06-10", "completed"),
      view("2026-06-25", "scheduled"),
    ]);

    const cells = calendar.weeks.flat();
    expect(cells.find((c) => c.date === "2026-06-10")?.views[0].status).toBe(
      "completed",
    );
    expect(cells.find((c) => c.date === "2026-06-25")?.views[0].status).toBe(
      "scheduled",
    );
  });
});
