import { getClinicInfoRepository } from "../clinic/get-clinic-info-repository";
import { getEmailSender } from "../notifications/email/get-email-sender";
import { sendCancellationEmail } from "../notifications/email/send-cancellation-email";
import { getWhatsAppSender } from "../notifications/whatsapp/get-whatsapp-sender";
import { sendCancellationWhatsApp } from "../notifications/whatsapp/send-cancellation-whatsapp";
import type { CancellationDependencies } from "./cancellation";
import { getAppointmentRepository } from "./get-appointment-repository";

/**
 * Production composition root for Cancellation: the repository plus the two
 * best-effort Patient channels, WhatsApp and email.
 */
export async function getCancellationDeps(): Promise<CancellationDependencies> {
  const repository = await getAppointmentRepository();

  return {
    repository,
    // The WhatsApp sender is built lazily here so missing Meta config throws
    // inside cancel()'s best-effort catch rather than failing deps composition.
    // Which template goes out depends on who cancelled (ADR-0003).
    notifyCancellation: (appointment, actor) =>
      sendCancellationWhatsApp(appointment, actor, {
        sender: getWhatsAppSender(),
      }),
    // Built lazily so missing Gmail config (or a clinic-info read) throws inside
    // cancel()'s best-effort catch rather than failing deps composition.
    sendCancellationEmail: async (appointment, actor) => {
      const { contact } = await getClinicInfoRepository().then((r) => r.get());
      await sendCancellationEmail(appointment, actor, {
        sender: getEmailSender(),
        contacts: contact.contacts,
      });
    },
  };
}
