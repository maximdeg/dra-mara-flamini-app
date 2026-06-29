import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Appointment } from "@/lib/appointments/appointment";
import { SEEDED_CLINIC_INFO } from "@/lib/clinic/clinic-info";
import { AppointmentInfo } from "./appointment-info";

const APPOINTMENT: Appointment = {
  id: "abc123",
  patientFirstName: "Ana",
  patientLastName: "García",
  patientPhone: "+5493415551234",
  patientEmail: "ana@example.com",
  visitType: "Consultation",
  consultType: "FirstVisit",
  practiceType: null,
  coverage: { kind: "self-pay", variant: "Particular" },
  deposit: { amount: 20000, acknowledged: true },
  date: "2026-06-22",
  time: "09:20",
  status: "scheduled",
  whatsappSent: true,
  whatsappSentAt: "2026-06-20T12:00:00.000Z",
  whatsappMessageId: "msg-1",
  emailSent: false,
  emailSentAt: null,
  emailMessageId: null,
  createdAt: "2026-06-20T11:59:00.000Z",
};

describe("AppointmentInfo", () => {
  it("shows prep info, contact, and the seña box for a scheduled deposit appointment", () => {
    render(
      <AppointmentInfo
        appointment={APPOINTMENT}
        status="scheduled"
        clinicInfo={SEEDED_CLINIC_INFO}
      />,
    );

    expect(screen.getByText(/Llegá 15 minutos antes/)).toBeInTheDocument();
    for (const item of SEEDED_CLINIC_INFO.documentation.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    expect(screen.getByText("Cancelación")).toBeInTheDocument();

    expect(screen.getByText("Contacto")).toBeInTheDocument();
    expect(
      screen.getByText(SEEDED_CLINIC_INFO.contact.contacts[0].name),
    ).toBeInTheDocument();

    expect(screen.getByText(/Seña: \$20\.000/)).toBeInTheDocument();
    expect(
      screen.getByText(SEEDED_CLINIC_INFO.senaTransfer.alias),
    ).toBeInTheDocument();
  });

  it("omits prep info and the seña box when cancelled, but keeps contact", () => {
    render(
      <AppointmentInfo
        appointment={APPOINTMENT}
        status="cancelled"
        clinicInfo={SEEDED_CLINIC_INFO}
      />,
    );

    expect(screen.queryByText(/Llegá 15 minutos antes/)).not.toBeInTheDocument();
    expect(screen.queryByText("Cancelación")).not.toBeInTheDocument();
    expect(screen.queryByText(/Seña:/)).not.toBeInTheDocument();
    expect(screen.getByText("Contacto")).toBeInTheDocument();
  });

  it("omits the seña box when the appointment has no deposit", () => {
    render(
      <AppointmentInfo
        appointment={{ ...APPOINTMENT, deposit: null }}
        status="scheduled"
        clinicInfo={SEEDED_CLINIC_INFO}
      />,
    );

    expect(screen.queryByText(/Seña:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Llegá 15 minutos antes/)).toBeInTheDocument();
  });
});
