import { ChannelRouter } from "./channel-router";
import { EmailNotificationSender } from "./email-sender";
import { createGmailTransport } from "./gmail-transport";
import type { NotificationSender } from "./sender";
import { FakeNotificationSender } from "./sender";

/**
 * Composition root for the worker's Channel senders. The email Channel uses the
 * real Gmail transport when `GMAIL_USER`/`GMAIL_APP_PASSWORD` are set, and falls
 * back to the fake otherwise so the worker still runs in dev without credentials.
 * The whatsapp Channel is still the fake — the real Baileys adapter arrives in
 * slice 05 and is swapped in here.
 */
export function getNotificationSender(): NotificationSender {
  return new ChannelRouter({
    whatsapp: new FakeNotificationSender(),
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
