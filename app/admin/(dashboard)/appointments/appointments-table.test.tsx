import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Appointment } from "@/lib/appointments/appointment";
import type { AppointmentView } from "@/lib/appointments/appointment-listing";
import { ToastProvider } from "@/components/ui/toast";
import { cancelAppointmentAsProfessional } from "./actions";
import { AppointmentsTable } from "./appointments-table";
import { CancelAppointmentButton } from "./cancel-appointment-button";

vi.mock("./actions", () => ({ cancelAppointmentAsProfessional: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const cancelMock = vi.mocked(cancelAppointmentAsProfessional);

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "a1",
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
    ...overrides,
  };
}

const VIEWS: AppointmentView[] = [
  { appointment: appointment(), status: "scheduled" },
  {
    appointment: appointment({ id: "a2", status: "cancelled" }),
    status: "cancelled",
  },
];

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("AppointmentsTable", () => {
  it("matches the table structure", () => {
    const { container } = render(
      <ToastProvider>
        <AppointmentsTable views={VIEWS} />
      </ToastProvider>,
    );
    expect(withoutClasses(container.innerHTML)).toMatchSnapshot();
  });

  it("offers a cancel action only for a scheduled row", () => {
    render(
      <ToastProvider>
        <AppointmentsTable views={VIEWS} />
      </ToastProvider>,
    );
    // One scheduled row → exactly one Cancelar button.
    expect(screen.getAllByRole("button", { name: "Cancelar" })).toHaveLength(1);
  });
});

describe("CancelAppointmentButton", () => {
  it("confirms in a dialog, calls the action, and reports success", async () => {
    cancelMock.mockResolvedValue(undefined);
    render(
      <ToastProvider>
        <CancelAppointmentButton appointmentId="a1" patientName="Ana García" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(
      screen.getByRole("dialog", { name: "¿Cancelar el turno?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Turno cancelado. Se notificó al paciente.",
    );
    expect(cancelMock).toHaveBeenCalledWith("a1");
  });
});
