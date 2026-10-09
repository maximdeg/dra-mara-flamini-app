"use server";

import { revalidatePath } from "next/cache";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { requireProfessional } from "@/lib/auth/require-professional";
import { sanitizeBookingWindowLength } from "@/lib/availability/booking-window-length";
import { getBookingWindowLengthRepository } from "@/lib/availability/get-booking-window-length-repository";
import { getVisitDurationsRepository } from "@/lib/availability/get-visit-durations-repository";
import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { updateWorkSchedule } from "@/lib/availability/update-work-schedule";
import { sanitizeVisitDurations } from "@/lib/availability/visit-durations";
import { sanitizeWorkSchedule } from "@/lib/availability/work-schedule";
import { cancelCollision, toCollisionView } from "../collisions";
import type {
  SaveBookingWindowLengthState,
  SaveDurationsState,
  SaveScheduleState,
} from "./types";

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

/**
 * Save how long each Visit Kind takes. Never collides: each Appointment keeps
 * the duration it was booked with, so only future starts change.
 */
export async function saveVisitDurationsAction(
  input: unknown,
): Promise<SaveDurationsState> {
  if (!(await requireProfessional()).ok) {
    return { error: "No autorizado." };
  }

  await (await getVisitDurationsRepository()).save(
    sanitizeVisitDurations(input),
  );
  // Durations decide which starts fit (Availability).
  revalidatePath("/admin/schedule");
  revalidatePath("/agendar-visita");
  return { saved: true };
}

/**
 * Save how many days ahead Patients may book. Never collides: the window only
 * limits new bookings, so Appointments already beyond a shorter one stay.
 */
export async function saveBookingWindowLengthAction(
  input: unknown,
): Promise<SaveBookingWindowLengthState> {
  if (!(await requireProfessional()).ok) {
    return { error: "No autorizado." };
  }

  await (await getBookingWindowLengthRepository()).save(
    sanitizeBookingWindowLength(input),
  );
  // The length decides which dates are offered and accepted (Availability).
  revalidatePath("/admin/schedule");
  revalidatePath("/agendar-visita");
  return { saved: true };
}

export async function cancelCollisionAction(
  id: string,
): Promise<{ ok: boolean }> {
  return cancelCollision(id, "/admin/schedule");
}
