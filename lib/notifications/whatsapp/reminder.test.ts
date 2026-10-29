import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { NO_INSTRUCTIONS_FALLBACK } from "./appointment-params";
import { reminderWhatsApp } from "./reminder";

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt-1",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "+5493421112233",
    patientEmail: null,
    visitType: "Practice",
    consultType: null,
    practiceType: "Biopsy",
    coverage: { kind: "health-insurance", name: "SANCOR" },
    coverageInstructions: "Traer carnet y orden autorizada",
    deposit: null,
    date: "2026-11-03",
    time: "12:30",
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

const links = { manageUrl: "https://clinic.example/cita/apt-1" };

describe("reminderWhatsApp", () => {
  it("targets the approved confirmation_reminder template in es_AR, to the Patient", () => {
    const message = reminderWhatsApp(appointment(), links);
    expect(message.to).toBe("+5493421112233");
    expect(message.templateName).toBe("confirmation_reminder");
    expect(message.language).toBe("es_AR");
  });

  it("fills the seven body parameters in {{1}}…{{7}} order", () => {
    expect(reminderWhatsApp(appointment(), links).params).toEqual([
      "Lucía", // {{1}} nombre
      "03/11/2026", // {{2}} fecha
      "12:30", // {{3}} hora
      "Práctica · Biopsia", // {{4}} tipo
      "SANCOR", // {{5}} obra social
      "Traer carnet y orden autorizada", // {{6}} notas
      "https://clinic.example/cita/apt-1", // {{7}} enlace
    ]);
  });

  it("never sends empty notes: falls back when Instructions are empty or absent", () => {
    expect(
      reminderWhatsApp(appointment({ coverageInstructions: "" }), links).params[5],
    ).toBe(NO_INSTRUCTIONS_FALLBACK);
    expect(
      reminderWhatsApp(appointment({ coverageInstructions: undefined }), links)
        .params[5],
    ).toBe(NO_INSTRUCTIONS_FALLBACK);
  });
});
