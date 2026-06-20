import { cancel } from "@/lib/appointments/cancellation";
import { getCancellationDeps } from "@/lib/appointments/get-cancellation-deps";

// POST /api/appointments/[id]/cancel — Patient self-cancellation.
// The Cancellation module enforces the Cancellation Window; a rejection becomes
// 404 (not found) or 422 (window/state), and a success enqueues a Cancellation
// Notice.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const result = await cancel(id, "patient", await getCancellationDeps());

  if (!result.ok) {
    const status = result.rejection === "NotFound" ? 404 : 422;
    return Response.json({ rejection: result.rejection }, { status });
  }
  return Response.json({ ok: true }, { status: 200 });
}
