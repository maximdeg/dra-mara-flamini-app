import type { Appointment } from "@/lib/appointments/appointment";
import { cancel } from "@/lib/appointments/cancellation";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";
import { requireProfessional } from "@/lib/auth/require-professional";

/**
 * Shared admin-action concerns for the collision-requires-cancellation gate
 * (slice 13/14), reused by the schedule and unavailable-days editors. Kept out
 * of either `actions.ts` so the view-mapping and the cancel flow have one home
 * rather than a verbatim copy in each.
 */

// Shared between the server actions and the client editors (a "use server"
// module may only export async functions, so the type lives here).
export interface CollisionSummary {
  id: string;
  date: string;
  time: string;
  patientName: string;
}

export function toCollisionView(appointment: Appointment): CollisionSummary {
  return {
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
    patientName: `${appointment.patientFirstName} ${appointment.patientLastName}`,
  };
}

/**
 * Professional-cancel a colliding Appointment, then revalidate the caller's
 * page. The schedule and unavailable-days flows differ only in their revalidate
 * target, so that is the one injected parameter.
 */
export async function cancelCollision(
  id: string,
  revalidate: () => void,
): Promise<{ ok: boolean }> {
  if (!(await requireProfessional()).ok) {
    return { ok: false };
  }

  const result = await cancel(id, "professional", await getCancellationDeps());
  revalidate();
  return { ok: result.ok };
}
