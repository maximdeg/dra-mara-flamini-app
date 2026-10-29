import { describe, expect, it } from "vitest";
import { tomorrowInArgentina } from "./argentina";

describe("tomorrowInArgentina", () => {
  it("is the next Argentine calendar day at the 08:00 ART cron run (11:00 UTC)", () => {
    expect(tomorrowInArgentina(new Date("2026-11-02T11:00:00Z"))).toBe(
      "2026-11-03",
    );
  });

  it("follows the Argentine date, not UTC, in the hours after UTC midnight", () => {
    // 01:30 UTC on the 3rd is still 22:30 on the 2nd in Argentina.
    expect(tomorrowInArgentina(new Date("2026-11-03T01:30:00Z"))).toBe(
      "2026-11-03",
    );
  });

  it("rolls over months and years", () => {
    expect(tomorrowInArgentina(new Date("2026-11-30T11:00:00Z"))).toBe(
      "2026-12-01",
    );
    expect(tomorrowInArgentina(new Date("2026-12-31T11:00:00Z"))).toBe(
      "2027-01-01",
    );
  });
});
