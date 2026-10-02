import { bookingWindow } from "@/lib/availability/availability";
import { getAvailabilityDeps } from "@/lib/availability/get-availability-deps";
import { parseVisitKind } from "@/lib/appointments/visit-kind";

// GET /api/availability?kind=<Visit Kind> — the Booking Window for that kind:
// the dates open for booking it. The kind is required; it decides which time
// ranges count.
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const kind = parseVisitKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) {
    return Response.json({ error: "InvalidVisitKind" }, { status: 400 });
  }
  const days = await bookingWindow(kind, await getAvailabilityDeps());
  return Response.json({ days });
}
