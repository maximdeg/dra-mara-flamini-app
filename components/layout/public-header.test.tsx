import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicHeader } from "./public-header";

describe("PublicHeader", () => {
  it("shows the practice identity and an Agenda tu turno CTA", () => {
    render(<PublicHeader />);

    expect(screen.getByText("Dra. Mara Flamini")).toBeInTheDocument();
    expect(screen.getByText("Dermatóloga")).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /Agenda tu turno/ });
    expect(cta).toHaveAttribute("href", "/agendar-visita");
  });

  it("renders the brand logo mark", () => {
    render(<PublicHeader />);
    expect(
      screen.getByRole("img", { name: "Dra. Mara Flamini" }),
    ).toBeInTheDocument();
  });

  it("links the brand lockup home", () => {
    render(<PublicHeader />);
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href") === "/")).toBe(true);
  });
});
