import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Appointment } from "@/lib/appointments/appointment";
import { AppointmentDetails } from "./appointment-details";

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

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("AppointmentDetails", () => {
  it("shows the Status badge matching the derived Status", () => {
    render(<AppointmentDetails
        appointment={APPOINTMENT}
        status="scheduled"
        emailNotificationsEnabled={false}
      />);
    expect(screen.getByText("Agendada")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cita confirmada" }),
    ).toBeInTheDocument();
  });

  it("titles a cancelled Appointment as cancelled", () => {
    render(<AppointmentDetails
        appointment={APPOINTMENT}
        status="cancelled"
        emailNotificationsEnabled={false}
      />);
    expect(
      screen.getByRole("heading", { name: "Cita cancelada" }),
    ).toBeInTheDocument();
  });

  it("shows the email confirmation status when email notifications are on (Pendiente when not sent, Enviada when sent)", () => {
    const { rerender } = render(
      <AppointmentDetails
        appointment={APPOINTMENT}
        status="scheduled"
        emailNotificationsEnabled
      />,
    );
    const emailRow = screen.getByText("Confirmación por email").closest("div");
    expect(emailRow).toHaveTextContent("Pendiente");

    rerender(
      <AppointmentDetails
        appointment={{ ...APPOINTMENT, emailSent: true }}
        status="scheduled"
        emailNotificationsEnabled
      />,
    );
    expect(
      screen.getByText("Confirmación por email").closest("div"),
    ).toHaveTextContent("Enviada");
  });

  it("hides the email confirmation row when email notifications are off", () => {
    render(
      <AppointmentDetails
        appointment={APPOINTMENT}
        status="scheduled"
        emailNotificationsEnabled={false}
      />,
    );
    expect(screen.queryByText("Confirmación por email")).not.toBeInTheDocument();
    expect(screen.getByText("Confirmación por WhatsApp")).toBeInTheDocument();
  });

  it("shows the Email row only when the Patient gave an email", () => {
    const { rerender } = render(
      <AppointmentDetails
        appointment={APPOINTMENT}
        status="scheduled"
        emailNotificationsEnabled={false}
      />,
    );
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();

    rerender(
      <AppointmentDetails
        appointment={{ ...APPOINTMENT, patientEmail: null }}
        status="scheduled"
        emailNotificationsEnabled={false}
      />,
    );
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("matches the confirmation details structure", () => {
    const { container } = render(
      <AppointmentDetails
        appointment={APPOINTMENT}
        status="scheduled"
        emailNotificationsEnabled={false}
      />,
    );
    expect(withoutClasses(container.innerHTML)).toMatchSnapshot();
  });
});
