"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/require-professional";
import {
  addInsurance,
  editInsurance,
  removeInsurance,
} from "@/lib/coverage/coverage";
import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";
import { sanitizeSelfPayPricing } from "@/lib/deposit/deposit";
import { getSelfPayPricingRepository } from "@/lib/deposit/get-self-pay-pricing-repository";

export interface InsuranceInput {
  name: string;
  price: number;
  notes: string;
}

function toPrice(value: number): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

async function reflectCoverage(): Promise<void> {
  // Coverage feeds the public booking picker and Deposit determination.
  revalidatePath("/admin/coverage");
  revalidatePath("/agendar-visita");
}

export async function addInsuranceAction(input: InsuranceInput): Promise<void> {
  if (!(await requireProfessional()).ok) return;

  const name = input.name.trim();
  if (!name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(
    addInsurance(await repository.list(), {
      name,
      price: toPrice(input.price),
      notes: input.notes.trim(),
    }),
  );
  await reflectCoverage();
}

export async function editInsuranceAction(
  originalName: string,
  input: InsuranceInput,
): Promise<void> {
  if (!(await requireProfessional()).ok) return;

  const name = input.name.trim();
  if (!originalName || !name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(
    editInsurance(await repository.list(), originalName, {
      name,
      price: toPrice(input.price),
      notes: input.notes.trim(),
    }),
  );
  await reflectCoverage();
}

export async function removeInsuranceAction(name: string): Promise<void> {
  if (!(await requireProfessional()).ok) return;
  if (!name) return;

  const repository = await getHealthInsuranceRepository();
  await repository.save(removeInsurance(await repository.list(), name));
  await reflectCoverage();
}

export async function saveSelfPayPricingAction(input: {
  consultationFullPrice: number;
  practiceFullPrice: number;
  firstVisitConsultationDeposit: number;
}): Promise<void> {
  if (!(await requireProfessional()).ok) return;

  await (await getSelfPayPricingRepository()).save(sanitizeSelfPayPricing(input));
  await reflectCoverage();
}
