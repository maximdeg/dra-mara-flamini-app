import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MessagingUsage } from "@/lib/notifications/whatsapp/send-log";
import { WhatsAppUsage } from "./whatsapp-usage";

function usage(overrides: Partial<MessagingUsage> = {}): MessagingUsage {
  return {
    used: 12,
    limit: 250,
    remaining: 238,
    failed: 0,
    resetsAt: "2026-06-20T08:30:00.000Z",
    ...overrides,
  };
}

describe("WhatsAppUsage", () => {
  it("shows how much of the 24h limit is used and what remains", () => {
    render(<WhatsAppUsage usage={usage()} />);

    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText(/\/ 250/)).toBeTruthy();
    expect(screen.getByText(/238/)).toBeTruthy();
  });

  it("exposes the usage as an accessible progress bar", () => {
    render(<WhatsAppUsage usage={usage()} />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("12");
    expect(bar.getAttribute("aria-valuemax")).toBe("250");
  });

  it("stays quiet about failures when there are none", () => {
    render(<WhatsAppUsage usage={usage()} />);
    expect(screen.queryByText(/no salieron|no salió/)).toBeNull();
  });

  it("calls out rejected sends, which is what hitting the cap looks like", () => {
    render(<WhatsAppUsage usage={usage({ failed: 3 })} />);
    expect(screen.getByText(/3 mensajes no salieron/)).toBeTruthy();
  });

  it("uses the singular for a single rejected send", () => {
    render(<WhatsAppUsage usage={usage({ failed: 1 })} />);
    expect(screen.getByText(/1 mensaje no salió/)).toBeTruthy();
  });

  it("warns visually as the window fills", () => {
    const { container } = render(
      <WhatsAppUsage usage={usage({ used: 240, remaining: 10 })} />,
    );
    expect(
      container.querySelector('[data-level="high"]'),
    ).toBeTruthy();
  });

  it("omits the reset line when nothing has been sent", () => {
    render(
      <WhatsAppUsage usage={usage({ used: 0, remaining: 250, resetsAt: null })} />,
    );
    expect(screen.queryByText(/Se libera lugar/)).toBeNull();
  });
});
