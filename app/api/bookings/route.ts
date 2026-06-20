import { book } from "@/lib/appointments/booking";
import { getBookingDeps } from "@/lib/appointments/get-booking-deps";
import type { BookingForm } from "@/lib/appointments/appointment";

// POST /api/bookings — create an Appointment through the Booking module.
// The route is a thin adapter: parse the form, hand Booking its composed
// dependencies, and translate the result. A Rejection becomes 422 with its
// reason; all booking behavior lives behind book().
export async function POST(request: Request): Promise<Response> {
  const form = (await request.json()) as BookingForm;
  const result = await book(form, await getBookingDeps());

  if (!result.ok) {
    return Response.json({ rejection: result.rejection }, { status: 422 });
  }
  return Response.json({ id: result.appointment.id }, { status: 201 });
}
