import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { InMemoryAppointmentRepository } from "../../appointments/in-memory-appointment-repository";
import { sendConfirmationWhatsApp } from "./send-confirmation-whatsapp";
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
    status: "scheduled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-06-19T11:55:00.000Z",
  };
}

describe("sendConfirmationWhatsApp", () => {
  it("sends the template to the Patient and records the WhatsApp bookkeeping", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const sender = new FakeWhatsAppSender();

    await sendConfirmationWhatsApp(appointment(), {
      sender,
      appointments: repository,
      now: () => new Date("2026-06-19T12:00:00.000Z"),
    });

    expect(sender.last?.to).toBe("+5493421112233");
    expect(sender.last?.templateName).toBe("appointment_confirmation_1");
    expect(sender.last?.params).toHaveLength(6);

    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(true);
    expect(stored?.whatsappSentAt).toBe("2026-06-19T12:00:00.000Z");
    expect(stored?.whatsappMessageId).toBe("fake-whatsapp-1");
  });

  it("propagates a sender failure (Booking invokes it best-effort)", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const failingSender: WhatsAppSender = {
      async send() {
        throw new Error("whatsapp down");
      },
    };

    await expect(
      sendConfirmationWhatsApp(appointment(), {
        sender: failingSender,
        appointments: repository,
      }),
    ).rejects.toThrow("whatsapp down");

    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(false);
  });
});
