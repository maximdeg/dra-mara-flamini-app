import { toPublicHealthInsurance } from "@/lib/coverage/coverage";
import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";

// GET /api/health-insurances — the accepted Health Insurance list, now
// Professional-managed (slice 15; seeded default until first edited). The
// Self-Pay variants are not here — they are system-defined. Public, so each
// insurer is projected to its Patient-safe view (no internal Notas).
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const insurances = (await (await getHealthInsuranceRepository()).list()).map(
    toPublicHealthInsurance,
  );
  return Response.json({ insurances });
}
