import { describe, expect, it } from "vitest";
import { passwordResetEmail } from "./password-reset";

const RESET_URL = "https://clinica.example/admin/reset-password?token=abc123";

describe("passwordResetEmail", () => {
  it("addresses the Professional and carries the reset link and subject", () => {
    const email = passwordResetEmail("mara@example.com", RESET_URL);

    expect(email.to).toBe("mara@example.com");
    expect(email.subject).toBe("Restablecé tu contraseña — Dra. Mara Flamini");
    expect(email.html).toContain("Restablecé tu contraseña");
    expect(email.html).toContain(RESET_URL);
    expect(email.html).toContain("vence en 30 minutos");
    expect(email.text).toContain(RESET_URL);
  });

  it("renders the branded layout", () => {
    expect(passwordResetEmail("mara@example.com", RESET_URL)).toMatchSnapshot();
  });
});
