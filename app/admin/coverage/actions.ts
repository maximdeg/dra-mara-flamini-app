"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  addInsurance,
  editInsurance,
  removeInsurance,
} from "@/lib/coverage/coverage";
import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";
import { sanitizeSelfPayPricing } from "@/lib/deposit/deposit";
import { getSelfPayPricingRepository } from "@/lib/deposit/get-self-pay-pricing-repository";

function toPrice(value: FormDataEntryValue | null): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

async function reflectCoverage(): Promise<void> {
  // Coverage feeds the public booking picker and Deposit determination.
  revalidatePath("/admin/coverage");
  revalidatePath("/agendar-visita");
}

export async function addInsuranceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(
    addInsurance(await repository.list(), {
      name,
      price: toPrice(formData.get("price")),
      notes: String(formData.get("notes") ?? "").trim(),
    }),
  );
  await reflectCoverage();
}

export async function editInsuranceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const originalName = String(formData.get("originalName") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!originalName || !name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(
    editInsurance(await repository.list(), originalName, {
      name,
      price: toPrice(formData.get("price")),
      notes: String(formData.get("notes") ?? "").trim(),
    }),
  );
  await reflectCoverage();
}

export async function removeInsuranceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const name = String(formData.get("name") ?? "");
  if (!name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(removeInsurance(await repository.list(), name));
  await reflectCoverage();
}

export async function saveSelfPayPricingAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const pricing = sanitizeSelfPayPricing({
    consultationFullPrice: formData.get("consultationFullPrice"),
    practiceFullPrice: formData.get("practiceFullPrice"),
    firstVisitConsultationDeposit: formData.get("firstVisitConsultationDeposit"),
  });
  await (await getSelfPayPricingRepository()).save(pricing);
  await reflectCoverage();
}
