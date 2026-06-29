import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SEEDED_CLINIC_INFO } from "@/lib/clinic/clinic-info";
import { ToastProvider } from "@/components/ui/toast";
import { saveClinicInfoAction } from "./actions";
import { ClinicInfoEditor } from "./clinic-info-editor";

vi.mock("./actions", () => ({
  saveClinicInfoAction: vi.fn(),
}));

const saveMock = vi.mocked(saveClinicInfoAction);

function renderEditor() {
  return render(
    <ToastProvider>
      <ClinicInfoEditor initialInfo={SEEDED_CLINIC_INFO} />
    </ToastProvider>,
  );
}

describe("ClinicInfoEditor", () => {
  it("saves edited copy with a success toast", async () => {
    saveMock.mockResolvedValue(undefined);
    renderEditor();

    fireEvent.change(screen.getByLabelText("Alias"), {
      target: { value: "mara.flamini" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Información guardada.",
    );
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        senaTransfer: expect.objectContaining({ alias: "mara.flamini" }),
      }),
    );
  });

  it("adds a documentation item and includes it on save", async () => {
    saveMock.mockResolvedValue(undefined);
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Agregar documento" }));
    fireEvent.change(screen.getByLabelText("Documento 4"), {
      target: { value: "Carnet de vacunación" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await screen.findByRole("status");
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        documentation: expect.objectContaining({
          items: [
            ...SEEDED_CLINIC_INFO.documentation.items,
            "Carnet de vacunación",
          ],
        }),
      }),
    );
  });

  it("removes a documentation item on save", async () => {
    saveMock.mockResolvedValue(undefined);
    renderEditor();

    // The first "Quitar" belongs to the first documentation item.
    fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await screen.findByRole("status");
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        documentation: expect.objectContaining({
          items: SEEDED_CLINIC_INFO.documentation.items.slice(1),
        }),
      }),
    );
  });
});
