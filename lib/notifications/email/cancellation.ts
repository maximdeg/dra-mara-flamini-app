import type { Appointment } from "../../appointments/appointment";
import type { CancellationActor } from "../../appointments/cancellation";
import { VISIT_TYPE_LABELS } from "../../appointments/visit-type";
import type { ClinicContact } from "../../clinic/clinic-info";
import { coverageLabel } from "../../coverage/coverage";
import { formatDateAR } from "../../datetime/format";
import type { EmailMessage } from "./email-sender";
import {
  BRAND_NAME,
  button,
  contactBlock,
  detailTable,
  heading,
  paragraph,
  renderEmailLayout,
  type DetailRow,
} from "./layout";

const SUBJECT = "Tu cita fue cancelada — Dra. Mara Flamini";

const REBOOK_PROMPT =
  "¿Querés reprogramar? Podés reservar un nuevo turno cuando quieras.";

export interface CancellationLinks {
  /** Absolute URL of the booking page (`/agendar-visita`). */
  rebookUrl: string;
}

/** Actor-aware opening line: acknowledgement for the Patient, apology for the clinic. */
function intro(appointment: Appointment, actor: CancellationActor): string {
  const when = `del ${formatDateAR(appointment.date)} a las ${appointment.time}`;
  return actor === "professional"
    ? `Hola ${appointment.patientFirstName}, lamentamos informarte que el consultorio debió cancelar tu cita ${when}. Disculpá las molestias.`
    : `Hola ${appointment.patientFirstName}, confirmamos la cancelación de tu cita ${when}.`;
}

function summaryRows(appointment: Appointment): DetailRow[] {
  return [
    {
      label: "Paciente",
      value: `${appointment.patientFirstName} ${appointment.patientLastName}`,
    },
    { label: "Fecha", value: formatDateAR(appointment.date) },
    { label: "Hora", value: appointment.time },
    { label: "Tipo de visita", value: VISIT_TYPE_LABELS[appointment.visitType] },
    { label: "Cobertura", value: coverageLabel(appointment.coverage) },
  ];
}

function textBody(
  appointment: Appointment,
  actor: CancellationActor,
  links: CancellationLinks,
  rows: DetailRow[],
  contacts: ClinicContact[],
): string {
  return [
    intro(appointment, actor),
    "",
    "Detalles de la cita:",
    ...rows.map((row) => `- ${row.label}: ${row.value}`),
    "",
    `${REBOOK_PROMPT} ${links.rebookUrl}`,
    "",
    "Contacto:",
    ...contacts.map((contact) => `- ${contact.name} — ${contact.phone}`),
    "",
    BRAND_NAME,
  ].join("\n");
}

/**
 * The Cancellation email for a cancelled Appointment — a Patient-ready
 * `{ to, subject, html, text }`. Actor-aware copy (a Patient self-cancel reads
 * as an acknowledgement; a Professional/clinic cancellation as an apology).
 * Pure: the absolute rebook link and the clinic contacts are passed in (the
 * contacts come from the persisted, Professional-editable clinic info).
 */
export function cancellationEmail(
  appointment: Appointment,
  actor: CancellationActor,
  links: CancellationLinks,
  contacts: ClinicContact[],
): EmailMessage {
  const rows = summaryRows(appointment);
  const content = [
    heading("Tu cita fue cancelada"),
    paragraph(intro(appointment, actor)),
    detailTable(rows),
    paragraph(REBOOK_PROMPT),
    button(links.rebookUrl, "Reservar otro turno"),
    contactBlock(contacts),
  ].join("\n");

  return {
    to: appointment.patientEmail,
    subject: SUBJECT,
    html: renderEmailLayout(content),
    text: textBody(appointment, actor, links, rows, contacts),
  };
}
