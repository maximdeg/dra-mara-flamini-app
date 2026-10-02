import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { WorkSchedule } from "@/lib/availability/work-schedule";
import { ToastProvider } from "@/components/ui/toast";
import { cancelCollisionAction, saveScheduleAction } from "./actions";
import { ScheduleEditor } from "./schedule-editor";

vi.mock("./actions", () => ({
  saveScheduleAction: vi.fn(),
  cancelCollisionAction: vi.fn(),
}));

const saveMock = vi.mocked(saveScheduleAction);
const cancelMock = vi.mocked(cancelCollisionAction);

const INITIAL: WorkSchedule = [
  { weekday: "monday", isWorkingDay: true, ranges: [{ start: "09:00", end: "13:00" }] },
];

function renderEditor() {
  return render(
    <ToastProvider>
      <ScheduleEditor initial={INITIAL} />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("ScheduleEditor", () => {
  it("shows a success toast after saving", async () => {
    saveMock.mockResolvedValue({ saved: true });
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Guardar horarios" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Horarios guardados.",
    );
  });

  it("opens a dialog for collisions and clears them by cancelling", async () => {
    saveMock.mockResolvedValue({
      collisions: [
        {
          id: "x1",
          date: "2026-06-22",
          time: "09:20",
          patientName: "Ana García",
        },
      ],
    });
    cancelMock.mockResolvedValue({ ok: true });
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Guardar horarios" }));

    const dialog = await screen.findByRole("dialog", {
      name: "No se puede reducir la agenda",
    });
    expect(dialog).toHaveTextContent("Ana García");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar turno" }));

    expect(
      await screen.findByText(/Conflictos resueltos/),
    ).toBeInTheDocument();
    expect(cancelMock).toHaveBeenCalledWith("x1");
  });

  describe("Visit Kinds per range", () => {
    it("shows a range saved before kinds existed as open to every kind", () => {
      renderEditor();
      expect(screen.getByText("Todos los tipos")).toBeInTheDocument();
    });

    it("restricts a range to the ticked kinds and saves them", async () => {
      saveMock.mockResolvedValue({ saved: true });
      renderEditor();

      fireEvent.click(screen.getByRole("button", { name: "Elegir tipos" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Práctica" }));
      fireEvent.click(screen.getByRole("button", { name: "Guardar horarios" }));

      await screen.findByRole("status");
      expect(saveMock).toHaveBeenCalledWith([
        expect.objectContaining({
          weekday: "monday",
          ranges: [
            { start: "09:00", end: "13:00", kinds: ["FirstVisit", "FollowUp"] },
          ],
        }),
        ...Array(6).fill(expect.anything()),
      ]);
    });

    it("toggles a whole group, showing it as partly ticked in between", () => {
      renderEditor();
      fireEvent.click(screen.getByRole("button", { name: "Elegir tipos" }));
      const practice = screen.getByRole("checkbox", { name: "Práctica" });

      fireEvent.click(practice);
      expect(screen.getByRole("checkbox", { name: "Biopsia" })).not.toBeChecked();

      fireEvent.click(screen.getByRole("checkbox", { name: "Biopsia" }));
      expect((practice as HTMLInputElement).indeterminate).toBe(true);

      fireEvent.click(practice);
      expect(practice).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Criocirugía" })).toBeChecked();
    });

    it("refuses to save a range that accepts no kind", async () => {
      saveMock.mockClear();
      renderEditor();
      fireEvent.click(screen.getByRole("button", { name: "Elegir tipos" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Consulta" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Práctica" }));

      fireEvent.click(screen.getByRole("button", { name: "Guardar horarios" }));

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Cada rango necesita al menos un tipo de visita.",
      );
      expect(saveMock).not.toHaveBeenCalled();
    });
  });

  describe("10-minute grid", () => {
    it("steps the time inputs by 10 minutes", () => {
      renderEditor();
      expect(screen.getByLabelText("Desde")).toHaveAttribute("step", "600");
      expect(screen.getByLabelText("Hasta")).toHaveAttribute("step", "600");
    });

    it("refuses to save a time off the grid", async () => {
      saveMock.mockClear();
      renderEditor();
      fireEvent.change(screen.getByLabelText("Desde"), {
        target: { value: "09:05" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Guardar horarios" }));

      expect(await screen.findByRole("status")).toHaveTextContent(
        "Usá horarios en múltiplos de 10 minutos",
      );
      expect(saveMock).not.toHaveBeenCalled();
    });
  });

  it("matches the editor structure", () => {
    const { container } = renderEditor();
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
