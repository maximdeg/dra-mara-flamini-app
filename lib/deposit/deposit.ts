import type { ConsultType, VisitType } from "../appointments/visit-type";
import type { Coverage } from "../coverage/coverage";

/**
 * The Deposit (UI: _Seña_) — an upfront payment a Patient commits to for
 * Self-Pay Appointments only (CONTEXT.md). The platform captures only the
 * Patient's acknowledgment; the actual transfer happens off-platform.
 */

/**
 * Self-Pay pricing the Deposit is computed from. Seeded now; Professional-
 * editable from slice 15. Amounts are whole Argentine pesos.
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
}

export const SEEDED_SELF_PAY_PRICING: SelfPayPricing = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
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
 * Coerce untrusted Self-Pay pricing input (from the editing form) into a valid
 * SelfPayPricing — the trust boundary for price edits. The two Self-Pay variants
 * themselves are fixed in code; only these three amounts are editable.
 */
export function sanitizeSelfPayPricing(input: unknown): SelfPayPricing {
  const raw = (input ?? {}) as Partial<Record<keyof SelfPayPricing, unknown>>;
  return {
    consultationFullPrice: toPesos(raw.consultationFullPrice),
    practiceFullPrice: toPesos(raw.practiceFullPrice),
    firstVisitConsultationDeposit: toPesos(raw.firstVisitConsultationDeposit),
  };
}
