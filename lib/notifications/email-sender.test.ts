import { describe, expect, it } from "vitest";
import {
  EmailNotificationSender,
  type MailMessage,
  type MailTransport,
} from "./email-sender";
import type { Notification } from "./notification";

function emailNotification(): Notification {
  return {
    kind: "confirmation",
    channel: "email",
    appointmentId: "apt-1",
    recipient: "lucia@example.com",
    message: {
      subject: "Confirmación de tu cita",
      html: "<p>hola</p>",
      text: "hola",
    },
  };
}

class RecordingTransport implements MailTransport {
  sent: MailMessage[] = [];
  async sendMail(message: MailMessage): Promise<{ messageId: string }> {
    this.sent.push(message);
    return { messageId: "gmail-123" };
  }
}

const FROM = "Mara Flamini <clinic@gmail.com>";

describe("EmailNotificationSender", () => {
  it("maps the composed email onto the transport and returns the provider id", async () => {
    const transport = new RecordingTransport();
    const sender = new EmailNotificationSender(transport, FROM);

    const result = await sender.send(emailNotification());

    expect(result.messageId).toBe("gmail-123");
    expect(transport.sent).toEqual([
      {
        from: FROM,
        to: "lucia@example.com",
        subject: "Confirmación de tu cita",
        html: "<p>hola</p>",
        text: "hola",
      },
    ]);
  });

  it("refuses a non-email Notification (the ChannelRouter never sends it one)", async () => {
    const sender = new EmailNotificationSender(new RecordingTransport(), FROM);

    await expect(
      sender.send({
        kind: "confirmation",
        channel: "whatsapp",
        appointmentId: "apt-1",
        recipient: "3421112233",
        message: { text: "hola" },
      } satisfies Notification),
    ).rejects.toThrow(/cannot send a whatsapp/);
  });

  it("propagates a transport failure so the worker marks the entry failed", async () => {
    const failing: MailTransport = {
      async sendMail() {
        throw new Error("smtp down");
      },
    };
    const sender = new EmailNotificationSender(failing, FROM);

    await expect(sender.send(emailNotification())).rejects.toThrow("smtp down");
  });
});
