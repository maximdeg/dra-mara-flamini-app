import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MonthCalendar } from "@/lib/appointments/calendar";
import { MonthCalendarGrid } from "./calendar-grid";

// Render Next's Link as a plain anchor, passing through aria-current/className.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// A single week mixing the interesting states: a spill day (outside the month),
// a normal day, today, and the selected day with singular/plural counts.
const CALENDAR: MonthCalendar = {
  year: 2026,
  month: 6,
  weeks: [
    [
      { date: "2026-05-31", inMonth: false, views: [], count: 0 },
      { date: "2026-06-01", inMonth: true, views: [], count: 0 },
      { date: "2026-06-02", inMonth: true, views: [], count: 1 },
      { date: "2026-06-03", inMonth: true, views: [], count: 2 },
      { date: "2026-06-04", inMonth: true, views: [], count: 0 },
      { date: "2026-06-05", inMonth: true, views: [], count: 0 },
      { date: "2026-06-06", inMonth: true, views: [], count: 0 },
    ],
  ],
};

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("MonthCalendarGrid", () => {
  it("marks the selected day and pluralizes the count", () => {
    render(
      <MonthCalendarGrid
        calendar={CALENDAR}
        monthParam="2026-06"
        todayISO="2026-06-02"
        selectedDay="2026-06-03"
      />,
    );

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "date");
    expect(current).toHaveLength(1);

    expect(screen.getByText("1 turno")).toBeInTheDocument();
    expect(screen.getByText("2 turnos")).toBeInTheDocument();
  });

  it("does not link spill days from outside the month", () => {
    render(
      <MonthCalendarGrid
        calendar={CALENDAR}
        monthParam="2026-06"
        todayISO="2026-06-02"
      />,
    );
    // 6 in-month days are links; the May 31 spill day is not.
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it("matches the calendar grid structure", () => {
    const { container } = render(
      <MonthCalendarGrid
        calendar={CALENDAR}
        monthParam="2026-06"
        todayISO="2026-06-02"
        selectedDay="2026-06-03"
      />,
    );
    expect(withoutClasses(container.innerHTML)).toMatchSnapshot();
  });
});
