"use server";

import { revalidatePath } from "next/cache";
import { cancel } from "@/lib/appointments/cancellation";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";
import { requireProfessional } from "@/lib/auth/require-professional";

/**
 * Professional cancellation from the dashboard — reuses the Cancellation module
 * with actor="professional", so there is no 24-hour restriction and a
 * Cancellation Notice is enqueued. The middleware already guards /admin; the
 * session check here is defense-in-depth (a server action is a public endpoint).
 */
export async function cancelAppointmentAsProfessional(
  id: string,
): Promise<void> {
  if (!(await requireProfessional()).ok) {
    throw new Error("No autorizado.");
  }

  if (!id) {
    return;
  }

  await cancel(id, "professional", await getCancellationDeps());
  revalidatePath("/admin/appointments");
}
