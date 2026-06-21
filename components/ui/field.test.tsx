import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./field";

describe("Field", () => {
  it("associates its label with the nested control", () => {
    render(
      <Field label="Teléfono">
        <input name="phone" />
      </Field>,
    );
    // getByLabelText resolves the control via the wrapping label.
    expect(screen.getByLabelText("Teléfono")).toBe(
      screen.getByRole("textbox"),
    );
  });

  it("exposes the error message to assistive tech", () => {
    render(
      <Field label="Email" error="Email inválido">
        <input name="email" />
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Email inválido");
  });

  it("shows a hint only when there is no error", () => {
    const { rerender } = render(
      <Field label="Email" hint="Te enviaremos la confirmación">
        <input name="email" />
      </Field>,
    );
    expect(
      screen.getByText("Te enviaremos la confirmación"),
    ).toBeInTheDocument();

    rerender(
      <Field label="Email" hint="Te enviaremos la confirmación" error="Requerido">
        <input name="email" />
      </Field>,
    );
    expect(
      screen.queryByText("Te enviaremos la confirmación"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Requerido");
  });
});
