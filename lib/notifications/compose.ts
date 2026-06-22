import type { Appointment } from "../appointments/appointment";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "../appointments/visit-type";
import { coverageLabel } from "../coverage/coverage";
import { formatPesos } from "../deposit/deposit";
import type { Notification, NotificationKind } from "./notification";

/**
 * Composing Patient-facing Notification bodies — the pure heart of the
 * Notification subsystem. Given an Appointment, a kind, and the public base URL,
 * it produces the WhatsApp and Email bodies for both Channels. Kept free of I/O
 * so message content is unit-testable without sending anything.
 *
 * Copy is in Spanish (matching the UI). The Confirmation carries the cancel
 * link to the Appointment's public page; the Cancellation Notice omits it (the
 * Appointment is already cancelled).
 */

/** The public URL of the Appointment's page, where a Patient can cancel it. */
export function cancelLink(appointmentId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/cita/${appointmentId}`;
}

const HEADLINE: Record<NotificationKind, string> = {
  confirmation: "Tu cita quedó confirmada.",
  "cancellation-notice": "Tu cita fue cancelada.",
};

const SUBJECT: Record<NotificationKind, string> = {
  confirmation: "Confirmación de tu cita",
  "cancellation-notice": "Tu cita fue cancelada",
};

interface DetailLine {
  label: string;
  value: string;
}

/** The Appointment's detail lines, in the same order and labels as the cita page. */
function detailLines(appointment: Appointment): DetailLine[] {
  const lines: DetailLine[] = [
    { label: "Fecha", value: appointment.date },
    { label: "Hora", value: appointment.time },
    {
      label: "Tipo de visita",
      value: VISIT_TYPE_LABELS[appointment.visitType],
    },
  ];
  if (appointment.consultType) {
    lines.push({
      label: "Tipo de consulta",
      value: CONSULT_TYPE_LABELS[appointment.consultType],
    });
  }
  if (appointment.practiceType) {
    lines.push({
      label: "Tipo de práctica",
      value: PRACTICE_TYPE_LABELS[appointment.practiceType],
    });
  }
  lines.push({ label: "Cobertura", value: coverageLabel(appointment.coverage) });
  if (appointment.deposit) {
    lines.push({
      label: "Seña",
      value: `${formatPesos(appointment.deposit.amount)} (confirmada)`,
    });
  }
  return lines;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function plainTextBody(
  appointment: Appointment,
  kind: NotificationKind,
  baseUrl: string,
): string {
  const parts = [
    `Hola ${appointment.patientFirstName},`,
    "",
    HEADLINE[kind],
    "",
    ...detailLines(appointment).map((line) => `${line.label}: ${line.value}`),
  ];
  if (kind === "confirmation") {
    parts.push(
      "",
      "Para cancelar tu cita, ingresá acá:",
      cancelLink(appointment.id, baseUrl),
    );
  }
  return parts.join("\n");
}

function htmlBody(
  appointment: Appointment,
  kind: NotificationKind,
  baseUrl: string,
): string {
  const items = detailLines(appointment)
    .map(
      (line) =>
        `<li><strong>${escapeHtml(line.label)}:</strong> ${escapeHtml(line.value)}</li>`,
    )
    .join("");
  const cancel =
    kind === "confirmation"
      ? `<p>Para cancelar tu cita, <a href="${cancelLink(appointment.id, baseUrl)}">ingresá acá</a>.</p>`
      : "";
  return [
    `<p>Hola ${escapeHtml(appointment.patientFirstName)},</p>`,
    `<p>${HEADLINE[kind]}</p>`,
    `<ul>${items}</ul>`,
    cancel,
  ].join("");
}

/**
 * Compose the per-Channel Notifications for an Appointment — one for WhatsApp,
 * one for Email. Callers enqueue both.
 */
export function composeNotifications(
  appointment: Appointment,
  kind: NotificationKind,
  baseUrl: string,
): Notification[] {
  const text = plainTextBody(appointment, kind, baseUrl);
  return [
    {
      kind,
      channel: "whatsapp",
      appointmentId: appointment.id,
      recipient: appointment.patientPhone,
      message: { text },
    },
    {
      kind,
      channel: "email",
      appointmentId: appointment.id,
      recipient: appointment.patientEmail,
      message: {
        subject: `${SUBJECT[kind]} - ${appointment.date} ${appointment.time}`,
        text,
        html: htmlBody(appointment, kind, baseUrl),
      },
    },
  ];
}
