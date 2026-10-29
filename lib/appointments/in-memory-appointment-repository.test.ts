import { describe, expect, it } from "vitest";
import type { Appointment } from "./appointment";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";

function appointment(id: string): Appointment {
  return {
    id,
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
    whatsappSentAt: "2026-10-20T12:00:00.000Z",
    whatsappMessageId: "wamid.confirmation",
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-10-20T12:00:00.000Z",
  };
}

describe("InMemoryAppointmentRepository.markReminderSent", () => {
  it("records the Reminder on that Appointment only", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment("a"));
    await repository.create(appointment("b"));

    await repository.markReminderSent("a", "2026-11-02T11:00:00.000Z", "wamid.r");

    const reminded = await repository.findById("a");
    expect(reminded?.reminderSentAt).toBe("2026-11-02T11:00:00.000Z");
    expect(reminded?.reminderMessageId).toBe("wamid.r");
    // The Confirmation bookkeeping is untouched.
    expect(reminded?.whatsappMessageId).toBe("wamid.confirmation");
    expect((await repository.findById("b"))?.reminderSentAt).toBeUndefined();
  });
});
