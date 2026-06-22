import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { cancelLink, composeNotifications } from "./compose";
import type { EmailNotification, WhatsAppNotification } from "./notification";

const BASE_URL = "https://maraflamini.com";

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
    createdAt: "2026-06-19T11:55:00.000Z",
    ...overrides,
  };
}

function byChannel(appt: Appointment, kind: "confirmation" | "cancellation-notice") {
  const notifications = composeNotifications(appt, kind, BASE_URL);
  const whatsapp = notifications.find((n) => n.channel === "whatsapp") as
    | WhatsAppNotification
    | undefined;
  const email = notifications.find((n) => n.channel === "email") as
    | EmailNotification
    | undefined;
  return { notifications, whatsapp, email };
}

describe("composeNotifications", () => {
  it("produces one WhatsApp and one Email Notification, addressed to the right recipient", () => {
    const { notifications, whatsapp, email } = byChannel(
      appointment(),
      "confirmation",
    );

    expect(notifications).toHaveLength(2);
    expect(whatsapp?.recipient).toBe("3421112233");
    expect(email?.recipient).toBe("lucia@example.com");
    expect(notifications.every((n) => n.appointmentId === "apt-1")).toBe(true);
  });

  it("includes the Appointment details in Spanish in the WhatsApp body", () => {
    const { whatsapp } = byChannel(appointment(), "confirmation");
    const text = whatsapp?.message.text ?? "";

    expect(text).toContain("Hola Lucía,");
    expect(text).toContain("Tu cita quedó confirmada.");
    expect(text).toContain("Fecha: 2026-06-22");
    expect(text).toContain("Hora: 09:30");
    expect(text).toContain("Tipo de visita: Consulta");
    expect(text).toContain("Tipo de consulta: Primera vez");
    expect(text).toContain("Cobertura: OSDE");
  });

  it("includes the cancel link in a Confirmation", () => {
    const { whatsapp, email } = byChannel(appointment(), "confirmation");

    expect(whatsapp?.message.text).toContain(
      "https://maraflamini.com/cita/apt-1",
    );
    expect(email?.message.html).toContain(
      'href="https://maraflamini.com/cita/apt-1"',
    );
  });

  it("omits the cancel link from a Cancellation Notice", () => {
    const { whatsapp, email } = byChannel(appointment(), "cancellation-notice");

    expect(whatsapp?.message.text).toContain("Tu cita fue cancelada.");
    expect(whatsapp?.message.text).not.toContain("/cita/");
    expect(whatsapp?.message.text).not.toContain("Para cancelar");
    expect(email?.message.html).not.toContain("/cita/");
  });

  it("shows the Practice Type and the acknowledged Deposit when they apply", () => {
    const { whatsapp } = byChannel(
      appointment({
        visitType: "Practice",
        consultType: null,
        practiceType: "Cryosurgery",
        coverage: { kind: "self-pay", variant: "PracticaParticular" },
        deposit: { amount: 35000, acknowledged: true },
      }),
      "confirmation",
    );
    const text = whatsapp?.message.text ?? "";

    expect(text).toContain("Tipo de práctica: Criocirugía");
    expect(text).toContain("Cobertura: Practica Particular");
    expect(text).toContain("Seña: $35.000 (confirmada)");
  });

  it("gives the Email a subject with the date and time, and reuses the text body", () => {
    const { whatsapp, email } = byChannel(appointment(), "confirmation");

    expect(email?.message.subject).toBe(
      "Confirmación de tu cita - 2026-06-22 09:30",
    );
    expect(email?.message.text).toBe(whatsapp?.message.text);
    expect(email?.message.html).toContain("<li>");
  });

  it("escapes HTML in user/seed-provided values", () => {
    const { email } = byChannel(
      appointment({ coverage: { kind: "health-insurance", name: "A & B <Salud>" } }),
      "confirmation",
    );

    expect(email?.message.html).toContain("A &amp; B &lt;Salud&gt;");
    expect(email?.message.html).not.toContain("<Salud>");
  });
});

describe("cancelLink", () => {
  it("builds the public cita URL", () => {
    expect(cancelLink("apt-9", "https://maraflamini.com")).toBe(
      "https://maraflamini.com/cita/apt-9",
    );
  });

  it("does not double the slash when the base URL has a trailing slash", () => {
    expect(cancelLink("apt-9", "https://maraflamini.com/")).toBe(
      "https://maraflamini.com/cita/apt-9",
    );
  });
});
