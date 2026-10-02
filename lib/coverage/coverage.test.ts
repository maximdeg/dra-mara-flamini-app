import { describe, expect, it } from "vitest";
import {
  addInsurance,
  coverageInstructionsFor,
  coverageOptionsFor,
  editInsurance,
  isCoverageValidForVisitType,
  removeInsurance,
  MAX_INSTRUCTIONS_LENGTH,
  readStoredHealthInsurance,
  sanitizeInstructions,
  toPublicHealthInsurance,
  type HealthInsurance,
} from "./coverage";

const insurances: HealthInsurance[] = [
  { name: "OSDE", price: 0, notes: "", instructions: "" },
  { name: "Galeno", price: 0, notes: "", instructions: "" },
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
      { name: "OSDE", price: 5000, notes: "", instructions: "" },
      { name: "Galeno", price: 0, notes: "", instructions: "" },
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
      instructions: "Traer orden autorizada",
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
      instructions: "",
    });
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.name.toLowerCase() === "osde")).toEqual({
      name: "osde",
      price: 5000,
      notes: "actualizado",
      instructions: "",
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
      instructions: "Coseguro $2000",
    });
    expect(result.map((i) => i.name)).toEqual(["Galeno", "OSDE 210"]);
    expect(result.find((i) => i.name === "OSDE")).toBeUndefined();
    expect(result.find((i) => i.name === "OSDE 210")?.instructions).toBe(
      "Coseguro $2000",
    );
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

describe("toPublicHealthInsurance", () => {
  // Instructions reach the Patient through their Appointment, copied at booking.
  it("exposes only the name and price, never the internal Notas", () => {
    expect(
      toPublicHealthInsurance({
        name: "OSDE",
        price: 5000,
        notes: "tope mensual — no mostrar",
        instructions: "Traer carnet",
      }),
    ).toEqual({ name: "OSDE", price: 5000 });
  });
});

describe("sanitizeInstructions", () => {
  it("flattens line breaks and tabs into a single line", () => {
    expect(sanitizeInstructions("Traer orden\nautorizada\r\n\tdel médico")).toBe(
      "Traer orden autorizada del médico",
    );
  });

  it("collapses whitespace runs (WhatsApp rejects 4+ consecutive spaces)", () => {
    expect(sanitizeInstructions("Coseguro     $2000")).toBe("Coseguro $2000");
  });

  it("trims and turns blank input into empty Instructions", () => {
    expect(sanitizeInstructions("  Traer carnet  ")).toBe("Traer carnet");
    expect(sanitizeInstructions(" \n ")).toBe("");
  });

  it(`caps Instructions at ${MAX_INSTRUCTIONS_LENGTH} characters`, () => {
    expect(MAX_INSTRUCTIONS_LENGTH).toBe(300);
    expect(sanitizeInstructions("a".repeat(400))).toHaveLength(300);
  });

  it("does not leave a trailing space where the cap cuts", () => {
    const input = `${"a".repeat(299)} b`;
    expect(sanitizeInstructions(input)).toBe("a".repeat(299));
  });
});

describe("readStoredHealthInsurance", () => {
  it("reads an insurer saved before Instructions existed as having none", () => {
    expect(
      readStoredHealthInsurance({ name: "OSDE", price: 1000, notes: "x" }),
    ).toEqual({ name: "OSDE", price: 1000, notes: "x", instructions: "" });
  });

  it("keeps stored Instructions", () => {
    expect(
      readStoredHealthInsurance({
        name: "OSDE",
        price: 1000,
        notes: "",
        instructions: "Traer carnet",
      }).instructions,
    ).toBe("Traer carnet");
  });
});

describe("coverageInstructionsFor", () => {
  const withInstructions: HealthInsurance[] = [
    { name: "OSDE", price: 0, notes: "interna", instructions: "Traer carnet" },
    { name: "Galeno", price: 0, notes: "", instructions: "" },
  ];

  const selfPay = {
    Particular: "Abonar en efectivo",
    PracticaParticular: "Traer estudios previos",
  };

  it("returns the chosen insurer's Instructions", () => {
    expect(
      coverageInstructionsFor(
        { kind: "health-insurance", name: "OSDE" },
        withInstructions,
        selfPay,
      ),
    ).toBe("Traer carnet");
  });

  it("is empty for an insurer without Instructions, or an unknown one", () => {
    expect(
      coverageInstructionsFor(
        { kind: "health-insurance", name: "Galeno" },
        withInstructions,
        selfPay,
      ),
    ).toBe("");
    expect(
      coverageInstructionsFor(
        { kind: "health-insurance", name: "IOMA" },
        withInstructions,
        selfPay,
      ),
    ).toBe("");
  });

  it("returns each Self-Pay variant's own Instructions", () => {
    expect(
      coverageInstructionsFor(
        { kind: "self-pay", variant: "Particular" },
        withInstructions,
        selfPay,
      ),
    ).toBe("Abonar en efectivo");
    expect(
      coverageInstructionsFor(
        { kind: "self-pay", variant: "PracticaParticular" },
        withInstructions,
        selfPay,
      ),
    ).toBe("Traer estudios previos");
  });
});
