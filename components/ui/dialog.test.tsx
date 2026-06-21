import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "./dialog";

function open(onClose = vi.fn()) {
  const result = render(
    <Dialog open onClose={onClose} title="¿Cancelar la cita?">
      <p>Esta acción no se puede deshacer.</p>
      <button type="button">Confirmar</button>
    </Dialog>,
  );
  return { onClose, ...result };
}

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Hidden">
        <p>body</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes a labelled dialog and moves focus into it when open", () => {
    open();
    const dialog = screen.getByRole("dialog", { name: "¿Cancelar la cita?" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveFocus();
  });

  it("closes on Escape", () => {
    const { onClose } = open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a backdrop click but not on a panel click", () => {
    const { onClose } = open();
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();

    // The overlay is the dialog panel's parent.
    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
