import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaBand } from "./cta-band";

describe("CtaBand", () => {
  it("renders the closing heading and a booking CTA", () => {
    render(<CtaBand />);

    expect(
      screen.getByRole("heading", { name: "¿Listo para Cuidar tu Piel?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Agendar visita/ }),
    ).toHaveAttribute("href", "/agendar-visita");
  });
});
