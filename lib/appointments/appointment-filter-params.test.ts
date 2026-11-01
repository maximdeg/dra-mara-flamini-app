import { describe, expect, it } from "vitest";
import { filterFromSearchParams } from "./appointment-filter-params";

const TODAY = "2026-11-02";

describe("filterFromSearchParams", () => {
  it("opens on today, in every status and Visit Type, when the URL has no filter", () => {
    expect(filterFromSearchParams({}, TODAY)).toEqual({
      from: TODAY,
      to: TODAY,
      status: undefined,
      visitType: undefined,
    });
  });

  it("ignores unrelated params when deciding it is a fresh visit", () => {
    expect(filterFromSearchParams({ utm: "x" }, TODAY).from).toBe(TODAY);
  });

  it("honors a submitted filter even when only some keys are present", () => {
    expect(filterFromSearchParams({ status: "cancelled" }, TODAY)).toEqual({
      from: undefined,
      to: undefined,
      status: "cancelled",
      visitType: undefined,
    });
  });

  it("reads every filter field", () => {
    expect(
      filterFromSearchParams({
        status: "cancelled",
        visitType: "Practice",
        from: "2026-11-01",
        to: "2026-11-30",
      }, TODAY),
    ).toEqual({
      status: "cancelled",
      visitType: "Practice",
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });

  it("treats empty values as no limit", () => {
    expect(
      filterFromSearchParams({ status: "", visitType: "", from: "", to: "" }, TODAY),
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
    }, TODAY);
    expect(filter.status).toBeUndefined();
    expect(filter.visitType).toBeUndefined();
  });

  it("takes the first value when a key repeats", () => {
    expect(
      filterFromSearchParams({ from: ["2026-11-02", "2026-12-01"] }, TODAY).from,
    ).toBe("2026-11-02");
  });
});
