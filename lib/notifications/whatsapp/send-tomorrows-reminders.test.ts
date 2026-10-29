import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { InMemoryAppointmentRepository } from "../../appointments/in-memory-appointment-repository";
import { sendTomorrowsReminders } from "./send-tomorrows-reminders";
import {
  FakeWhatsAppSender,
  type WhatsAppMessage,
  type WhatsAppSender,
} from "./whatsapp-sender";

function appointment(id: string, overrides: Partial<Appointment> = {}): Appointment {
  return {
    id,
    patientFirstName: id,
    patientLastName: "Gómez",
    patientPhone: `+54934211122${id.padStart(2, "0").slice(-2)}`,
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

// 08:00 in Argentina on Monday 2 Nov 2026, so tomorrow is 2026-11-03.
const now = () => new Date("2026-11-02T11:00:00.000Z");

async function repositoryWith(...appointments: Appointment[]) {
  const repository = new InMemoryAppointmentRepository();
  for (const a of appointments) {
    await repository.create(a);
  }
  return repository;
}

describe("sendTomorrowsReminders", () => {
  it("reminds only tomorrow's Scheduled Appointments", async () => {
    const appointments = await repositoryWith(
      appointment("tomorrow"),
      appointment("today", { date: "2026-11-02" }),
      appointment("later", { date: "2026-11-04" }),
      appointment("cancelled", { status: "cancelled" }),
    );
    const sender = new FakeWhatsAppSender();

    const summary = await sendTomorrowsReminders({ appointments, sender, now });

    expect(sender.sent.map((m) => m.params[0])).toEqual(["tomorrow"]);
    expect(summary).toEqual({ date: "2026-11-03", sent: 1, skipped: 0, failed: [] });
  });

  it("keeps going when one send fails, and reports the failure", async () => {
    const appointments = await repositoryWith(
      appointment("a", { time: "09:00" }),
      appointment("b", { time: "10:00" }),
      appointment("c", { time: "11:00" }),
    );
    const delivered: WhatsAppMessage[] = [];
    const sender: WhatsAppSender = {
      async send(message) {
        if (message.params[0] === "b") {
          throw new Error("whatsapp down");
        }
        delivered.push(message);
        return { messageId: `wamid.${message.params[0]}` };
      },
    };

    const summary = await sendTomorrowsReminders({ appointments, sender, now });

    expect(delivered.map((m) => m.params[0])).toEqual(["a", "c"]);
    expect(summary).toMatchObject({ sent: 2, failed: ["b"] });
    expect((await appointments.findById("b"))?.reminderSentAt).toBeUndefined();
  });

  it("sends nothing new on a second run the same day", async () => {
    const appointments = await repositoryWith(
      appointment("a", { time: "09:00" }),
      appointment("declined", { time: "10:00", whatsappConsentAt: null }),
    );
    const sender = new FakeWhatsAppSender();

    await sendTomorrowsReminders({ appointments, sender, now });
    const second = await sendTomorrowsReminders({ appointments, sender, now });

    expect(sender.sent).toHaveLength(1);
    expect(second).toMatchObject({ sent: 0, skipped: 2, failed: [] });
  });
});
