"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cancel } from "@/lib/appointments/cancellation";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";
import { addUnavailableDay } from "@/lib/availability/add-unavailable-day";
import { isISODate } from "@/lib/availability/dates";
import { getUnavailableDaysRepository } from "@/lib/availability/get-unavailable-days-repository";
import type { AddDayState } from "./types";

export async function addUnavailableDayAction(
  date: string,
): Promise<AddDayState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado." };
  }
  if (!isISODate(date)) {
    return { error: "Elegí una fecha válida." };
  }

  const result = await addUnavailableDay(date, {
    unavailableDays: await getUnavailableDaysRepository(),
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

  revalidatePath("/admin/unavailable-days");
  revalidatePath("/agendar-visita");
  return { ok: true };
}

export async function removeUnavailableDayAction(
  date: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false };
  }

  await (await getUnavailableDaysRepository()).remove(date);
  revalidatePath("/admin/unavailable-days");
  revalidatePath("/agendar-visita");
  return { ok: true };
}

export async function cancelCollisionAction(
  id: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false };
  }

  const result = await cancel(id, "professional", await getCancellationDeps());
  revalidatePath("/admin/unavailable-days");
  return { ok: result.ok };
}
