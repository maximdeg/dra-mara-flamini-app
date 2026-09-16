import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { cancellationWhatsApp } from "./cancellation";

function appointment(overrides: Partial<Appointment> = {}): Appointment {
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
    ...overrides,
  };
}

describe("cancellationWhatsApp", () => {
  it("uses the doctor's template when the Professional cancels", () => {
    const message = cancellationWhatsApp(appointment(), "professional");
    expect(message.templateName).toBe("appointment_cancellation_by_doctor");
    expect(message.language).toBe("es_AR");
  });

  it("uses the Patient's template when the Patient cancels", () => {
    const message = cancellationWhatsApp(appointment(), "patient");
    expect(message.templateName).toBe("appointment_cancellation_by_patient1");
    expect(message.language).toBe("es_AR");
  });

  it("always goes to the Patient's phone", () => {
    for (const actor of ["patient", "professional"] as const) {
      expect(cancellationWhatsApp(appointment(), actor).to).toBe(
        "+5493421112233",
      );
    }
  });

  it("fills the three body parameters in {{1}}…{{3}} order", () => {
    const message = cancellationWhatsApp(appointment(), "professional");
    expect(message.params).toEqual([
      "Lucía", // {{1}} nombre
      "22/06/2026", // {{2}} fecha (DD/MM/YYYY)
      "09:30", // {{3}} hora
    ]);
  });

  it("sends the same parameters regardless of actor — only the copy differs", () => {
    expect(cancellationWhatsApp(appointment(), "patient").params).toEqual(
      cancellationWhatsApp(appointment(), "professional").params,
    );
  });

  it("never emits a newline or a 4+ space run in any parameter", () => {
    for (const actor of ["patient", "professional"] as const) {
      for (const param of cancellationWhatsApp(appointment(), actor).params) {
        expect(param).not.toMatch(/\n/);
        expect(param).not.toMatch(/ {4,}/);
      }
    }
  });
});
