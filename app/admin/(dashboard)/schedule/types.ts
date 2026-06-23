import type { CollisionSummary } from "../collisions";

export type { CollisionSummary };

export interface SaveScheduleState {
  saved?: boolean;
  error?: string;
  /** Present (possibly empty after cancelling) when a reduction collided. */
  collisions?: CollisionSummary[];
}
