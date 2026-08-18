import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { confirmationWhatsApp } from "./confirmation";

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
    status: "scheduled",
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

const links = { manageUrl: "https://clinic.example/cita/apt-1" };

describe("confirmationWhatsApp", () => {
  it("targets the approved template in es_AR, sent to the Patient's phone", () => {
    const message = confirmationWhatsApp(appointment(), links);
    expect(message.to).toBe("+5493421112233");
    expect(message.templateName).toBe("appointment_confirmation_1");
    expect(message.language).toBe("es_AR");
  });

  it("fills all six body parameters in {{1}}…{{6}} order", () => {
    const message = confirmationWhatsApp(appointment(), links);
    expect(message.params).toEqual([
      "Lucía", // {{1}} nombre
      "22/06/2026", // {{2}} fecha (formatted DD/MM/YYYY)
      "09:30", // {{3}} hora
      "Consulta · Primera vez", // {{4}} tipo
      "OSDE", // {{5}} obra social
      "https://clinic.example/cita/apt-1", // {{6}} enlace
    ]);
  });

  it("uses the practice sub-type label for a Practice visit", () => {
    const message = confirmationWhatsApp(
      appointment({
        visitType: "Practice",
        consultType: null,
        practiceType: "Biopsy",
      }),
      links,
    );
    expect(message.params[3]).toBe("Práctica · Biopsia");
  });

  it("labels a self-pay coverage rather than an insurer name", () => {
    const message = confirmationWhatsApp(
      appointment({ coverage: { kind: "self-pay", variant: "Particular" } }),
      links,
    );
    expect(message.params[4]).toBe("Particular");
  });

  it("never emits a newline or a 4+ space run in any parameter (Cloud API rejects them)", () => {
    const message = confirmationWhatsApp(appointment(), links);
    for (const param of message.params) {
      expect(param).not.toMatch(/\n/);
      expect(param).not.toMatch(/ {4,}/);
    }
  });
});
