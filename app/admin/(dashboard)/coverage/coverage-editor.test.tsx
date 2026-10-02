import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { HealthInsurance } from "@/lib/coverage/coverage";
import type { SelfPayPricing } from "@/lib/deposit/deposit";
import { ToastProvider } from "@/components/ui/toast";
import {
  addInsuranceAction,
  editInsuranceAction,
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
const editMock = vi.mocked(editInsuranceAction);
const removeMock = vi.mocked(removeInsuranceAction);
const savePricingMock = vi.mocked(saveSelfPayPricingAction);

const PRICING: SelfPayPricing = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
  instructions: { Particular: "Efectivo", PracticaParticular: "" },
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

  it("saves each Self-Pay variant's Indicaciones with the prices", async () => {
    savePricingMock.mockResolvedValue(undefined);
    renderEditor();

    fireEvent.change(
      screen.getByLabelText(
        "Practica Particular — indicaciones para el paciente",
      ),
      { target: { value: "Traer   estudios previos" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar precios" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Precios guardados.",
    );
    expect(savePricingMock).toHaveBeenCalledWith({
      ...PRICING,
      instructions: {
        Particular: "Efectivo",
        PracticaParticular: "Traer estudios previos",
      },
    });
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
    expect(addMock).toHaveBeenCalledWith({ name: "OSDE", price: 0, notes: "", instructions: "" });
    // The new row's name input reflects the optimistic add.
    expect(screen.getByDisplayValue("OSDE")).toBeInTheDocument();
  });

  it("adds an Obra Social with Indicaciones, flattened to one clean line", async () => {
    addMock.mockResolvedValue(undefined);
    renderEditor([]);

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "OSDE" },
    });
    fireEvent.change(screen.getByLabelText("Indicaciones para el paciente"), {
      target: { value: "  Traer carnet     y orden  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Obra social agregada.",
    );
    expect(addMock).toHaveBeenCalledWith({
      name: "OSDE",
      price: 0,
      notes: "",
      instructions: "Traer carnet y orden",
    });
  });

  it("counts Indicaciones characters against the 300 limit", () => {
    renderEditor([]);
    const input = screen.getByLabelText("Indicaciones para el paciente");
    expect(input).toHaveAttribute("maxLength", "300");
    expect(input.closest("div")).toHaveTextContent("0/300");

    fireEvent.change(input, { target: { value: "Traer carnet" } });

    expect(input.closest("div")).toHaveTextContent("12/300");
  });

  it("edits the Indicaciones of an Obra Social", async () => {
    editMock.mockResolvedValue(undefined);
    renderEditor([
      { name: "OSDE", price: 0, notes: "interna", instructions: "Traer carnet" },
    ]);
    const [rowInstructions] = screen.getAllByLabelText(
      "Indicaciones para el paciente",
    );
    expect(rowInstructions).toHaveValue("Traer carnet");

    fireEvent.change(rowInstructions, {
      target: { value: "Coseguro $2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Obra social actualizada.",
    );
    expect(editMock).toHaveBeenCalledWith("OSDE", {
      name: "OSDE",
      price: 0,
      notes: "interna",
      instructions: "Coseguro $2000",
    });
  });

  it("confirms before deleting an Obra Social, then removes it", async () => {
    removeMock.mockResolvedValue(undefined);
    renderEditor([{ name: "Swiss Medical", price: 0, notes: "", instructions: "" }]);

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
      { name: "OSDE", price: 5000, notes: "Bono", instructions: "" },
    ]);
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
