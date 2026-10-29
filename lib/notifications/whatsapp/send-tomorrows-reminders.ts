import { tomorrowInArgentina } from "../../datetime/argentina";
import {
  sendReminderWhatsApp,
  type ReminderWhatsAppDeps,
} from "./send-reminder-whatsapp";

export interface RemindersSummary {
  /** The Appointment date that was reminded, "YYYY-MM-DD". */
  date: string;
  sent: number;
  /** Declined WhatsApp, or already reminded. */
  skipped: number;
  /** Ids of Appointments whose send failed. */
  failed: string[];
}

/**
 * The daily Reminder batch: remind every Scheduled Appointment dated tomorrow
 * on the Argentine calendar. Sends run one at a time. Each Appointment is
 * best-effort, so one failure is recorded and the batch moves on. The summary
 * is what the cron route returns, so Vercel's cron logs show each run.
 */
export async function sendTomorrowsReminders(
  deps: ReminderWhatsAppDeps,
): Promise<RemindersSummary> {
  const now = deps.now ?? (() => new Date());
  const date = tomorrowInArgentina(now());
  const appointments = await deps.appointments.findAppointments({
    from: date,
    to: date,
    status: "scheduled",
  });

  const summary: RemindersSummary = { date, sent: 0, skipped: 0, failed: [] };
  for (const appointment of appointments) {
    try {
      const outcome = await sendReminderWhatsApp(appointment, { ...deps, now });
      if (outcome === "sent") {
        summary.sent += 1;
      } else {
        summary.skipped += 1;
      }
    } catch (error) {
      console.error(`Reminder failed for Appointment ${appointment.id}`, error);
      summary.failed.push(appointment.id);
    }
  }
  return summary;
}
