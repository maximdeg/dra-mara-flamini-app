import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the headline, lead, image, and booking CTA", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { name: /Tu Piel, Nuestra Especialidad/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cuidamos de la salud y belleza de tu piel/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Consultorio de dermatología de Mara Flamini",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Agendar visita/ }),
    ).toHaveAttribute("href", "/agendar-visita");
  });
});
