import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";
import { CancelAppointment } from "./cancel-appointment";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function renderCancel(props: {
  isScheduled: boolean;
  withinWindow: boolean;
}) {
  return render(
    <ToastProvider>
      <CancelAppointment appointmentId="a1" {...props} />
    </ToastProvider>,
  );
}

describe("CancelAppointment", () => {
  it("renders no cancellation UI when the appointment is not scheduled", () => {
    renderCancel({ isScheduled: false, withinWindow: true });
    expect(
      screen.queryByRole("button", { name: "Cancelar cita" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Cancelación")).not.toBeInTheDocument();
    expect(screen.queryByText(/Necesitás cancelar/)).not.toBeInTheDocument();
  });

  it("explains why instead of offering the button outside the window", () => {
    renderCancel({ isScheduled: true, withinWindow: false });
    expect(screen.getByText(/24 horas antes/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancelar cita" }),
    ).not.toBeInTheDocument();
  });

  it("opens a confirmation dialog within the window", () => {
    renderCancel({ isScheduled: true, withinWindow: true });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar cita" }));
    expect(
      screen.getByRole("button", { name: "Sí, cancelar" }),
    ).toBeInTheDocument();
  });
});
