import { describe, expect, it } from "vitest";
import { formatDateAR, formatTimeRange } from "./format";

describe("formatDateAR", () => {
  it("formats a plain ISO date as DD/MM/YYYY", () => {
    expect(formatDateAR("2026-06-22")).toBe("22/06/2026");
  });

  it("keeps the day and month zero-padded", () => {
    expect(formatDateAR("2026-01-05")).toBe("05/01/2026");
  });

  it("does not shift the day across time zones", () => {
    // A naive `new Date("2026-01-01").toLocaleDateString()` can roll back to
    // 2025-12-31 in a negative-offset zone; the string formatter never does.
    expect(formatDateAR("2026-01-01")).toBe("01/01/2026");
    expect(formatDateAR("2026-12-31")).toBe("31/12/2026");
  });

  it("returns a value that isn't a well-formed date unchanged", () => {
    expect(formatDateAR("")).toBe("");
    expect(formatDateAR("mañana")).toBe("mañana");
    expect(formatDateAR("2026/06/22")).toBe("2026/06/22");
  });
});

describe("formatTimeRange", () => {
  it("shows a start and its end after the duration", () => {
    expect(formatTimeRange("09:20", 40)).toBe("09:20–10:00");
  });

  it("carries minutes into the next hour", () => {
    expect(formatTimeRange("12:50", 20)).toBe("12:50–13:10");
  });
});
