import type { VisitDurations } from "./visit-durations";

/**
 * The Visit Durations persistence seam — a single settings document. `get`
 * returns the defaults (20 minutes for every kind) until the Professional first
 * saves. Two adapters satisfy it: Mongo in production, in-memory in tests/dev.
 */
export interface VisitDurationsRepository {
  get(): Promise<VisitDurations>;
  save(durations: VisitDurations): Promise<void>;
}
