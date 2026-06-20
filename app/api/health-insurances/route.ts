import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";

// GET /api/health-insurances — the accepted Health Insurance list, now
// Professional-managed (slice 15; seeded default until first edited). The
// Self-Pay variants are not here — they are system-defined.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const insurances = await (await getHealthInsuranceRepository()).list();
  return Response.json({ insurances });
}
