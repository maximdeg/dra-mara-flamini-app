// Shared between the schedule server actions and the client editor (a "use
// server" module may only export async functions, so types live here).
// CollisionSummary is owned by the shared collisions helper; imported and
// re-exported here (type-only, so no server code reaches the client bundle).
import type { CollisionSummary } from "../collisions";
export type { CollisionSummary };

export interface SaveScheduleState {
  saved?: boolean;
  error?: string;
  /** Present (possibly empty after cancelling) when a reduction collided. */
  collisions?: CollisionSummary[];
}
