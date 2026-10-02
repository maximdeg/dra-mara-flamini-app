import { describe, expect, it } from "vitest";
import {
  parseVisitKind,
  VISIT_KIND_GROUPS,
  VISIT_KIND_LABELS,
  VISIT_KINDS,
  visitKindOf,
} from "./visit-kind";

describe("Visit Kind", () => {
  it("has one kind per bookable Visit Type and sub-type combination", () => {
    expect(VISIT_KINDS).toEqual([
      "FirstVisit",
      "FollowUp",
      "Cryosurgery",
      "Electrocoagulation",
      "Biopsy",
    ]);
  });

  it("labels each kind as '<Tipo de visita> · <sub-type>'", () => {
    expect(VISIT_KIND_LABELS).toEqual({
      FirstVisit: "Consulta · Primera vez",
      FollowUp: "Consulta · Seguimiento",
      Cryosurgery: "Práctica · Criocirugía",
      Electrocoagulation: "Práctica · Electrocoagulación",
      Biopsy: "Práctica · Biopsia",
    });
  });

  it("groups the kinds under Consulta and Práctica", () => {
    expect(VISIT_KIND_GROUPS).toEqual([
      { visitType: "Consultation", kinds: ["FirstVisit", "FollowUp"] },
      {
        visitType: "Practice",
        kinds: ["Cryosurgery", "Electrocoagulation", "Biopsy"],
      },
    ]);
  });
});

describe("visitKindOf", () => {
  it("is the Consult Type for a Consultation", () => {
    expect(
      visitKindOf({
        visitType: "Consultation",
        consultType: "FollowUp",
        practiceType: null,
      }),
    ).toBe("FollowUp");
  });

  it("is the Practice Type for a Practice", () => {
    expect(
      visitKindOf({
        visitType: "Practice",
        consultType: null,
        practiceType: "Biopsy",
      }),
    ).toBe("Biopsy");
  });

  it("ignores a sub-type that does not belong to the Visit Type", () => {
    expect(
      visitKindOf({
        visitType: "Practice",
        consultType: "FirstVisit",
        practiceType: "Cryosurgery",
      }),
    ).toBe("Cryosurgery");
  });

  it("is null while the sub-type is still missing", () => {
    expect(visitKindOf({ visitType: "Consultation" })).toBeNull();
    expect(
      visitKindOf({ visitType: "Practice", practiceType: null }),
    ).toBeNull();
  });
});

describe("parseVisitKind", () => {
  it("accepts a known kind", () => {
    expect(parseVisitKind("Biopsy")).toBe("Biopsy");
  });

  it("rejects anything else", () => {
    for (const value of [null, "", "biopsy", "Consultation", "Particular"]) {
      expect(parseVisitKind(value)).toBeNull();
    }
  });
});
