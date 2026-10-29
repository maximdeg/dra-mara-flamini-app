import { timingSafeEqual } from "node:crypto";
import { getReminderDeps } from "@/lib/notifications/whatsapp/get-reminder-deps";
import { remindersEnabled } from "@/lib/notifications/whatsapp/reminders-enabled";
import { sendTomorrowsReminders } from "@/lib/notifications/whatsapp/send-tomorrows-reminders";

// GET /api/cron/reminders — the daily Reminder batch. Vercel Cron calls it at
// 08:00 Argentina time (vercel.json) with `Authorization: Bearer $CRON_SECRET`.
// It reminds every Scheduled Appointment dated tomorrow (ADR-0003).
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!remindersEnabled()) {
    return Response.json({ enabled: false });
  }
  const summary = await sendTomorrowsReminders(await getReminderDeps());
  return Response.json({ enabled: true, ...summary });
}

/** Fails closed: with no CRON_SECRET configured, nothing is authorized. */
function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) {
    return false;
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
