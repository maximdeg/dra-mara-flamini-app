import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "./reset-password-form";

vi.mock("./actions", () => ({ resetPasswordAction: vi.fn() }));

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("ResetPasswordForm", () => {
  it("carries the token as a hidden field and matches the structure", () => {
    const { container } = render(<ResetPasswordForm token="tok-123" />);

    expect(container.querySelector('input[name="token"]')).toHaveValue(
      "tok-123",
    );
    expect(
      screen.getByLabelText("Nueva contraseña", { exact: false }),
    ).toBeInTheDocument();

    const form = container.querySelector("form");
    expect(withoutClasses(form!.outerHTML)).toMatchSnapshot();
  });
});
