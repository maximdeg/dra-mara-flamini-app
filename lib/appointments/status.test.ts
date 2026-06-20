import { describe, expect, it } from "vitest";
import { statusOf } from "./status";

const now = new Date("2026-06-19T12:00:00"); // a Friday

describe("statusOf", () => {
  it("derives Completed for a Scheduled Appointment whose date has passed", () => {
    expect(statusOf({ status: "scheduled", date: "2026-06-18" }, now)).toBe(
      "completed",
    );
  });

  it("stays Scheduled for a future date", () => {
    expect(statusOf({ status: "scheduled", date: "2026-06-20" }, now)).toBe(
      "scheduled",
    );
  });

  it("stays Scheduled on the Appointment's own day (date has not passed)", () => {
    expect(statusOf({ status: "scheduled", date: "2026-06-19" }, now)).toBe(
      "scheduled",
    );
  });

  it("stays Cancelled regardless of date", () => {
    expect(statusOf({ status: "cancelled", date: "2026-06-18" }, now)).toBe(
      "cancelled",
    );
    expect(statusOf({ status: "cancelled", date: "2026-06-20" }, now)).toBe(
      "cancelled",
    );
  });
});
