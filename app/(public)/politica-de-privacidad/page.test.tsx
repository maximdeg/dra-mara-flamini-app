import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PoliticaDePrivacidadPage from "./page";

describe("PoliticaDePrivacidadPage", () => {
  it("renders the title and representative section headings", () => {
    render(<PoliticaDePrivacidadPage />);

    expect(
      screen.getByRole("heading", { name: "Política de Privacidad", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Qué datos recopilamos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tus derechos como titular de datos" }),
    ).toBeInTheDocument();
  });
});
