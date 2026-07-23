import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TerminosYCondicionesPage from "./page";

describe("TerminosYCondicionesPage", () => {
  it("renders the title and representative section headings", () => {
    render(<TerminosYCondicionesPage />);

    expect(
      screen.getByRole("heading", { name: "Términos y Condiciones", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Descripción del servicio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ley aplicable y jurisdicción" }),
    ).toBeInTheDocument();
  });
});
