import { describe, expect, it } from "vitest";
import { FakeEmailSender, type EmailMessage } from "./email-sender";
import {
  NodemailerEmailSender,
  type MailTransport,
} from "./nodemailer-email-sender";

function message(overrides: Partial<EmailMessage> = {}): EmailMessage {
  return {
    to: "lucia@example.com",
    subject: "Tu cita quedó confirmada",
    html: "<p>Hola Lucía</p>",
    text: "Hola Lucía",
    ...overrides,
  };
}

describe("FakeEmailSender", () => {
  it("records each sent message and returns a synthetic id", async () => {
    const sender = new FakeEmailSender();

    const first = await sender.send(message());
    const second = await sender.send(message({ to: "ana@example.com" }));

    expect(sender.sent).toHaveLength(2);
    expect(sender.sent[0].to).toBe("lucia@example.com");
    expect(sender.sent[0].subject).toBe("Tu cita quedó confirmada");
    expect(sender.last?.to).toBe("ana@example.com");
    expect(first.messageId).toBe("fake-email-1");
    expect(second.messageId).toBe("fake-email-2");
  });

  it("starts with no sent messages", () => {
    const sender = new FakeEmailSender();
    expect(sender.sent).toHaveLength(0);
    expect(sender.last).toBeUndefined();
  });
});

describe("NodemailerEmailSender", () => {
  it("sends with the fixed From/Reply-To and returns the transport's message id", async () => {
    const calls: Parameters<MailTransport["sendMail"]>[0][] = [];
    const transport: MailTransport = {
      async sendMail(options) {
        calls.push(options);
        return { messageId: "smtp-42" };
      },
    };
    const sender = new NodemailerEmailSender(
      transport,
      "Dra. Mara Flamini · Dermatología <clinica@gmail.com>",
      "clinica@gmail.com",
    );

    const result = await sender.send(message());

    expect(result.messageId).toBe("smtp-42");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      from: "Dra. Mara Flamini · Dermatología <clinica@gmail.com>",
      replyTo: "clinica@gmail.com",
      to: "lucia@example.com",
      subject: "Tu cita quedó confirmada",
      html: "<p>Hola Lucía</p>",
      text: "Hola Lucía",
    });
  });
});
