import { availableTimesFor } from "@/lib/availability/availability";
import { getAvailabilityDeps } from "@/lib/availability/get-availability-deps";
import { parseVisitKind } from "@/lib/appointments/visit-kind";

// GET /api/available-times/[date]?kind=<Visit Kind> — the free Time Slots on
// a date for that kind. The kind is required.
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
  const kind = parseVisitKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) {
    return Response.json({ error: "InvalidVisitKind" }, { status: 400 });
  }
  const { date } = await params;
  const times = await availableTimesFor(date, kind, await getAvailabilityDeps());
  return Response.json({ times });
}
