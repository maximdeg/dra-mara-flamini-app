import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_VISIT_DURATIONS } from "@/lib/availability/visit-durations";
import { ToastProvider } from "@/components/ui/toast";
import { saveVisitDurationsAction } from "./actions";
import { DurationsEditor } from "./durations-editor";

vi.mock("./actions", () => ({
  saveScheduleAction: vi.fn(),
  cancelCollisionAction: vi.fn(),
  saveVisitDurationsAction: vi.fn(),
}));

const saveMock = vi.mocked(saveVisitDurationsAction);

function renderEditor() {
  return render(
    <ToastProvider>
      <DurationsEditor initial={{ ...DEFAULT_VISIT_DURATIONS, Biopsy: 40 }} />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("DurationsEditor", () => {
  it("shows one duration per Visit Kind", () => {
    renderEditor();
    expect(screen.getByLabelText("Consulta · Primera vez")).toHaveValue("20");
    expect(screen.getByLabelText("Práctica · Biopsia")).toHaveValue("40");
  });

  it("offers 10 to 120 minutes", () => {
    renderEditor();
    const select = screen.getByLabelText(
      "Consulta · Seguimiento",
    ) as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values[0]).toBe("10");
    expect(values.at(-1)).toBe("120");
  });

  it("saves the edited durations with a success toast", async () => {
    saveMock.mockResolvedValue({ saved: true });
    renderEditor();

    fireEvent.change(screen.getByLabelText("Consulta · Primera vez"), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar duraciones" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Duraciones guardadas.",
    );
    expect(saveMock).toHaveBeenCalledWith({
      ...DEFAULT_VISIT_DURATIONS,
      FirstVisit: 30,
      Biopsy: 40,
    });
  });

  it("matches the durations editor structure", () => {
    const { container } = renderEditor();
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
