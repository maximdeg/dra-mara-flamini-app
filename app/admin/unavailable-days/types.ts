// Shared between the Unavailable Days server actions and the client manager
// (a "use server" module may only export async functions).
export interface CollisionSummary {
  id: string;
  date: string;
  time: string;
  patientName: string;
}

export interface AddDayState {
  ok?: boolean;
  error?: string;
  /** Present when the add collided with Scheduled Appointments on that date. */
  collisions?: CollisionSummary[];
}
