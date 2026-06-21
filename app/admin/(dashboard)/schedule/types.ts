// Shared between the schedule server actions and the client editor (a "use
// server" module may only export async functions, so types live here).
export interface CollisionSummary {
  id: string;
  date: string;
  time: string;
  patientName: string;
}

export interface SaveScheduleState {
  saved?: boolean;
  error?: string;
  /** Present (possibly empty after cancelling) when a reduction collided. */
  collisions?: CollisionSummary[];
}
