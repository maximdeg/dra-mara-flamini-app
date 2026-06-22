import { describe, expect, it } from "vitest";
import type { Notification } from "./notification";
import { WhatsAppNotificationSender } from "./whatsapp-sender";
import { FakeWhatsAppSocket, type WhatsAppSocket } from "./whatsapp-socket";

function whatsappNotification(): Notification {
  return {
    kind: "confirmation",
    channel: "whatsapp",
    appointmentId: "apt-1",
    recipient: "3421112233",
    message: { text: "Hola Lucía, tu cita quedó confirmada." },
  };
}

describe("WhatsAppNotificationSender", () => {
  it("normalizes the phone to a JID, sends the text, and returns the message id", async () => {
    const calls: { jid: string; text: string }[] = [];
    const socket: WhatsAppSocket = {
      async resolveJid(jid) {
        return jid;
      },
      async sendText(jid, text) {
        calls.push({ jid, text });
        return { id: "wamid.1" };
      },
    };
    const sender = new WhatsAppNotificationSender(socket);

    const result = await sender.send(whatsappNotification());

    expect(result.messageId).toBe("wamid.1");
    expect(calls).toEqual([
      {
        jid: "5493421112233@s.whatsapp.net",
        text: "Hola Lucía, tu cita quedó confirmada.",
      },
    ]);
  });

  it("sends to the canonical JID the socket resolves, not the dialed one", async () => {
    const calls: string[] = [];
    const socket: WhatsAppSocket = {
      async resolveJid() {
        return "5413421112233@s.whatsapp.net"; // socket's canonical form
      },
      async sendText(jid) {
        calls.push(jid);
        return { id: "wamid.2" };
      },
    };

    await new WhatsAppNotificationSender(socket).send(whatsappNotification());

    expect(calls).toEqual(["5413421112233@s.whatsapp.net"]);
  });

  it("throws when the number is not on WhatsApp (so the worker fails only this Channel)", async () => {
    const sender = new WhatsAppNotificationSender(
      new FakeWhatsAppSocket({ registered: false }),
    );

    await expect(sender.send(whatsappNotification())).rejects.toThrow(
      /not on WhatsApp/,
    );
  });

  it("refuses a non-whatsapp Notification", async () => {
    const sender = new WhatsAppNotificationSender(new FakeWhatsAppSocket());

    await expect(
      sender.send({
        kind: "confirmation",
        channel: "email",
        appointmentId: "apt-1",
        recipient: "lucia@example.com",
        message: { subject: "s", html: "h", text: "t" },
      } satisfies Notification),
    ).rejects.toThrow(/cannot send a email/);
  });
});
