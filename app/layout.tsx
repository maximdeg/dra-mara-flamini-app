import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      <body>
        {children}
        {/* Vercel Analytics (page views, visitors) and Speed Insights (Core Web
            Vitals from real visits). Both inject a script and render nothing, and
            both only report when deployed to Vercel — locally they no-op. Placed
            in the root layout so every route is covered. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
