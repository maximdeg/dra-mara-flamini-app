import { availableTimesFor } from "@/lib/availability/availability";
import { getAvailabilityDeps } from "@/lib/availability/get-availability-deps";

// GET /api/available-times/[date] — the free 20-minute Time Slots for a date.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
  const { date } = await params;
  const times = await availableTimesFor(date, await getAvailabilityDeps());
  return Response.json({ times });
}
