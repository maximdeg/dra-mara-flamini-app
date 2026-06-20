import type { WorkSchedule } from "./work-schedule";

/**
 * The Work Schedule persistence seam. The Work Schedule is a single document
 * (one recurring weekly schedule per deployment). `get` falls back to the
 * seeded default until the Professional first saves, so Availability behaves the
 * same before any edit. Two adapters satisfy it: Mongo in production, in-memory
 * in tests/dev.
 */
export interface WorkScheduleRepository {
  get(): Promise<WorkSchedule>;
  save(schedule: WorkSchedule): Promise<void>;
}
