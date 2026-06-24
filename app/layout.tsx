import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Dra. Mara Flamini",
  description: "Reserva de turnos del consultorio de dermatología.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
