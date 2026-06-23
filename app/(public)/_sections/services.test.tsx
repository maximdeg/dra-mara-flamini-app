import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Services } from "./services";

describe("Services", () => {
  it("renders the heading and the three service cards", () => {
    render(<Services />);

    expect(
      screen.getByRole("heading", { name: "Nuestros Servicios" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ofrecemos una amplia gama de servicios/),
    ).toBeInTheDocument();

    for (const title of [
      "Dermatología General",
      "Dermatología Estética",
      "Cirugía Dermatológica",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });
});
