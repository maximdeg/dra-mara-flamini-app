import { describe, expect, it } from "vitest";
import { filterFromSearchParams } from "./appointment-filter-params";

describe("filterFromSearchParams", () => {
  it("reads every filter field", () => {
    expect(
      filterFromSearchParams({
        status: "cancelled",
        visitType: "Practice",
        from: "2026-11-01",
        to: "2026-11-30",
      }),
    ).toEqual({
      status: "cancelled",
      visitType: "Practice",
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });

  it("treats empty values as no limit", () => {
    expect(
      filterFromSearchParams({ status: "", visitType: "", from: "", to: "" }),
    ).toEqual({
      status: undefined,
      visitType: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it("drops unknown Status and Visit Type values", () => {
    const filter = filterFromSearchParams({
      status: "pending",
      visitType: "Surgery",
      from: "",
      to: "",
    });
    expect(filter.status).toBeUndefined();
    expect(filter.visitType).toBeUndefined();
  });

  it("takes the first value when a key repeats", () => {
    expect(
      filterFromSearchParams({ from: ["2026-11-02", "2026-12-01"] }).from,
    ).toBe("2026-11-02");
  });
});
