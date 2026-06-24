import type { Appointment } from "../../appointments/appointment";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "../../appointments/visit-type";
import { coverageLabel } from "../../coverage/coverage";
import { formatPesos } from "../../deposit/deposit";
import type { EmailMessage } from "./email-sender";
import {
  BRAND_NAME,
  button,
  detailTable,
  heading,
  paragraph,
  renderEmailLayout,
  type DetailRow,
} from "./layout";

const SUBJECT = "Tu cita quedó confirmada — Dra. Mara Flamini";

const CANCEL_NOTE =
  "Podés cancelar tu cita hasta 24 horas antes del horario del turno desde ese enlace.";

export interface ConfirmationLinks {
  /** Absolute URL of the Patient's Appointment page (`/cita/[id]`). */
  manageUrl: string;
}

/** The Appointment summary rows, mirroring the cita page (and its order). */
function detailRows(appointment: Appointment): DetailRow[] {
  const rows: DetailRow[] = [
    {
      label: "Paciente",
      value: `${appointment.patientFirstName} ${appointment.patientLastName}`,
    },
    { label: "Teléfono", value: appointment.patientPhone },
    { label: "Email", value: appointment.patientEmail },
    { label: "Tipo de visita", value: VISIT_TYPE_LABELS[appointment.visitType] },
  ];
  if (appointment.consultType) {
    rows.push({
      label: "Tipo de consulta",
      value: CONSULT_TYPE_LABELS[appointment.consultType],
    });
  }
  if (appointment.practiceType) {
    rows.push({
      label: "Tipo de práctica",
      value: PRACTICE_TYPE_LABELS[appointment.practiceType],
    });
  }
  rows.push({ label: "Cobertura", value: coverageLabel(appointment.coverage) });
  if (appointment.deposit) {
    rows.push({ label: "Seña", value: formatPesos(appointment.deposit.amount) });
  }
  rows.push({ label: "Fecha", value: appointment.date });
  rows.push({ label: "Hora", value: appointment.time });
  return rows;
}

function textBody(
  appointment: Appointment,
  links: ConfirmationLinks,
  rows: DetailRow[],
): string {
  return [
    `Hola ${appointment.patientFirstName}, tu cita quedó confirmada.`,
    "",
    "Detalles de tu cita:",
    ...rows.map((row) => `- ${row.label}: ${row.value}`),
    "",
    `Ver o cancelar tu cita: ${links.manageUrl}`,
    CANCEL_NOTE,
    "",
    BRAND_NAME,
  ].join("\n");
}

/**
 * The Confirmation email for a booked Appointment — a Patient-ready
 * `{ to, subject, html, text }`. Pure: the absolute manage link is passed in
 * (built from `siteUrl`) so this stays testable without env.
 */
export function confirmationEmail(
  appointment: Appointment,
  links: ConfirmationLinks,
): EmailMessage {
  const rows = detailRows(appointment);
  const content = [
    heading(`Hola ${appointment.patientFirstName}, tu cita quedó confirmada`),
    paragraph("Estos son los detalles de tu cita:"),
    detailTable(rows),
    button(links.manageUrl, "Ver o cancelar tu cita"),
    paragraph(CANCEL_NOTE),
  ].join("\n");

  return {
    to: appointment.patientEmail,
    subject: SUBJECT,
    html: renderEmailLayout(content),
    text: textBody(appointment, links, rows),
  };
}
