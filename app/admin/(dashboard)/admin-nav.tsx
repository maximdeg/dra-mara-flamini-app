"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import styles from "./admin-nav.module.css";

const LINKS = [
  { href: "/admin", label: "Panel", exact: true },
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/calendar", label: "Calendario" },
  { href: "/admin/schedule", label: "Horarios" },
  { href: "/admin/unavailable-days", label: "Días no laborables" },
  { href: "/admin/coverage", label: "Coberturas y precios" },
  { href: "/admin/clinic-info", label: "Información de la cita" },
  { href: "/admin/profile", label: "Perfil" },
];

/** Dashboard navigation. Marks the section matching the current route active. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Secciones del panel">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(styles.link, active && styles.active)}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
