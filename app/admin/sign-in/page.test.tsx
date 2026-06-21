import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { signIn } from "next-auth/react";
import SignInPage from "./page";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const signInMock = vi.mocked(signIn);

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("SignInPage", () => {
  it("shows a generic error when credentials are rejected", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin" } as never);
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "pro@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText("Email o contraseña incorrectos."),
    ).toBeInTheDocument();
  });

  it("matches the sign-in form structure", () => {
    const { container } = render(<SignInPage />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(withoutClasses(form!.outerHTML)).toMatchSnapshot();
  });
});
