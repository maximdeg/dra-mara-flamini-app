import { revalidatePath } from "next/cache";
import type { Appointment } from "@/lib/appointments/appointment";
import { cancel } from "@/lib/appointments/cancellation";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";
import { requireProfessional } from "@/lib/auth/require-professional";

/** A colliding Appointment as the schedule and unavailable-days editors show it. */
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
 * Professional-initiated cancellation of one colliding Appointment, shared by the
 * schedule and unavailable-days editors — the only difference between the two
 * call sites was the `revalidate` target. Behind the same `requireProfessional`
 * front door as every other admin mutation.
 */
export async function cancelCollision(
  id: string,
  revalidate: string,
): Promise<{ ok: boolean }> {
  if (!(await requireProfessional()).ok) {
    return { ok: false };
  }

  const result = await cancel(id, "professional", await getCancellationDeps());
  revalidatePath(revalidate);
  return { ok: result.ok };
}
