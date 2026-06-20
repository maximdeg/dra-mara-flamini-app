import { DEFAULT_WORK_SCHEDULE, type WorkSchedule } from "./work-schedule";
import type { WorkScheduleRepository } from "./work-schedule-repository";

/**
 * In-memory adapter at the Work Schedule seam — the reference fake for tests and
 * dev. Holds at most one schedule; `get` returns the seeded default until one is
 * saved, matching the Mongo adapter's fallback.
 */
export class InMemoryWorkScheduleRepository implements WorkScheduleRepository {
  private schedule: WorkSchedule | null;

  constructor(seed: WorkSchedule | null = null) {
    this.schedule = seed;
  }

  async get(): Promise<WorkSchedule> {
    return this.schedule ?? DEFAULT_WORK_SCHEDULE;
  }

  async save(schedule: WorkSchedule): Promise<void> {
    this.schedule = schedule;
  }
}
