import { notFound } from "next/navigation";
import { patientCanCancel } from "@/lib/appointments/cancellation";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "@/lib/appointments/visit-type";
import { STATUS_LABELS, statusOf } from "@/lib/appointments/status";
import { coverageLabel } from "@/lib/coverage/coverage";
import { formatPesos } from "@/lib/deposit/deposit";
import { CancelAppointment } from "./cancel-appointment";

// Rendered on demand: it reads an Appointment from the database by id.
export const dynamic = "force-dynamic";

export default async function CitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repository = await getAppointmentRepository();
  const appointment = await repository.findById(id);
  if (!appointment) {
    notFound();
  }

  const now = new Date();
  const status = statusOf(appointment, now);

  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Cita confirmada</h1>
      <dl>
        <dt>Paciente</dt>
        <dd>
          {appointment.patientFirstName} {appointment.patientLastName}
        </dd>
        <dt>Teléfono</dt>
        <dd>{appointment.patientPhone}</dd>
        <dt>Email</dt>
        <dd>{appointment.patientEmail}</dd>
        <dt>Tipo de visita</dt>
        <dd>{VISIT_TYPE_LABELS[appointment.visitType]}</dd>
        {appointment.consultType ? (
          <>
            <dt>Tipo de consulta</dt>
            <dd>{CONSULT_TYPE_LABELS[appointment.consultType]}</dd>
          </>
        ) : null}
        {appointment.practiceType ? (
          <>
            <dt>Tipo de práctica</dt>
            <dd>{PRACTICE_TYPE_LABELS[appointment.practiceType]}</dd>
          </>
        ) : null}
        <dt>Cobertura</dt>
        <dd>{coverageLabel(appointment.coverage)}</dd>
        {appointment.deposit ? (
          <>
            <dt>Seña</dt>
            <dd>{formatPesos(appointment.deposit.amount)} (confirmada)</dd>
          </>
        ) : null}
        <dt>Fecha</dt>
        <dd>{appointment.date}</dd>
        <dt>Hora</dt>
        <dd>{appointment.time}</dd>
        <dt>Estado</dt>
        <dd>{STATUS_LABELS[status]}</dd>
        <dt>Confirmación por WhatsApp</dt>
        <dd>{appointment.whatsappSent ? "Enviada" : "Pendiente"}</dd>
      </dl>
      <CancelAppointment
        appointmentId={appointment.id}
        isScheduled={status === "scheduled"}
        withinWindow={patientCanCancel(appointment, now)}
      />
    </main>
  );
}
