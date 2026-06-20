import type { VisitType } from "../appointments/visit-type";

/**
 * Coverage & payment for an Appointment (CONTEXT.md).
 *
 * A Patient picks either an accepted Health Insurance, or the Self-Pay variant
 * for their Visit Type. Self-Pay is system-defined with two fixed variants —
 * one per Visit Type — and is NOT part of the Professional-editable insurer
 * list. The variant is modelled explicitly (rather than derived) so the server
 * can reject a coverage chosen for the wrong Visit Type.
 */
export type SelfPayVariant = "Particular" | "PracticaParticular";

export type Coverage =
  | { kind: "health-insurance"; name: string }
  | { kind: "self-pay"; variant: SelfPayVariant };

export interface HealthInsurance {
  name: string;
  /** Price in whole Argentine pesos. */
  price: number;
  /** Free-text notes for the Professional. */
  notes: string;
}

/**
 * Seeded accepted Health Insurance — real insurers only. The Self-Pay variants
 * are deliberately absent (they are system-defined, not insurers). This is the
 * fallback the Health Insurance seam serves until the Professional first saves
 * the list (slice 15).
 */
export const SEEDED_HEALTH_INSURANCES: HealthInsurance[] = [
  { name: "OSDE", price: 0, notes: "" },
  { name: "Swiss Medical", price: 0, notes: "" },
  { name: "Galeno", price: 0, notes: "" },
];

export const SELF_PAY_LABELS: Record<SelfPayVariant, string> = {
  Particular: "Particular",
  PracticaParticular: "Practica Particular",
};

/** The one Self-Pay variant that applies to a Visit Type. */
export function selfPayVariantFor(visitType: VisitType): SelfPayVariant {
  return visitType === "Consultation" ? "Particular" : "PracticaParticular";
}

export interface CoverageOption {
  /** Stable id for form submission. */
  value: string;
  /** Spanish UI label. */
  label: string;
  coverage: Coverage;
}

/**
 * The coverage options offered for a Visit Type: every accepted Health
 * Insurance, plus the single Self-Pay variant matching the Visit Type.
 */
export function coverageOptionsFor(
  visitType: VisitType,
  insurances: HealthInsurance[],
): CoverageOption[] {
  const insurerOptions: CoverageOption[] = insurances.map((insurance) => ({
    value: `health-insurance:${insurance.name}`,
    label: insurance.name,
    coverage: { kind: "health-insurance", name: insurance.name },
  }));

  const variant = selfPayVariantFor(visitType);
  return [
    ...insurerOptions,
    {
      value: `self-pay:${variant}`,
      label: SELF_PAY_LABELS[variant],
      coverage: { kind: "self-pay", variant },
    },
  ];
}

/**
 * A coverage is valid for a Visit Type when it is an accepted Health Insurance,
 * or the Self-Pay variant that matches the Visit Type. The other Visit Type's
 * Self-Pay variant, or an unknown insurer, is invalid.
 */
export function isCoverageValidForVisitType(
  coverage: Coverage,
  visitType: VisitType,
  insurances: HealthInsurance[],
): boolean {
  if (coverage.kind === "self-pay") {
    return coverage.variant === selfPayVariantFor(visitType);
  }
  return insurances.some((insurance) => insurance.name === coverage.name);
}

/** Spanish display label for a chosen coverage. */
export function coverageLabel(coverage: Coverage): string {
  return coverage.kind === "self-pay"
    ? SELF_PAY_LABELS[coverage.variant]
    : coverage.name;
}

/**
 * The Professional-managed Health Insurance list, as pure transforms (slice 15).
 * They operate only on the accepted-insurer list — never on the Self-Pay
 * variants, which are system-defined and live outside this list, so the
 * "Self-Pay cannot be renamed or removed" rule holds structurally.
 */

/** Add an insurer, replacing any existing one with the same name (case-insensitive). */
export function addInsurance(
  list: HealthInsurance[],
  insurance: HealthInsurance,
): HealthInsurance[] {
  const without = list.filter(
    (i) => i.name.toLowerCase() !== insurance.name.toLowerCase(),
  );
  return [...without, insurance];
}

/** Remove an insurer by name. */
export function removeInsurance(
  list: HealthInsurance[],
  name: string,
): HealthInsurance[] {
  return list.filter((i) => i.name !== name);
}

/** Replace the entry currently named `originalName` (supports renaming it). */
export function editInsurance(
  list: HealthInsurance[],
  originalName: string,
  insurance: HealthInsurance,
): HealthInsurance[] {
  return addInsurance(removeInsurance(list, originalName), insurance);
}
