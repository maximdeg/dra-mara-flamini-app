import { describe, expect, it, vi } from "vitest";
import type { AvailabilityDependencies } from "@/lib/availability/availability";
import { GET } from "./route";

vi.mock("@/lib/availability/get-availability-deps", () => ({
  getAvailabilityDeps: async (): Promise<AvailabilityDependencies> => ({
    workSchedule: [
      {
        weekday: "monday",
        isWorkingDay: true,
        ranges: [{ start: "09:00", end: "10:00" }],
      },
    ],
    unavailableDays: [],
    scheduledIntervalsOn: () => [{ time: "09:20", durationMinutes: 20 }],
  }),
}));

function get(date: string, query: string) {
  return GET(
    new Request(`http://localhost/api/available-times/${date}${query}`),
    { params: Promise.resolve({ date }) },
  );
}

describe("GET /api/available-times/[date]", () => {
  it("refuses a request without a valid Visit Kind", async () => {
    expect((await get("2026-06-22", "")).status).toBe(400);
    expect((await get("2026-06-22", "?kind=nope")).status).toBe(400);
  });

  it("returns the free Time Slots on the date for a Visit Kind", async () => {
    const response = await get("2026-06-22", "?kind=FollowUp");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ times: ["09:00", "09:40"] });
  });
});
