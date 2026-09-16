import Link from "next/link";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { getWhatsAppSendLog } from "@/lib/notifications/whatsapp/get-whatsapp-send-log";
import {
  summarizeUsage,
  windowStart,
  type MessagingUsage,
} from "@/lib/notifications/whatsapp/send-log";
import { WhatsAppUsage } from "./whatsapp-usage";
import styles from "./page.module.css";

// The dashboard landing. Navigation and sign-out live in the shell (layout);
// this page welcomes the Professional and links into each section.
export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/admin/appointments",
    title: "Turnos",
    description: "Ver y gestionar las citas.",
  },
  {
    href: "/admin/calendar",
    title: "Calendario",
    description: "Tus citas día por día.",
  },
  {
    href: "/admin/schedule",
    title: "Horarios",
    description: "Tu disponibilidad semanal.",
  },
  {
    href: "/admin/unavailable-days",
    title: "Días no laborables",
    description: "Bloquear fechas puntuales.",
  },
  {
    href: "/admin/coverage",
    title: "Coberturas y precios",
    description: "Obras sociales y señas.",
  },
  {
    href: "/admin/profile",
    title: "Perfil",
    description: "Tus datos y contraseña.",
  },
];

/**
 * The clinic's WhatsApp usage over Meta's rolling 24h window, or null if the
 * Send Log cannot be read. The dashboard is the Professional's landing page and
 * must render even when the log is unavailable, so a failure here hides the card
 * rather than breaking the Panel.
 */
async function whatsappUsage(): Promise<MessagingUsage | null> {
  try {
    const log = await getWhatsAppSendLog();
    return summarizeUsage(await log.since(windowStart(new Date())));
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const [session, usage] = await Promise.all([auth(), whatsappUsage()]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Panel</h1>
        <p className={styles.subtitle}>
          Sesión iniciada como {session?.user?.email}. Desde acá gestionás
          turnos, agenda y coberturas.
        </p>
      </header>

      {usage !== null && <WhatsAppUsage usage={usage} />}

      <div className={styles.grid}>
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={styles.cardLink}
          >
            <Card className={styles.card}>
              <h2 className={styles.cardTitle}>{section.title}</h2>
              <p className={styles.cardDesc}>{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
