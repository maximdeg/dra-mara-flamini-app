// Shared between the Unavailable Days server actions and the client manager
// (a "use server" module may only export async functions).
// CollisionSummary is owned by the shared collisions helper; imported and
// re-exported here (type-only, so no server code reaches the client bundle).
import type { CollisionSummary } from "../collisions";
export type { CollisionSummary };

export interface AddDayState {
  ok?: boolean;
  error?: string;
  /** Present when the add collided with Scheduled Appointments on that date. */
  collisions?: CollisionSummary[];
}
