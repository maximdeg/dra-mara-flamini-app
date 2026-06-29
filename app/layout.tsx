import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dra. Mara Flamini",
  description: "Reserva de turnos del consultorio de dermatología.",
};

// Render at device width on phones (no desktop-width shrink-to-fit), so the
// responsive layouts below actually take effect instead of the page zooming out.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
