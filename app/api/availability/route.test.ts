import { describe, expect, it, vi } from "vitest";
import type { AvailabilityDependencies } from "@/lib/availability/availability";
import { GET } from "./route";

// Every weekday worked 09:00–10:00, nothing booked, "today" a Friday.
vi.mock("@/lib/availability/get-availability-deps", () => ({
  getAvailabilityDeps: async (): Promise<AvailabilityDependencies> => ({
    workSchedule: (
      ["monday", "tuesday", "wednesday", "thursday", "friday"] as const
    ).map((weekday) => ({
      weekday,
      isWorkingDay: true,
      ranges: [{ start: "09:00", end: "10:00" }],
    })),
    unavailableDays: [],
    scheduledTimesOn: () => [],
    now: () => new Date("2026-06-19T12:00:00"),
  }),
}));

function get(query: string) {
  return GET(new Request(`http://localhost/api/availability${query}`));
}

describe("GET /api/availability", () => {
  it("refuses a request without a Visit Kind", async () => {
    const response = await get("");
    expect(response.status).toBe(400);
  });

  it("refuses an unknown Visit Kind", async () => {
    const response = await get("?kind=Consultation");
    expect(response.status).toBe(400);
  });

  it("returns the Booking Window for a Visit Kind", async () => {
    const response = await get("?kind=Biopsy");
    expect(response.status).toBe(200);
    const { days } = (await response.json()) as { days: string[] };
    expect(days[0]).toBe("2026-06-22");
  });
});
