import { VISIT_KINDS, type VisitKind } from "../appointments/visit-kind";
import { DEFAULT_DURATION_MINUTES } from "../appointments/appointment";

/**
 * Visit Durations (CONTEXT.md) — how long each Visit Kind takes, in minutes.
 * Availability offers a kind only starts where an Appointment of this length
 * fits; Booking copies it onto the Appointment, so later edits never move or
 * collide with existing ones.
 */
export type VisitDurations = Record<VisitKind, number>;

const MIN_MINUTES = 10;
const MAX_MINUTES = 120;
const STEP_MINUTES = 10;

/** The durations the Professional can pick: 10, 20, … 120 minutes. */
export const DURATION_OPTIONS: number[] = Array.from(
  { length: (MAX_MINUTES - MIN_MINUTES) / STEP_MINUTES + 1 },
  (_, i) => MIN_MINUTES + i * STEP_MINUTES,
);

export const DEFAULT_VISIT_DURATIONS: VisitDurations = Object.fromEntries(
  VISIT_KINDS.map((kind) => [kind, DEFAULT_DURATION_MINUTES]),
) as VisitDurations;

/**
 * Coerce untrusted durations (the editing form, or a stored document) into
 * valid ones — the trust boundary for duration edits. Anything off the
 * 10–120, step-10 scale, or missing, reads as the default.
 */
export function sanitizeVisitDurations(input: unknown): VisitDurations {
  const raw = (input ?? {}) as Partial<Record<VisitKind, unknown>>;
  return Object.fromEntries(
    VISIT_KINDS.map((kind) => {
      const minutes = Number(raw[kind]);
      return [
        kind,
        DURATION_OPTIONS.includes(minutes) ? minutes : DEFAULT_DURATION_MINUTES,
      ];
    }),
  ) as VisitDurations;
}
