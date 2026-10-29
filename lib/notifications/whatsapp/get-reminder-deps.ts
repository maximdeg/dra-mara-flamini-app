import { getAppointmentRepository } from "../../appointments/get-appointment-repository";
import type { WhatsAppMessage, WhatsAppSender } from "./whatsapp-sender";
import { getWhatsAppSender } from "./get-whatsapp-sender";
import type { ReminderWhatsAppDeps } from "./send-reminder-whatsapp";

/**
 * Production composition root for the Reminder batch: the Mongo appointment
 * repository and the Meta sender, which is wrapped by the Send Log so
 * Reminders count toward the messaging limit shown in the Panel. The sender is
 * built lazily on the first send, so missing Meta config fails that
 * Appointment inside the batch instead of failing composition. Mirrors
 * getBookingDeps.
 */
export async function getReminderDeps(): Promise<ReminderWhatsAppDeps> {
  const appointments = await getAppointmentRepository();
  let sender: WhatsAppSender | undefined;
  return {
    appointments,
    sender: {
      send(message: WhatsAppMessage) {
        sender ??= getWhatsAppSender();
        return sender.send(message);
      },
    },
  };
}
