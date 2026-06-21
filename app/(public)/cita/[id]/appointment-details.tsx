import type { ReactNode } from "react";
import type { Appointment } from "@/lib/appointments/appointment";
import type { DerivedStatus } from "@/lib/appointments/status";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "@/lib/appointments/visit-type";
import { coverageLabel } from "@/lib/coverage/coverage";
import { formatPesos } from "@/lib/deposit/deposit";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import styles from "./appointment-details.module.css";

// The page title reflects the derived Status, so a Cancelled or Completed
// Appointment never reads as "confirmed".
const TITLES: Record<DerivedStatus, string> = {
  scheduled: "Cita confirmada",
  cancelled: "Cita cancelada",
  completed: "Cita completada",
};

type Row = { label: string; value: ReactNode };

/** Presentational, data-only view of an Appointment and its Status. */
export function AppointmentDetails({
  appointment,
  status,
}: {
  appointment: Appointment;
  status: DerivedStatus;
}) {
  const rows: Row[] = [
    {
      label: "Paciente",
      value: `${appointment.patientFirstName} ${appointment.patientLastName}`,
    },
    { label: "Teléfono", value: appointment.patientPhone },
    { label: "Email", value: appointment.patientEmail },
    { label: "Tipo de visita", value: VISIT_TYPE_LABELS[appointment.visitType] },
    ...(appointment.consultType
      ? [
          {
            label: "Tipo de consulta",
            value: CONSULT_TYPE_LABELS[appointment.consultType],
          },
        ]
      : []),
    ...(appointment.practiceType
      ? [
          {
            label: "Tipo de práctica",
            value: PRACTICE_TYPE_LABELS[appointment.practiceType],
          },
        ]
      : []),
    { label: "Cobertura", value: coverageLabel(appointment.coverage) },
    ...(appointment.deposit
      ? [
          {
            label: "Seña",
            value: `${formatPesos(appointment.deposit.amount)} (confirmada)`,
          },
        ]
      : []),
    { label: "Fecha", value: appointment.date },
    { label: "Hora", value: appointment.time },
    {
      label: "Confirmación por WhatsApp",
      value: appointment.whatsappSent ? "Enviada" : "Pendiente",
    },
  ];

  return (
    <Card className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>{TITLES[status]}</h1>
        <StatusBadge status={status} />
      </header>
      <dl className={styles.details}>
        {rows.map((row) => (
          <div className={styles.row} key={row.label}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
