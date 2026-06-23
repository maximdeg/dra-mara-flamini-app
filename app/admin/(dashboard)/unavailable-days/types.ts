import type { CollisionSummary } from "../collisions";

export type { CollisionSummary };

export interface AddDayState {
  ok?: boolean;
  error?: string;
  /** Present when the add collided with Scheduled Appointments on that date. */
  collisions?: CollisionSummary[];
}
