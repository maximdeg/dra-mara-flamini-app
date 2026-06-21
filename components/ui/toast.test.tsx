import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./toast";

function Trigger() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.success("Cita cancelada")}>
      notify
    </button>
  );
}

describe("ToastProvider", () => {
  it("shows a toast on demand and dismisses it via the close button", () => {
    render(
      <ToastProvider duration={0}>
        <Trigger />
      </ToastProvider>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "notify" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cita cancelada");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the duration", () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider duration={1000}>
          <Trigger />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: "notify" }));
      expect(screen.getByRole("status")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
