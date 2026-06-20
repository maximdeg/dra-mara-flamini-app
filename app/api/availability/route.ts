import { bookingWindow } from "@/lib/availability/availability";
import { getAvailabilityDeps } from "@/lib/availability/get-availability-deps";

// GET /api/availability — the Booking Window: the dates open for booking.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const days = await bookingWindow(await getAvailabilityDeps());
  return Response.json({ days });
}
