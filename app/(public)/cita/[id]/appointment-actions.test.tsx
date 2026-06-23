import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppointmentActions } from "./appointment-actions";

// Render Next's Link as a plain anchor.
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

describe("AppointmentActions", () => {
  it("links to the booking flow and home", () => {
    render(<AppointmentActions />);
    expect(
      screen.getByRole("link", { name: /Agendar otra cita/ }),
    ).toHaveAttribute("href", "/agendar-visita");
    expect(
      screen.getByRole("link", { name: /Volver al inicio/ }),
    ).toHaveAttribute("href", "/");
  });
});
