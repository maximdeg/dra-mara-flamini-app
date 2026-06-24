import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { cancellationEmail } from "./cancellation";

function appointment(overrides: Partial<Appointment> = {}): Appointment {
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
    ...overrides,
  };
}

const links = { rebookUrl: "https://clinica.example/agendar-visita" };

describe("cancellationEmail", () => {
  it("carries the recipient, subject, and rebook link", () => {
    const email = cancellationEmail(appointment(), "patient", links);

    expect(email.to).toBe("lucia@example.com");
    expect(email.subject).toBe("Tu cita fue cancelada — Dra. Mara Flamini");
    expect(email.html).toContain("https://clinica.example/agendar-visita");
    expect(email.text).toContain(
      "Podés reservar un nuevo turno cuando quieras. https://clinica.example/agendar-visita",
    );
  });

  it("reads as an acknowledgement when the Patient cancelled", () => {
    const email = cancellationEmail(appointment(), "patient", links);

    expect(email.html).toContain("confirmamos la cancelación de tu cita");
    expect(email.html).not.toContain("lamentamos");
    expect(email).toMatchSnapshot();
  });

  it("reads as an apology when the clinic cancelled", () => {
    const email = cancellationEmail(appointment(), "professional", links);

    expect(email.html).toContain(
      "el consultorio debió cancelar tu cita",
    );
    expect(email.html).toContain("Disculpá las molestias");
    expect(email).toMatchSnapshot();
  });
});
