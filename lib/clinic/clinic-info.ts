/**
 * Clinic-specific informational copy shown on the public confirmation (cita)
 * page — and, for the contacts, in the Cancellation email. Persisted and
 * editable by the Professional from the dashboard; `SEEDED_CLINIC_INFO` is the
 * default the repository falls back to until the first edit.
 *
 * The seeded values in [BRACKETS] are PLACEHOLDERS — the Professional replaces
 * them from the dashboard (no code change or redeploy needed) before launch.
 * This is what makes the copy editable: it is no longer baked into the page.
 */

export interface ClinicContact {
  name: string;
  phone: string;
}

/** An editable info box with a heading and a free-text body. */
export interface ClinicTextBox {
  title: string;
  body: string;
}

export interface ClinicInfo {
  /**
   * Arrival note. The lead time (e.g. "15 minutos") is part of the editable
   * title rather than a separate number.
   */
  arrival: ClinicTextBox;
  /** Documentation a Patient should bring — an editable heading + list. */
  documentation: { title: string; items: string[] };
  /** Cancellation-policy copy. */
  cancellation: ClinicTextBox;
  /** WhatsApp contacts a Patient can reach, with an intro line. */
  contact: { title: string; intro: string; contacts: ClinicContact[] };
  /** Off-platform seña transfer details. The amount itself is per-Appointment. */
  senaTransfer: { title: string; intro: string; alias: string; cbu: string };
}

export const SEEDED_CLINIC_INFO: ClinicInfo = {
  arrival: {
    title: "Llegá 15 minutos antes",
    body: "Para completar la documentación necesaria.",
  },
  documentation: {
    title: "Documentación requerida",
    items: [
      "Documento de identidad (DNI).",
      "Credencial de la obra social y la autorización correspondiente, si aplica.",
      "Estudios o resultados previos relacionados.",
    ],
  },
  cancellation: {
    title: "Cancelación",
    body: "Si necesitás cancelar, hacelo con al menos 24 horas de anticipación. Tené en cuenta que otro paciente puede necesitar ese turno y el tiempo del profesional.",
  },
  contact: {
    title: "Contacto",
    intro:
      "Ante cualquier inconveniente o duda con tu turno, escribinos por WhatsApp:",
    contacts: [
      { name: "[NOMBRE CLÍNICA 1]", phone: "[TELÉFONO 1]" },
      { name: "[NOMBRE CLÍNICA 2]", phone: "[TELÉFONO 2]" },
    ],
  },
  senaTransfer: {
    title: "Seña",
    intro:
      "Para dejar la seña reservada, transferí el monto a los siguientes datos. La transferencia se realiza por fuera de la plataforma.",
    alias: "[ALIAS]",
    cbu: "[CBU]",
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function trimStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** A title must never render empty, so an empty edit falls back to the seed. */
function titleOr(value: unknown, fallback: string): string {
  return trimStr(value) || fallback;
}

/**
 * Coerce untrusted clinic-info input (from the editing form) into a valid
 * ClinicInfo — the trust boundary for copy edits. Strings are trimmed; titles
 * fall back to the seed when blanked; blank list items and empty contact rows
 * are dropped so the page never renders stray empty entries.
 */
export function sanitizeClinicInfo(input: unknown): ClinicInfo {
  const raw = asRecord(input);
  const seed = SEEDED_CLINIC_INFO;

  const arrival = asRecord(raw.arrival);
  const documentation = asRecord(raw.documentation);
  const cancellation = asRecord(raw.cancellation);
  const contact = asRecord(raw.contact);
  const senaTransfer = asRecord(raw.senaTransfer);

  const items = Array.isArray(documentation.items)
    ? documentation.items.map(trimStr).filter((item) => item.length > 0)
    : seed.documentation.items;

  const contacts = Array.isArray(contact.contacts)
    ? contact.contacts
        .map((entry) => {
          const row = asRecord(entry);
          return { name: trimStr(row.name), phone: trimStr(row.phone) };
        })
        .filter((row) => row.name.length > 0 || row.phone.length > 0)
    : seed.contact.contacts;

  return {
    arrival: {
      title: titleOr(arrival.title, seed.arrival.title),
      body: trimStr(arrival.body),
    },
    documentation: {
      title: titleOr(documentation.title, seed.documentation.title),
      items,
    },
    cancellation: {
      title: titleOr(cancellation.title, seed.cancellation.title),
      body: trimStr(cancellation.body),
    },
    contact: {
      title: titleOr(contact.title, seed.contact.title),
      intro: trimStr(contact.intro),
      contacts,
    },
    senaTransfer: {
      title: titleOr(senaTransfer.title, seed.senaTransfer.title),
      intro: trimStr(senaTransfer.intro),
      alias: trimStr(senaTransfer.alias),
      cbu: trimStr(senaTransfer.cbu),
    },
  };
}
