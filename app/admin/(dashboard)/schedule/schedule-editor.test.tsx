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

  it("matches the editor structure", () => {
    const { container } = renderEditor();
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
