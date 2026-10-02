import { DEFAULT_VISIT_DURATIONS, type VisitDurations } from "./visit-durations";
import type { VisitDurationsRepository } from "./visit-durations-repository";

/**
 * In-memory adapter at the Visit Durations seam — the reference fake for tests
 * and dev. `get` returns the defaults until durations are saved, matching the
 * Mongo adapter.
 */
export class InMemoryVisitDurationsRepository
  implements VisitDurationsRepository
{
  private durations: VisitDurations | null;

  constructor(seed: VisitDurations | null = null) {
    this.durations = seed;
  }

  async get(): Promise<VisitDurations> {
    return this.durations ?? DEFAULT_VISIT_DURATIONS;
  }

  async save(durations: VisitDurations): Promise<void> {
    this.durations = durations;
  }
}
