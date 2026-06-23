import type { AppointmentView } from "@/lib/appointments/appointment-listing";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "@/lib/appointments/visit-type";
import { coverageLabel } from "@/lib/coverage/coverage";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { CancelAppointmentButton } from "./cancel-appointment-button";
import styles from "./appointments-table.module.css";

function subTypeLabel(appointment: {
  consultType: string | null;
  practiceType: string | null;
}): string | null {
  if (appointment.consultType) {
    return CONSULT_TYPE_LABELS[
      appointment.consultType as keyof typeof CONSULT_TYPE_LABELS
    ];
  }
  if (appointment.practiceType) {
    return PRACTICE_TYPE_LABELS[
      appointment.practiceType as keyof typeof PRACTICE_TYPE_LABELS
    ];
  }
  return null;
}

/** Presentational Appointments table with per-row Status and a cancel action. */
export function AppointmentsTable({ views }: { views: AppointmentView[] }) {
  return (
    <Table className={styles.table}>
      <THead>
        <TR>
          <TH>Fecha</TH>
          <TH>Hora</TH>
          <TH>Paciente</TH>
          <TH>Tipo</TH>
          <TH>Cobertura</TH>
          <TH>Estado</TH>
          <TH />
        </TR>
      </THead>
      <TBody>
        {views.map(({ appointment, status }) => {
          const sub = subTypeLabel(appointment);
          const patientName = `${appointment.patientFirstName} ${appointment.patientLastName}`;
          return (
            <TR key={appointment.id}>
              <TD>{appointment.date}</TD>
              <TD>{appointment.time}</TD>
              <TD>{patientName}</TD>
              <TD>
                {VISIT_TYPE_LABELS[appointment.visitType]}
                {sub ? ` · ${sub}` : ""}
              </TD>
              <TD>{coverageLabel(appointment.coverage)}</TD>
              <TD>
                <StatusBadge status={status} />
              </TD>
              <TD>
                {status === "scheduled" ? (
                  <CancelAppointmentButton
                    appointmentId={appointment.id}
                    patientName={patientName}
                  />
                ) : null}
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
