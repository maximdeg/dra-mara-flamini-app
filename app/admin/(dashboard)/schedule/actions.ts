"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cancel } from "@/lib/appointments/cancellation";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";
import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { updateWorkSchedule } from "@/lib/availability/update-work-schedule";
import { sanitizeWorkSchedule } from "@/lib/availability/work-schedule";
import type { SaveScheduleState } from "./types";

export async function saveScheduleAction(
  input: unknown,
): Promise<SaveScheduleState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado." };
  }

  const proposed = sanitizeWorkSchedule(input);
  const result = await updateWorkSchedule(proposed, {
    schedule: await getWorkScheduleRepository(),
    appointments: await getAppointmentRepository(),
  });

  if (!result.ok) {
    return {
      collisions: result.collisions.map((a) => ({
        id: a.id,
        date: a.date,
        time: a.time,
        patientName: `${a.patientFirstName} ${a.patientLastName}`,
      })),
    };
  }

  // The change feeds Availability (Booking Window + Time Slots).
  revalidatePath("/admin/schedule");
  revalidatePath("/agendar-visita");
  return { saved: true };
}

export async function cancelCollisionAction(
  id: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false };
  }

  const result = await cancel(id, "professional", await getCancellationDeps());
  revalidatePath("/admin/schedule");
  return { ok: result.ok };
}
