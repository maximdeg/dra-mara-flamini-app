import type { UnavailableDaysRepository } from "./unavailable-days-repository";

/**
 * In-memory adapter at the Unavailable Days seam — the reference fake for tests
 * and dev. Holds the blocked dates in a Set; production uses the Mongo adapter.
 */
export class InMemoryUnavailableDaysRepository
  implements UnavailableDaysRepository
{
  private readonly dates: Set<string>;

  constructor(seed: Iterable<string> = []) {
    this.dates = new Set(seed);
  }

  async list(): Promise<string[]> {
    return [...this.dates].sort();
  }

  async add(date: string): Promise<void> {
    this.dates.add(date);
  }

  async remove(date: string): Promise<void> {
    this.dates.delete(date);
  }
}
