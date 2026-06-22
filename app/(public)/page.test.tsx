import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Render next/image as a plain <img>, dropping the Next-only props (fill,
// priority, sizes) so they don't leak onto the DOM element.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe("HomePage", () => {
  it("renders the hero headline and reassurance copy", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { name: /Tu Piel, Nuestra\s+Especialidad/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sin crear una cuenta/i)).toBeInTheDocument();
  });

  it("shows the Professional's photo with a meaningful alt", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("img", { name: /Mara Flamini/ }),
    ).toBeInTheDocument();
  });

  it("lists the three services", () => {
    render(<HomePage />);
    for (const title of [
      "Dermatología General",
      "Dermatología Estética",
      "Cirugía Dermatológica",
    ]) {
      expect(
        screen.getByRole("heading", { name: title }),
      ).toBeInTheDocument();
    }
  });

  it("routes every Agendar visita CTA to the booking flow", () => {
    render(<HomePage />);
    const ctas = screen.getAllByRole("link", { name: /Agendar visita/ });
    expect(ctas.length).toBeGreaterThanOrEqual(2); // hero + closing band
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/agendar-visita");
    }
  });
});
