import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "./page";

vi.mock("./actions", () => ({ requestPasswordResetAction: vi.fn() }));

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("ForgotPasswordPage", () => {
  it("matches the request-reset form structure", () => {
    const { container } = render(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { name: "Recuperar contraseña" }),
    ).toBeInTheDocument();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(withoutClasses(form!.outerHTML)).toMatchSnapshot();
  });
});
