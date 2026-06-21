import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { HealthInsurance } from "@/lib/coverage/coverage";
import type { SelfPayPricing } from "@/lib/deposit/deposit";
import { ToastProvider } from "@/components/ui/toast";
import {
  addInsuranceAction,
  removeInsuranceAction,
  saveSelfPayPricingAction,
} from "./actions";
import { CoverageEditor } from "./coverage-editor";

vi.mock("./actions", () => ({
  addInsuranceAction: vi.fn(),
  editInsuranceAction: vi.fn(),
  removeInsuranceAction: vi.fn(),
  saveSelfPayPricingAction: vi.fn(),
}));

const addMock = vi.mocked(addInsuranceAction);
const removeMock = vi.mocked(removeInsuranceAction);
const savePricingMock = vi.mocked(saveSelfPayPricingAction);

const PRICING: SelfPayPricing = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
};

function renderEditor(insurances: HealthInsurance[] = []) {
  return render(
    <ToastProvider>
      <CoverageEditor initialInsurances={insurances} initialPricing={PRICING} />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("CoverageEditor", () => {
  it("saves Self-Pay prices with a success toast", async () => {
    savePricingMock.mockResolvedValue(undefined);
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Guardar precios" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Precios guardados.",
    );
    expect(savePricingMock).toHaveBeenCalledWith(PRICING);
  });

  it("adds an Obra Social and shows it in the list", async () => {
    addMock.mockResolvedValue(undefined);
    renderEditor([]);

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "OSDE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Obra social agregada.",
    );
    expect(addMock).toHaveBeenCalledWith({ name: "OSDE", price: 0, notes: "" });
    // The new row's name input reflects the optimistic add.
    expect(screen.getByDisplayValue("OSDE")).toBeInTheDocument();
  });

  it("confirms before deleting an Obra Social, then removes it", async () => {
    removeMock.mockResolvedValue(undefined);
    renderEditor([{ name: "Swiss Medical", price: 0, notes: "" }]);

    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    const dialog = screen.getByRole("dialog", {
      name: "¿Eliminar la obra social?",
    });
    expect(dialog).toHaveTextContent("Swiss Medical");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Obra social eliminada.",
    );
    expect(removeMock).toHaveBeenCalledWith("Swiss Medical");
    expect(screen.queryByDisplayValue("Swiss Medical")).not.toBeInTheDocument();
  });

  it("matches the editor structure", () => {
    const { container } = renderEditor([
      { name: "OSDE", price: 5000, notes: "Bono" },
    ]);
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
