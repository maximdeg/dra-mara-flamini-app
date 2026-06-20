import { getSelfPayPricingRepository } from "@/lib/deposit/get-self-pay-pricing-repository";

// GET /api/self-pay-pricing — the Self-Pay prices the Deposit is computed from,
// now Professional-editable (slice 15; seeded default until first edited).
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const pricing = await (await getSelfPayPricingRepository()).get();
  return Response.json({ pricing });
}
