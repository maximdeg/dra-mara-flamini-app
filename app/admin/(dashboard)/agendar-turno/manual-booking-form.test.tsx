import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";
import { DEFAULT_VISIT_DURATIONS } from "@/lib/availability/visit-durations";
import { bookManuallyAction } from "./actions";
import { ManualBookingForm } from "./manual-booking-form";

vi.mock("./actions", () => ({ bookManuallyAction: vi.fn() }));

const bookMock = vi.mocked(bookManuallyAction);

function renderForm() {
  return render(
    <ToastProvider>
      <ManualBookingForm
        insurances={[{ name: "OSDE", price: 0 }]}
        durations={{ ...DEFAULT_VISIT_DURATIONS, Biopsy: 40 }}
      />
    </ToastProvider>,
  );
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
    target: { value },
  });
}

function optionLabels(label: string): string[] {
  const select = screen.getByLabelText(new RegExp(`^${label}`));
  return within(select)
    .getAllByRole("option")
    .map((option) => option.textContent ?? "");
}

function fillPlasma() {
  change("Nombre", "Lucía");
  change("Apellido", "Gómez");
  change("Teléfono", "3421112233");
  change("Tipo de visita", "Practice");
  change("Tipo de práctica", "Plasma");
  change("Obra social", "self-pay:PracticaParticular");
  change("Fecha", "2026-06-27");
  change("Hora", "20:15");
}

describe("ManualBookingForm", () => {
  beforeEach(() => bookMock.mockReset());

  it("offers Plasma under Práctica, but never under Consulta", () => {
    renderForm();

    change("Tipo de visita", "Practice");
    expect(optionLabels("Tipo de práctica")).toContain("Plasma");

    change("Tipo de visita", "Consultation");
    expect(optionLabels("Tipo de consulta")).toEqual([
      "Elegí…",
      "Primera vez",
      "Seguimiento",
    ]);
  });

  it("asks for the coverage name when Otro is chosen", () => {
    renderForm();
    change("Tipo de visita", "Practice");
    expect(screen.queryByLabelText(/^¿Cuál\?/)).toBeNull();

    change("Obra social", "other");
    expect(screen.getByLabelText(/^¿Cuál\?/)).toBeInTheDocument();
  });

  it("pre-fills the duration from the kind until it is picked by hand", () => {
    renderForm();
    change("Tipo de visita", "Practice");
    change("Tipo de práctica", "Biopsy");
    expect(screen.getByLabelText(/^Duración/)).toHaveValue("40");

    change("Duración", "90");
    change("Tipo de práctica", "Cryosurgery");
    expect(screen.getByLabelText(/^Duración/)).toHaveValue("90");
  });

  it("saves, confirms with a link to that day in Turnos, and clears the form", async () => {
    bookMock.mockResolvedValue({ ok: true, date: "2026-06-27" });
    renderForm();
    fillPlasma();

    fireEvent.click(screen.getByRole("button", { name: "Agendar turno" }));

    const toast = await screen.findByRole("status");
    expect(toast).toHaveTextContent("Turno agendado para el 27/06/2026.");
    expect(within(toast).getByRole("link", { name: "Ver en Turnos" })).toHaveAttribute(
      "href",
      "/admin/appointments?from=2026-06-27&to=2026-06-27",
    );
    expect(bookMock).toHaveBeenCalledWith({
      patientFirstName: "Lucía",
      patientLastName: "Gómez",
      patientPhone: "3421112233",
      visitType: "Practice",
      consultType: null,
      practiceType: "Plasma",
      coverage: { kind: "self-pay", variant: "PracticaParticular" },
      date: "2026-06-27",
      time: "20:15",
      durationMinutes: 20,
      whatsappConsent: true,
    });
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("");
    expect(screen.getByLabelText(/^Tipo de visita/)).toHaveValue("");
  });

  it("shows why a save was refused and keeps what was typed", async () => {
    bookMock.mockResolvedValue({ ok: false, rejection: "SlotTaken" });
    renderForm();
    fillPlasma();

    fireEvent.click(screen.getByRole("button", { name: "Agendar turno" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ese horario ya está ocupado por otro turno.",
    );
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("Lucía");
  });

  it("does not call the server while a select is still empty", () => {
    renderForm();
    change("Nombre", "Lucía");

    fireEvent.click(screen.getByRole("button", { name: "Agendar turno" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Completá el tipo de visita, su tipo y la obra social.",
    );
    expect(bookMock).not.toHaveBeenCalled();
  });
});
