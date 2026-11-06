"use server";

import { revalidatePath } from "next/cache";
import { getManualBookingDeps } from "@/lib/appointments/get-manual-booking-deps";
import {
  bookManually,
  type ManualBookingForm,
} from "@/lib/appointments/manual-booking";
import { requireProfessional } from "@/lib/auth/require-professional";
import type { ManualBookingActionResult } from "./types";

/**
 * Enter an Appointment by hand from the Agendar turno tab. A server action is
 * a public endpoint the middleware does not guard, so it re-checks the
 * Professional's session; Manual Booking validates the (untrusted) form.
 */
export async function bookManuallyAction(
  form: ManualBookingForm,
): Promise<ManualBookingActionResult> {
  if (!(await requireProfessional()).ok) {
    return { ok: false, rejection: "Unauthorized" };
  }

  const result = await bookManually(form, await getManualBookingDeps());
  if (!result.ok) {
    return { ok: false, rejection: result.rejection };
  }

  // The new Appointment shows in the dashboard, and its time leaves the
  // public booking form's slots.
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");
  revalidatePath("/agendar-visita");
  return { ok: true, date: result.appointment.date };
}
