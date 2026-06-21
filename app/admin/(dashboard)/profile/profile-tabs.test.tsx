import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";
import { ProfileTabs } from "./profile-tabs";

// The forms wire to server actions via useActionState; stub them so the forms
// mount without importing the auth/db chain.
vi.mock("./actions", () => ({
  updateProfileAction: vi.fn(),
  changePasswordAction: vi.fn(),
}));

function renderTabs() {
  return render(
    <ToastProvider>
      <ProfileTabs
        email="mara@example.com"
        name="Mara Flamini"
        phone="+543410000000"
        whatsappNumber="+543410000001"
      />
    </ToastProvider>,
  );
}

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("ProfileTabs", () => {
  it("starts on the profile tab and switches to the password tab", () => {
    renderTabs();
    // Datos tab shown first: the WhatsApp field is visible.
    expect(screen.getByLabelText("WhatsApp")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Contraseña" }));
    expect(screen.getByLabelText(/Nueva contraseña/)).toBeVisible();
  });

  it("matches the profile structure", () => {
    const { container } = renderTabs();
    expect(
      withoutClasses((container.firstElementChild as HTMLElement).outerHTML),
    ).toMatchSnapshot();
  });
});
