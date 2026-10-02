import { describe, expect, it } from "vitest";
import { InMemoryVisitDurationsRepository } from "./in-memory-visit-durations-repository";
import {
  DEFAULT_VISIT_DURATIONS,
  DURATION_OPTIONS,
  sanitizeVisitDurations,
} from "./visit-durations";

describe("Visit Durations", () => {
  it("start at 20 minutes for every Visit Kind", () => {
    expect(DEFAULT_VISIT_DURATIONS).toEqual({
      FirstVisit: 20,
      FollowUp: 20,
      Cryosurgery: 20,
      Electrocoagulation: 20,
      Biopsy: 20,
    });
  });

  it("offer 10 to 120 minutes in steps of 10", () => {
    expect(DURATION_OPTIONS[0]).toBe(10);
    expect(DURATION_OPTIONS.at(-1)).toBe(120);
    expect(DURATION_OPTIONS).toHaveLength(12);
  });
});

describe("sanitizeVisitDurations", () => {
  it("keeps valid durations", () => {
    expect(
      sanitizeVisitDurations({ ...DEFAULT_VISIT_DURATIONS, Biopsy: 40 }),
    ).toEqual({ ...DEFAULT_VISIT_DURATIONS, Biopsy: 40 });
  });

  it("falls back to 20 for anything off the 10–120 / step-10 scale", () => {
    expect(
      sanitizeVisitDurations({
        FirstVisit: 25,
        FollowUp: 0,
        Cryosurgery: 130,
        Electrocoagulation: "40",
      }),
    ).toEqual({
      FirstVisit: 20,
      FollowUp: 20,
      Cryosurgery: 20,
      Electrocoagulation: 40,
      Biopsy: 20,
    });
  });

  it("reads missing settings as the defaults", () => {
    expect(sanitizeVisitDurations(undefined)).toEqual(DEFAULT_VISIT_DURATIONS);
  });
});

describe("VisitDurationsRepository (in-memory)", () => {
  it("returns the defaults until saved", async () => {
    expect(await new InMemoryVisitDurationsRepository().get()).toEqual(
      DEFAULT_VISIT_DURATIONS,
    );
  });

  it("returns saved durations", async () => {
    const repository = new InMemoryVisitDurationsRepository();
    const durations = { ...DEFAULT_VISIT_DURATIONS, FirstVisit: 30 };

    await repository.save(durations);

    expect(await repository.get()).toEqual(durations);
  });
});
