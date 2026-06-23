"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/require-professional";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { updateWorkSchedule } from "@/lib/availability/update-work-schedule";
import { sanitizeWorkSchedule } from "@/lib/availability/work-schedule";
import { cancelCollision, toCollisionView } from "../collisions";
import type { SaveScheduleState } from "./types";

export async function saveScheduleAction(
  input: unknown,
): Promise<SaveScheduleState> {
  if (!(await requireProfessional()).ok) {
    return { error: "No autorizado." };
  }

  const proposed = sanitizeWorkSchedule(input);
  const result = await updateWorkSchedule(proposed, {
    schedule: await getWorkScheduleRepository(),
    appointments: await getAppointmentRepository(),
  });

  if (!result.ok) {
    return { collisions: result.collisions.map(toCollisionView) };
  }

  // The change feeds Availability (Booking Window + Time Slots).
  revalidatePath("/admin/schedule");
  revalidatePath("/agendar-visita");
  return { saved: true };
}

export async function cancelCollisionAction(
  id: string,
): Promise<{ ok: boolean }> {
  return cancelCollision(id, () => revalidatePath("/admin/schedule"));
}
