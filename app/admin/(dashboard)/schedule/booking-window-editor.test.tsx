import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";
import { saveBookingWindowLengthAction } from "./actions";
import { BookingWindowEditor } from "./booking-window-editor";

vi.mock("./actions", () => ({
  saveScheduleAction: vi.fn(),
  cancelCollisionAction: vi.fn(),
  saveVisitDurationsAction: vi.fn(),
  saveBookingWindowLengthAction: vi.fn(),
}));

const saveMock = vi.mocked(saveBookingWindowLengthAction);

function renderEditor(initial = 30) {
  return render(
    <ToastProvider>
      <BookingWindowEditor initial={initial} />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("BookingWindowEditor", () => {
  it("shows the current length", () => {
    renderEditor(90);
    expect(screen.getByLabelText("Reservas hasta")).toHaveValue("90");
  });

  it("offers two weeks up to six months, labelled in weeks and months", () => {
    renderEditor();
    const select = screen.getByLabelText("Reservas hasta") as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.text);
    expect(labels[0]).toBe("2 semanas");
    expect(labels).toContain("1 ½ meses");
    expect(labels.at(-1)).toBe("6 meses");
    expect(labels).toHaveLength(12);
  });

  it("saves the chosen number of days with a success toast", async () => {
    saveMock.mockResolvedValue({ saved: true });
    renderEditor();

    fireEvent.change(screen.getByLabelText("Reservas hasta"), {
      target: { value: "90" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar ventana de reservas" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Ventana de reservas guardada.",
    );
    expect(saveMock).toHaveBeenCalledWith(90);
  });

  it("matches the booking window editor structure", () => {
    const { container } = renderEditor();
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
