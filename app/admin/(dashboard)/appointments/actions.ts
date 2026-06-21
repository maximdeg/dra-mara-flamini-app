"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cancel } from "@/lib/appointments/cancellation";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";

/**
 * Professional cancellation from the dashboard — reuses the Cancellation module
 * with actor="professional", so there is no 24-hour restriction and a
 * Cancellation Notice is enqueued. The middleware already guards /admin; the
 * session check here is defense-in-depth (a server action is a public endpoint).
 */
export async function cancelAppointmentAsProfessional(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  await cancel(id, "professional", await getCancellationDeps());
  revalidatePath("/admin/appointments");
}
