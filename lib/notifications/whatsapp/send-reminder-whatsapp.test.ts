import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { InMemoryAppointmentRepository } from "../../appointments/in-memory-appointment-repository";
import { sendReminderWhatsApp } from "./send-reminder-whatsapp";
import { FakeWhatsAppSender, type WhatsAppSender } from "./whatsapp-sender";

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt-1",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "+5493421112233",
    patientEmail: null,
    visitType: "Consultation",
    consultType: "FollowUp",
    practiceType: null,
    coverage: { kind: "health-insurance", name: "OSDE" },
    deposit: null,
    date: "2026-11-03",
    time: "09:30",
    status: "scheduled",
    whatsappSent: true,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-10-20T12:00:00.000Z",
    ...overrides,
  };
}

const now = () => new Date("2026-11-02T11:00:00.000Z");

async function setup(apt: Appointment, sender: WhatsAppSender = new FakeWhatsAppSender()) {
  const appointments = new InMemoryAppointmentRepository();
  await appointments.create(apt);
  return { appointments, sender, now };
}

describe("sendReminderWhatsApp", () => {
  it("sends the Reminder and records it on the Appointment", async () => {
    const sender = new FakeWhatsAppSender();
    const deps = await setup(appointment(), sender);

    const outcome = await sendReminderWhatsApp(appointment(), deps);

    expect(outcome).toBe("sent");
    expect(sender.last?.templateName).toBe("confirmation_reminder");
    expect(sender.last?.to).toBe("+5493421112233");
    expect(sender.last?.params.at(-1)).toMatch(/\/cita\/apt-1$/);
    const stored = await deps.appointments.findById("apt-1");
    expect(stored?.reminderSentAt).toBe("2026-11-02T11:00:00.000Z");
    expect(stored?.reminderMessageId).toBe("fake-whatsapp-1");
  });

  it("skips a Patient who declined WhatsApp", async () => {
    const sender = new FakeWhatsAppSender();
    const declined = appointment({ whatsappConsentAt: null });
    const deps = await setup(declined, sender);

    expect(await sendReminderWhatsApp(declined, deps)).toBe("skipped");
    expect(sender.sent).toHaveLength(0);
  });

  it("skips an Appointment that was already reminded", async () => {
    const sender = new FakeWhatsAppSender();
    const reminded = appointment({ reminderSentAt: "2026-11-02T11:00:00.000Z" });
    const deps = await setup(reminded, sender);

    expect(await sendReminderWhatsApp(reminded, deps)).toBe("skipped");
    expect(sender.sent).toHaveLength(0);
  });

  it("propagates a sender failure and records nothing", async () => {
    const failing: WhatsAppSender = {
      async send() {
        throw new Error("whatsapp down");
      },
    };
    const deps = await setup(appointment(), failing);

    await expect(sendReminderWhatsApp(appointment(), deps)).rejects.toThrow(
      "whatsapp down",
    );
    expect((await deps.appointments.findById("apt-1"))?.reminderSentAt).toBeUndefined();
  });
});
