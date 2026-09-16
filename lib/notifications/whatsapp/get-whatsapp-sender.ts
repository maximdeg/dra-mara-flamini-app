import { getWhatsAppSendLog } from "./get-whatsapp-send-log";
import { LoggedWhatsAppSender } from "./logged-whatsapp-sender";
import { MetaWhatsAppSender, type GraphApiTransport } from "./meta-whatsapp-sender";
import type { WhatsAppSendLog } from "./send-log";
import type { WhatsAppSender } from "./whatsapp-sender";

/**
 * Production wiring at the WhatsApp-sending seam: a Meta Cloud API sender over a
 * `fetch`-based Graph API transport, authenticated with the clinic's WhatsApp
 * access token. Env is read lazily at call time, so importing this module never
 * requires WhatsApp config — builds and tests stay decoupled from Meta. Tests
 * construct a FakeWhatsAppSender (or a MetaWhatsAppSender with a stub transport)
 * directly. Mirrors get-email-sender.
 */
export function getWhatsAppSender(): WhatsAppSender {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "META_WHATSAPP_PHONE_NUMBER_ID and META_WHATSAPP_ACCESS_TOKEN must be set to send WhatsApp",
    );
  }

  const transport = fetchGraphApiTransport(accessToken);
  const sender = new MetaWhatsAppSender(transport, phoneNumberId);
  // Every attempt is recorded in the Send Log so the Panel can show how much of
  // Meta's messaging limit the rolling 24h window has used. The log is resolved
  // lazily and its failures are swallowed inside the decorator, so bookkeeping
  // never costs a Confirmation.
  return new LoggedWhatsAppSender(sender, lazySendLog());
}

/**
 * A Send Log that resolves the Mongo-backed one on first use. Keeps
 * `getWhatsAppSender()` synchronous (Booking composes it inline) and keeps
 * importing this module free of a database connection.
 */
function lazySendLog(): WhatsAppSendLog {
  return {
    async record(entry) {
      const log = await getWhatsAppSendLog();
      await log.record(entry);
    },
    async since(since) {
      const log = await getWhatsAppSendLog();
      return log.since(since);
    },
  };
}

/**
 * A GraphApiTransport backed by the global `fetch`, carrying the bearer token on
 * every request so the sender adapter never handles credentials. Kept here (not
 * exported) because it is the production detail; unit tests stub the interface.
 */
function fetchGraphApiTransport(accessToken: string): GraphApiTransport {
  return {
    async post(url, body) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, json };
    },
  };
}
