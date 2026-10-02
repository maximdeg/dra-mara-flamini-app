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
  /**
   * Free-text notes for the Professional. Internal: never shown to Patients
   * and never returned by public endpoints (see toPublicHealthInsurance).
   */
  notes: string;
  /**
   * Coverage Instructions (UI: Indicaciones para el paciente) — Patient-facing,
   * unlike `notes`. Copied onto each Appointment booked with this insurer and
   * shown in its Confirmation and on the cita page. Sanitized on save.
   */
  instructions: string;
}

/**
 * An insurer as read back from storage. Documents saved before Coverage
 * Instructions existed have no `instructions`; they read as empty, so no
 * migration is needed.
 */
export function readStoredHealthInsurance(
  stored: Omit<HealthInsurance, "instructions"> & { instructions?: string },
): HealthInsurance {
  return { ...stored, instructions: stored.instructions ?? "" };
}

/** The longest Coverage Instructions the Professional may write. */
export const MAX_INSTRUCTIONS_LENGTH = 300;

/**
 * Turn raw admin input into Coverage Instructions: a single trimmed line of at
 * most MAX_INSTRUCTIONS_LENGTH characters. Instructions travel as a WhatsApp
 * template parameter, which the Cloud API rejects if it holds a newline, a tab
 * or 4+ consecutive spaces — so all whitespace collapses to single spaces.
 */
export function sanitizeInstructions(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_INSTRUCTIONS_LENGTH)
    .trimEnd();
}

/**
 * What a Patient-facing surface may know about an insurer: enough for the
 * booking picker (its name and price), never the internal Notas.
 */
export type PublicHealthInsurance = Pick<HealthInsurance, "name" | "price">;

/** Project an insurer onto its Patient-safe view for public endpoints. */
export function toPublicHealthInsurance(
  insurance: HealthInsurance,
): PublicHealthInsurance {
  return { name: insurance.name, price: insurance.price };
}

/**
 * Seeded accepted Health Insurance — real insurers only. The Self-Pay variants
 * are deliberately absent (they are system-defined, not insurers). This is the
 * fallback the Health Insurance seam serves until the Professional first saves
 * the list (slice 15).
 */
export const SEEDED_HEALTH_INSURANCES: HealthInsurance[] = [
  { name: "OSDE", price: 0, notes: "", instructions: "" },
  { name: "Swiss Medical", price: 0, notes: "", instructions: "" },
  { name: "Galeno", price: 0, notes: "", instructions: "" },
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
  /** Price in whole Argentine pesos for this option; 0 when none/unknown. */
  price: number;
  coverage: Coverage;
}

/**
 * The coverage options offered for a Visit Type: the single Self-Pay variant
 * matching the Visit Type first, then every accepted Health Insurance. Each
 * option carries its price (whole pesos) for display — the insurer's own price,
 * and `selfPayPrice` for the Self-Pay variant (0 when unknown).
 */
export function coverageOptionsFor(
  visitType: VisitType,
  insurances: PublicHealthInsurance[],
  selfPayPrice = 0,
): CoverageOption[] {
  const variant = selfPayVariantFor(visitType);
  const selfPayOption: CoverageOption = {
    value: `self-pay:${variant}`,
    label: SELF_PAY_LABELS[variant],
    price: selfPayPrice,
    coverage: { kind: "self-pay", variant },
  };

  const insurerOptions: CoverageOption[] = insurances.map((insurance) => ({
    value: `health-insurance:${insurance.name}`,
    label: insurance.name,
    price: insurance.price,
    coverage: { kind: "health-insurance", name: insurance.name },
  }));

  // Self-Pay always sits first, above the accepted Health Insurances.
  return [selfPayOption, ...insurerOptions];
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

/**
 * The Coverage Instructions for a chosen coverage, as Booking copies them onto
 * the Appointment: the Self-Pay variant's own, or the insurer's — empty when
 * it has none or is unknown.
 */
export function coverageInstructionsFor(
  coverage: Coverage,
  insurances: HealthInsurance[],
  selfPayInstructions: Record<SelfPayVariant, string>,
): string {
  if (coverage.kind === "self-pay") {
    return selfPayInstructions[coverage.variant];
  }
  return (
    insurances.find((insurance) => insurance.name === coverage.name)
      ?.instructions ?? ""
  );
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
