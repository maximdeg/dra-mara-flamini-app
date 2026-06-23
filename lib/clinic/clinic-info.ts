/**
 * Static, clinic-specific copy shown on the public confirmation (cita) page.
 *
 * The values marked with [BRACKETS] are PLACEHOLDERS — replace them with the
 * real clinic contacts, seña transfer details, and documentation requirements
 * before launch. This is the single home for that copy: editing the page's
 * informational content means editing this constant.
 */

export interface ClinicContact {
  name: string;
  phone: string;
}

/** Where a Patient transfers the acknowledged seña — the transfer is off-platform. */
export interface SenaTransfer {
  alias: string;
  cbu: string;
}

export interface ClinicInfo {
  /** WhatsApp contacts a Patient can reach for help with their Appointment. */
  contacts: ClinicContact[];
  senaTransfer: SenaTransfer;
  /** How early the Patient should arrive, in minutes. */
  arrivalLeadMinutes: number;
  /** Documentation a Patient should bring to the visit. */
  documentation: string[];
  /** Street address of the consulting room, shown in Patient emails. */
  address: string;
}

export const CLINIC_INFO: ClinicInfo = {
  contacts: [
    { name: "[NOMBRE CLÍNICA 1]", phone: "[TELÉFONO 1]" },
    { name: "[NOMBRE CLÍNICA 2]", phone: "[TELÉFONO 2]" },
  ],
  senaTransfer: { alias: "[ALIAS]", cbu: "[CBU]" },
  arrivalLeadMinutes: 15,
  documentation: [
    "Documento de identidad (DNI).",
    "Credencial de la obra social y la autorización correspondiente, si aplica.",
    "Estudios o resultados previos relacionados.",
  ],
  address: "[DIRECCIÓN DEL CONSULTORIO]",
};
