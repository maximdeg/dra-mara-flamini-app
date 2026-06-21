import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";
import {
  addUnavailableDayAction,
  cancelCollisionAction,
  removeUnavailableDayAction,
} from "./actions";
import { UnavailableDaysManager } from "./unavailable-days-manager";

vi.mock("./actions", () => ({
  addUnavailableDayAction: vi.fn(),
  removeUnavailableDayAction: vi.fn(),
  cancelCollisionAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const addMock = vi.mocked(addUnavailableDayAction);
const removeMock = vi.mocked(removeUnavailableDayAction);

function renderManager(days: string[] = ["2026-06-25"]) {
  return render(
    <ToastProvider>
      <UnavailableDaysManager days={days} />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("UnavailableDaysManager", () => {
  it("adds a day and shows a success toast", async () => {
    addMock.mockResolvedValue({ ok: true });
    renderManager([]);

    fireEvent.change(screen.getByLabelText("Fecha a bloquear"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar día no laborable" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent("Día agregado.");
    expect(addMock).toHaveBeenCalledWith("2026-07-01");
  });

  it("confirms before removing a day, then removes it", async () => {
    removeMock.mockResolvedValue({ ok: true });
    renderManager(["2026-06-25"]);

    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    const dialog = screen.getByRole("dialog", { name: "¿Quitar este día?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Quitar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Día quitado.");
    expect(removeMock).toHaveBeenCalledWith("2026-06-25");
  });

  it("opens a dialog when the added day collides with appointments", async () => {
    addMock.mockResolvedValue({
      collisions: [
        {
          id: "x1",
          date: "2026-07-01",
          time: "10:00",
          patientName: "Ana García",
        },
      ],
    });
    renderManager([]);

    fireEvent.change(screen.getByLabelText("Fecha a bloquear"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar día no laborable" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "No se puede bloquear el día",
    });
    expect(dialog).toHaveTextContent("Ana García");
  });

  it("matches the manager structure", () => {
    const { container } = renderManager(["2026-06-25"]);
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
