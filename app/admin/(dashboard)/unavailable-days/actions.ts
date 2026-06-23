"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/require-professional";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { addUnavailableDay } from "@/lib/availability/add-unavailable-day";
import { isISODate } from "@/lib/availability/dates";
import { getUnavailableDaysRepository } from "@/lib/availability/get-unavailable-days-repository";
import { cancelCollision, toCollisionView } from "../collisions";
import type { AddDayState } from "./types";

export async function addUnavailableDayAction(
  date: string,
): Promise<AddDayState> {
  if (!(await requireProfessional()).ok) {
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
    return { collisions: result.collisions.map(toCollisionView) };
  }

  revalidatePath("/admin/unavailable-days");
  revalidatePath("/agendar-visita");
  return { ok: true };
}

export async function removeUnavailableDayAction(
  date: string,
): Promise<{ ok: boolean }> {
  if (!(await requireProfessional()).ok) {
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
  return cancelCollision(id, () => revalidatePath("/admin/unavailable-days"));
}
