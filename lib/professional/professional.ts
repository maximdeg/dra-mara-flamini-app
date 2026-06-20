/**
 * The Professional — the single practitioner who owns the practice (CONTEXT.md).
 *
 * There is exactly one Professional per deployment, so this is a single
 * document, not a collection of rows. The Professional is the only
 * authenticated identity in the system; Patients are never authenticated
 * (ADR-0002). Credentials back Auth.js (NextAuth): the plaintext password is
 * never stored — only its bcrypt hash.
 *
 * Profile fields (name, contact, WhatsApp number) become editable from the
 * dashboard in slice 12; this slice establishes the shape and the seam.
 */
export interface Professional {
  id: string;
  /** Login identity. Stored normalized (trimmed, lowercased). */
  email: string;
  /** bcrypt hash of the password — the plaintext is never persisted. */
  passwordHash: string;
  /** ISO timestamp the email was verified, or null (Auth.js `email_verified`). */
  emailVerified: string | null;
  /** Profile: display name. */
  name: string;
  /** Profile: contact phone. */
  phone: string;
  /** Profile: WhatsApp number Notifications are sent from. */
  whatsappNumber: string;
}

/** The Professional-editable profile fields (slice 12). */
export type ProfessionalProfile = Pick<
  Professional,
  "name" | "phone" | "whatsappNumber"
>;
