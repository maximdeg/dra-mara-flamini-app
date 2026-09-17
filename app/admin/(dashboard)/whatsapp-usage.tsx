import { Card } from "@/components/ui/card";
import type { MessagingUsage } from "@/lib/notifications/whatsapp/send-log";
import styles from "./whatsapp-usage.module.css";

/** Show the reset instant as Argentine `HH:MM` of the day it falls on. */
function formatReset(resetsAt: string): string {
  return new Date(resetsAt).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The clinic's WhatsApp usage inside Meta's rolling 24-hour window.
 *
 * Meta caps business-initiated messages per 24h (the clinic's number is at 250);
 * past the cap the Cloud API refuses to send and Patients silently stop getting
 * their Confirmation. Surfacing used/remaining here turns that into something
 * the Professional can see coming. The bar turns amber past 75% and red past
 * 90%, and rejected attempts are called out separately because a burst of them
 * is what hitting the cap actually looks like.
 */
export function WhatsAppUsage({ usage }: { usage: MessagingUsage }) {
  const percent =
    usage.limit === 0 ? 0 : Math.min(100, (usage.used / usage.limit) * 100);
  const level = percent >= 90 ? "high" : percent >= 75 ? "medium" : "low";

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>WhatsApp — últimas 24 h</h2>
        <p className={styles.count}>
          <strong className={styles.used}>{usage.used}</strong>
          <span className={styles.limit}> / {usage.limit}</span>
        </p>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={usage.used}
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-label="Mensajes de WhatsApp enviados en las últimas 24 horas"
      >
        <div
          className={styles.fill}
          data-level={level}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className={styles.detail}>
        Quedan <strong>{usage.remaining}</strong> mensajes en la ventana de 24
        horas.
        {usage.resetsAt !== null && (
          <> Se libera lugar a partir de las {formatReset(usage.resetsAt)}.</>
        )}
      </p>

      {usage.failed > 0 && (
        <p className={styles.failed}>
          {usage.failed}{" "}
          {usage.failed === 1 ? "mensaje no salió" : "mensajes no salieron"} en
          este período. Si son varios, puede que se haya alcanzado el límite.
        </p>
      )}
    </Card>
  );
}
