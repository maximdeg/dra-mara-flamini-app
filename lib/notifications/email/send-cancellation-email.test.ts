import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { FakeEmailSender, type EmailSender } from "./email-sender";
import { sendCancellationEmail } from "./send-cancellation-email";

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

describe("sendCancellationEmail", () => {
  it("sends the actor-aware Cancellation email to the Patient", async () => {
    const sender = new FakeEmailSender();

    await sendCancellationEmail(appointment(), "professional", { sender });

    expect(sender.last?.to).toBe("lucia@example.com");
    expect(sender.last?.subject).toBe("Tu cita fue cancelada — Dra. Mara Flamini");
    expect(sender.last?.html).toContain("el consultorio debió cancelar tu cita");
  });

  it("propagates a sender failure (Cancellation invokes it best-effort)", async () => {
    const failingSender: EmailSender = {
      async send() {
        throw new Error("smtp down");
      },
    };

    await expect(
      sendCancellationEmail(appointment(), "patient", { sender: failingSender }),
    ).rejects.toThrow("smtp down");
  });
});
