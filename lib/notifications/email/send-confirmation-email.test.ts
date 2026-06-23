import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { InMemoryAppointmentRepository } from "../../appointments/in-memory-appointment-repository";
import { FakeEmailSender, type EmailSender } from "./email-sender";
import { sendConfirmationEmail } from "./send-confirmation-email";

function appointment(): Appointment {
  return {
    id: "apt-1",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "3421112233",
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

describe("sendConfirmationEmail", () => {
  it("sends to the Patient and records the email bookkeeping", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const sender = new FakeEmailSender();

    await sendConfirmationEmail(appointment(), {
      sender,
      appointments: repository,
      now: () => new Date("2026-06-19T12:00:00.000Z"),
    });

    expect(sender.last?.to).toBe("lucia@example.com");
    expect(sender.last?.subject).toBe("Tu cita quedó confirmada — Dra. Mara Flamini");

    const stored = await repository.findById("apt-1");
    expect(stored?.emailSent).toBe(true);
    expect(stored?.emailSentAt).toBe("2026-06-19T12:00:00.000Z");
    expect(stored?.emailMessageId).toBe("fake-email-1");
  });

  it("propagates a sender failure (Booking invokes it best-effort)", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const failingSender: EmailSender = {
      async send() {
        throw new Error("smtp down");
      },
    };

    await expect(
      sendConfirmationEmail(appointment(), {
        sender: failingSender,
        appointments: repository,
      }),
    ).rejects.toThrow("smtp down");

    const stored = await repository.findById("apt-1");
    expect(stored?.emailSent).toBe(false);
  });
});
