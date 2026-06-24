import { describe, expect, it } from "vitest";
import type { Appointment } from "../../appointments/appointment";
import { confirmationEmail } from "./confirmation";

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

const links = { manageUrl: "https://clinica.example/cita/apt-1" };

describe("confirmationEmail", () => {
  it("addresses the Patient and carries the manage link and subject", () => {
    const email = confirmationEmail(appointment(), links);

    expect(email.to).toBe("lucia@example.com");
    expect(email.subject).toBe("Tu cita quedó confirmada — Dra. Mara Flamini");
    expect(email.html).toContain("Hola Lucía, tu cita quedó confirmada");
    expect(email.html).toContain("https://clinica.example/cita/apt-1");
    expect(email.html).toContain("24 horas antes");
    expect(email.text).toContain("Ver o cancelar tu cita: https://clinica.example/cita/apt-1");
  });

  it("renders a health-insurance confirmation without a seña row", () => {
    const email = confirmationEmail(appointment(), links);

    expect(email.html).not.toContain("Seña");
    expect(email).toMatchSnapshot();
  });

  it("renders a self-pay practice confirmation with the seña amount", () => {
    const email = confirmationEmail(
      appointment({
        visitType: "Practice",
        consultType: null,
        practiceType: "Biopsy",
        coverage: { kind: "self-pay", variant: "PracticaParticular" },
        deposit: { amount: 35000, acknowledged: true },
      }),
      { manageUrl: "https://clinica.example/cita/apt-2" },
    );

    expect(email.html).toContain("Seña");
    expect(email.html).toContain("$35.000");
    expect(email.html).toContain("Biopsia");
    expect(email).toMatchSnapshot();
  });
});
