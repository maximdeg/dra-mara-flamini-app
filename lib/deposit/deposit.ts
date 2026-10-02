import type { ConsultType, VisitType } from "../appointments/visit-type";
import {
  sanitizeInstructions,
  type Coverage,
  type SelfPayVariant,
} from "../coverage/coverage";

/**
 * The Deposit (UI: _Seña_) — an upfront payment a Patient commits to for
 * Self-Pay Appointments only (CONTEXT.md). The platform captures only the
 * Patient's acknowledgment; the actual transfer happens off-platform.
 */

/** Coverage Instructions for each fixed Self-Pay variant. */
export type SelfPayInstructions = Record<SelfPayVariant, string>;

export const EMPTY_SELF_PAY_INSTRUCTIONS: SelfPayInstructions = {
  Particular: "",
  PracticaParticular: "",
};

/**
 * The Professional-editable Self-Pay settings: the pricing the Deposit is
 * computed from (whole Argentine pesos; editable from slice 15) and each
 * variant's Patient-facing Coverage Instructions.
 */
export interface SelfPayPricing {
  /** Full price of the Particular (Self-Pay Consultation) option. */
  consultationFullPrice: number;
  /**
   * Full price of the Practica Particular (Self-Pay Practice) option — this is
   * also the Deposit for a Self-Pay Practice.
   */
  practiceFullPrice: number;
  /** The separate, smaller Deposit for a Self-Pay First-Visit Consultation. */
  firstVisitConsultationDeposit: number;
  /**
   * Each variant's Coverage Instructions, copied onto an Appointment booked
   * with it — the Self-Pay counterpart of a Health Insurance's instructions.
   */
  instructions: SelfPayInstructions;
}

export const SEEDED_SELF_PAY_PRICING: SelfPayPricing = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
  instructions: EMPTY_SELF_PAY_INSTRUCTIONS,
};

/** A committed Deposit on an Appointment: the amount and the acknowledgment. */
export interface Deposit {
  amount: number;
  acknowledged: boolean;
}

export interface DepositContext {
  visitType: VisitType;
  consultType: ConsultType | null;
  coverage: Coverage;
}

/**
 * The Deposit amount a booking requires, or null if none applies. A Deposit
 * applies to Self-Pay only: every Self-Pay Practice (the option's full price),
 * and a Self-Pay First-Visit Consultation (the separate smaller amount). Never
 * for Follow-ups, and never when a Health Insurance covers the visit.
 */
export function depositAmountFor(
  context: DepositContext,
  pricing: SelfPayPricing,
): number | null {
  if (context.coverage.kind !== "self-pay") {
    return null;
  }
  if (context.visitType === "Practice") {
    return pricing.practiceFullPrice;
  }
  return context.consultType === "FirstVisit"
    ? pricing.firstVisitConsultationDeposit
    : null;
}

/** Format whole pesos for display, e.g. 35000 → "$35.000". */
export function formatPesos(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

/** Coerce one money field to a non-negative whole peso amount (invalid → 0). */
function toPesos(value: unknown): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Coerce untrusted Self-Pay settings (from the editing form, or a stored
 * document) into valid SelfPayPricing — the trust boundary for these edits. The
 * two Self-Pay variants themselves are fixed in code; only the three amounts
 * and each variant's Instructions are editable. Settings saved before
 * Instructions existed read as having none.
 */
export function sanitizeSelfPayPricing(input: unknown): SelfPayPricing {
  const raw = (input ?? {}) as Partial<Record<keyof SelfPayPricing, unknown>>;
  const instructions = (raw.instructions ?? {}) as Partial<
    Record<SelfPayVariant, unknown>
  >;
  return {
    consultationFullPrice: toPesos(raw.consultationFullPrice),
    practiceFullPrice: toPesos(raw.practiceFullPrice),
    firstVisitConsultationDeposit: toPesos(raw.firstVisitConsultationDeposit),
    instructions: {
      Particular: sanitizeInstructions(String(instructions.Particular ?? "")),
      PracticaParticular: sanitizeInstructions(
        String(instructions.PracticaParticular ?? ""),
      ),
    },
  };
}
