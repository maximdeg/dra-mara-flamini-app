import { describe, expect, it } from "vitest";
import {
  addInsurance,
  coverageOptionsFor,
  editInsurance,
  isCoverageValidForVisitType,
  removeInsurance,
  type HealthInsurance,
} from "./coverage";

const insurances: HealthInsurance[] = [
  { name: "OSDE", price: 0, notes: "" },
  { name: "Galeno", price: 0, notes: "" },
];

describe("coverageOptionsFor", () => {
  it("offers the Particular Self-Pay variant first, then the insurers, for a Consultation", () => {
    const options = coverageOptionsFor("Consultation", insurances);

    expect(options.map((o) => o.label)).toEqual([
      "Particular",
      "OSDE",
      "Galeno",
    ]);
    expect(options[0]?.coverage).toEqual({
      kind: "self-pay",
      variant: "Particular",
    });
  });

  it("offers the Practica Particular variant first, then the insurers, for a Practice", () => {
    const options = coverageOptionsFor("Practice", insurances);

    expect(options.map((o) => o.label)).toEqual([
      "Practica Particular",
      "OSDE",
      "Galeno",
    ]);
    expect(options[0]?.coverage).toEqual({
      kind: "self-pay",
      variant: "PracticaParticular",
    });
  });

  it("does not offer the other Visit Type's Self-Pay variant", () => {
    const consultationLabels = coverageOptionsFor(
      "Consultation",
      insurances,
    ).map((o) => o.label);
    expect(consultationLabels).not.toContain("Practica Particular");
  });

  it("always offers the Self-Pay variant even with no Health Insurance (Self-Pay is immutable, not in the list)", () => {
    const options = coverageOptionsFor("Consultation", []);
    expect(options.map((o) => o.label)).toEqual(["Particular"]);
    expect(options[0].coverage).toEqual({
      kind: "self-pay",
      variant: "Particular",
    });
  });

  it("carries each insurer's price and the Self-Pay full price for display", () => {
    const priced: HealthInsurance[] = [
      { name: "OSDE", price: 5000, notes: "" },
      { name: "Galeno", price: 0, notes: "" },
    ];
    const options = coverageOptionsFor("Consultation", priced, 30000);

    const priceByLabel = Object.fromEntries(
      options.map((o) => [o.label, o.price]),
    );
    expect(priceByLabel).toEqual({ Particular: 30000, OSDE: 5000, Galeno: 0 });
  });
});

describe("Health Insurance list transforms", () => {
  it("adds a new insurer", () => {
    const result = addInsurance(insurances, {
      name: "Swiss Medical",
      price: 12000,
      notes: "tope mensual",
    });
    expect(result.map((i) => i.name)).toEqual([
      "OSDE",
      "Galeno",
      "Swiss Medical",
    ]);
  });

  it("replaces an insurer added with an existing name (case-insensitive)", () => {
    const result = addInsurance(insurances, {
      name: "osde",
      price: 5000,
      notes: "actualizado",
    });
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.name.toLowerCase() === "osde")).toEqual({
      name: "osde",
      price: 5000,
      notes: "actualizado",
    });
  });

  it("removes an insurer by name", () => {
    expect(removeInsurance(insurances, "OSDE").map((i) => i.name)).toEqual([
      "Galeno",
    ]);
  });

  it("edits an insurer, including renaming it", () => {
    const result = editInsurance(insurances, "OSDE", {
      name: "OSDE 210",
      price: 9000,
      notes: "",
    });
    expect(result.map((i) => i.name)).toEqual(["Galeno", "OSDE 210"]);
    expect(result.find((i) => i.name === "OSDE")).toBeUndefined();
  });
});

describe("isCoverageValidForVisitType", () => {
  it("accepts the matching Self-Pay variant and rejects the other", () => {
    expect(
      isCoverageValidForVisitType(
        { kind: "self-pay", variant: "Particular" },
        "Consultation",
        insurances,
      ),
    ).toBe(true);
    expect(
      isCoverageValidForVisitType(
        { kind: "self-pay", variant: "PracticaParticular" },
        "Consultation",
        insurances,
      ),
    ).toBe(false);
  });

  it("accepts an accepted insurer and rejects an unknown one", () => {
    expect(
      isCoverageValidForVisitType(
        { kind: "health-insurance", name: "OSDE" },
        "Consultation",
        insurances,
      ),
    ).toBe(true);
    expect(
      isCoverageValidForVisitType(
        { kind: "health-insurance", name: "Unknown" },
        "Consultation",
        insurances,
      ),
    ).toBe(false);
  });
});
