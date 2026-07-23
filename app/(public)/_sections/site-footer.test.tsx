import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the brand line and drops the prototype demo text", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Dra. Mara Flamini · Dermatología")).toBeInTheDocument();
    expect(screen.queryByText(/MaxTurnos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Prototipo/)).not.toBeInTheDocument();
  });

  it("links to the privacy policy and terms pages", () => {
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: "Política de Privacidad" }),
    ).toHaveAttribute("href", "/politica-de-privacidad");
    expect(
      screen.getByRole("link", { name: "Términos y Condiciones" }),
    ).toHaveAttribute("href", "/terminos-y-condiciones");
  });

  it("renders the brand logo", () => {
    render(<SiteFooter />);
    expect(
      screen.getByRole("img", {
        name: "Dra. Mara Flamini · Dermatología y Estética",
      }),
    ).toBeInTheDocument();
  });
});
