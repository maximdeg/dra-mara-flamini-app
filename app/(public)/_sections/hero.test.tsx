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
        name: "Primer plano de piel sana iluminada por luz natural",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Agendar visita/ }),
    ).toHaveAttribute("href", "/agendar-visita");
  });
});
