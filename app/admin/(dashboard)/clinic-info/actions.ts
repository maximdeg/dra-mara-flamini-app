"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/require-professional";
import { sanitizeClinicInfo } from "@/lib/clinic/clinic-info";
import { getClinicInfoRepository } from "@/lib/clinic/get-clinic-info-repository";

/**
 * Persist edited confirmation-page copy. The cita pages are rendered on demand
 * (`force-dynamic`), so they pick up the change on the next load; we only need
 * to revalidate the editor's own page.
 */
export async function saveClinicInfoAction(input: unknown): Promise<void> {
  if (!(await requireProfessional()).ok) return;

  await (await getClinicInfoRepository()).save(sanitizeClinicInfo(input));
  revalidatePath("/admin/clinic-info");
}
