import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { sendCancellationWhatsApp } from "./send-cancellation-whatsapp";
import { FakeWhatsAppSender, type WhatsAppSender } from "./whatsapp-sender";

function appointment(): Appointment {
  return {
    id: "apt-1",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "+5493421112233",
    patientEmail: "lucia@example.com",
    visitType: "Consultation",
    consultType: "FirstVisit",
    practiceType: null,
    coverage: { kind: "health-insurance", name: "OSDE" },
    deposit: null,
    date: "2026-06-22",
    time: "09:30",
    status: "cancelled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-06-19T11:55:00.000Z",
  };
}

describe("sendCancellationWhatsApp", () => {
  it("sends the doctor's template to the Patient when the clinic cancels", async () => {
    const sender = new FakeWhatsAppSender();

    await sendCancellationWhatsApp(appointment(), "professional", { sender });

    expect(sender.last?.to).toBe("+5493421112233");
    expect(sender.last?.templateName).toBe("appointment_cancellation_by_doctor");
    expect(sender.last?.params).toEqual(["Lucía", "22/06/2026", "09:30"]);
  });

  it("sends the Patient's template when the Patient cancels", async () => {
    const sender = new FakeWhatsAppSender();

    await sendCancellationWhatsApp(appointment(), "patient", { sender });

    expect(sender.last?.templateName).toBe(
      "appointment_cancellation_by_patient1",
    );
  });

  it("propagates a sender failure (Cancellation invokes it best-effort)", async () => {
    const failingSender: WhatsAppSender = {
      async send() {
        throw new Error("whatsapp down");
      },
    };

    await expect(
      sendCancellationWhatsApp(appointment(), "patient", {
        sender: failingSender,
      }),
    ).rejects.toThrow("whatsapp down");
  });
});

describe("sendCancellationWhatsApp — consent", () => {
  it("sends nothing when the Patient declined WhatsApp", async () => {
    const sender = new FakeWhatsAppSender();

    await sendCancellationWhatsApp(
      { ...appointment(), whatsappConsentAt: null },
      "professional",
      { sender },
    );

    expect(sender.sent).toHaveLength(0);
  });

  it("sends for an Appointment booked before consent was captured", async () => {
    const sender = new FakeWhatsAppSender();

    await sendCancellationWhatsApp(appointment(), "patient", { sender });

    expect(sender.sent).toHaveLength(1);
  });
});
