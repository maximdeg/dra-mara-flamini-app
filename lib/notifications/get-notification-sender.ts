import { ChannelRouter } from "./channel-router";
import { EmailNotificationSender } from "./email-sender";
import { createGmailTransport } from "./gmail-transport";
import type { NotificationSender } from "./sender";
import { FakeNotificationSender } from "./sender";
import { WhatsAppNotificationSender } from "./whatsapp-sender";
import { FakeWhatsAppSocket } from "./whatsapp-socket";

/**
 * Composition root for the worker's Channel senders. The email Channel uses the
 * real Gmail transport when `GMAIL_USER`/`GMAIL_APP_PASSWORD` are set, and falls
 * back to the fake otherwise so the worker still runs in dev without credentials.
 * The whatsapp Channel runs the real adapter (JID normalization + registration
 * guard + send) over a fake socket; slice 05 swaps in the live Baileys socket.
 */
export function getNotificationSender(): NotificationSender {
  return new ChannelRouter({
    whatsapp: new WhatsAppNotificationSender(new FakeWhatsAppSocket()),
    email: getEmailSender(),
  });
}

function getEmailSender(): NotificationSender {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) {
    console.warn(
      "[worker] GMAIL_USER/GMAIL_APP_PASSWORD not set — email Channel uses the fake sender",
    );
    return new FakeNotificationSender();
  }
  const from = process.env.MAIL_FROM ?? user;
  return new EmailNotificationSender(
    createGmailTransport({ user, appPassword }),
    from,
  );
}
