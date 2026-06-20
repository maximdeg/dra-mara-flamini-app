"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { changePassword } from "@/lib/auth/change-password";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";
import type { PasswordFormState, ProfileFormState } from "./types";

const PASSWORD_ERRORS: Record<string, string> = {
  WrongCurrentPassword: "La contraseña actual es incorrecta.",
  NotFound: "No se encontró el profesional.",
};

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { error: "No autorizado." };
  }

  const repository = await getProfessionalRepository();
  await repository.updateProfile(email, {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
  });
  revalidatePath("/admin/profile");
  return { ok: true };
}

export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { error: "No autorizado." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!newPassword) {
    return { error: "Ingresá una nueva contraseña." };
  }

  const result = await changePassword(email, currentPassword, newPassword, {
    repository: await getProfessionalRepository(),
  });
  if (!result.ok) {
    return {
      error: PASSWORD_ERRORS[result.reason] ?? "No se pudo cambiar la contraseña.",
    };
  }
  return { ok: true };
}
