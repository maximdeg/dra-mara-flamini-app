/**
 * Phone normalization for the Argentine Patient. Patients type their number the
 * way they say it — `0342 15 578-2402`, `(342) 15-5782402`, `342 578 2402` —
 * but the WhatsApp Cloud API only accepts E.164 (`+549...`), and rejects
 * anything else with error 131026 ("message undeliverable"). Normalizing at the
 * Booking seam means the stored `patientPhone` is canonical everywhere
 * downstream: the Confirmation reaches the Patient, and the
 * one-open-Appointment-per-phone rule (ADR-0002) compares like with like
 * instead of treating two spellings of one number as two people.
 *
 * Argentine mobile numbers are the whole point here, so the rules below encode
 * the two local conventions that a naive `+54` prefix gets wrong: the national
 * trunk prefix `0`, and the mobile marker `15`.
 */

/** Argentina's country code. */
const COUNTRY_CODE = "54";

/**
 * A phone number in E.164 — exactly what `WhatsAppMessage.to` requires.
 * A branded string so a raw form value cannot be passed where one is expected.
 */
export type E164Phone = string & { readonly __brand: "E164Phone" };

/**
 * Normalize an Argentine phone number to E.164, or return `null` if it cannot
 * be read as one.
 *
 * Accepts the shapes Patients actually type — with or without `+54`, the trunk
 * `0`, the mobile `15`, and any mix of spaces, dashes, dots or parentheses —
 * and always produces the mobile form `+549<area><subscriber>` that WhatsApp
 * expects. Returning `null` rather than throwing keeps an unreadable number an
 * explicit, typed outcome for the caller to reject.
 *
 * The transformations, in order:
 *
 * - Strip every character that is not a digit or a leading `+`.
 * - Drop the country code `54` when present (with or without `+`).
 * - Drop the national trunk prefix `0` (as in `0342`), which never appears in
 *   an international number.
 * - Drop the mobile marker `15`, which Argentines dial *after* the area code
 *   locally (`342 15 5782402`) but which is replaced by a leading `9` when
 *   dialed internationally.
 * - Re-add the `9` that marks a mobile line, since every number a Patient gives
 *   for WhatsApp is a mobile.
 */
export function normalizeArgentinePhone(input: string): E164Phone | null {
  // Keep digits only; a leading "+" carries no information once the country
  // code is handled explicitly below.
  let digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) {
    return null;
  }

  // "+5493425782402" / "5493425782402" → strip the country code.
  if (digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length);
    // A number already in international mobile form carries the 9 marker; drop
    // it here and re-add it uniformly at the end.
    if (digits.startsWith("9")) {
      digits = digits.slice(1);
    }
  }

  // "0342..." → the trunk prefix is local-dialing only.
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // The mobile marker "15" follows the area code locally. Area codes in
  // Argentina are 2-4 digits, so scan those lengths for a "15" that leaves a
  // plausible subscriber number behind, rather than blindly stripping a "15"
  // that might be part of the area code itself (e.g. 11 5 ...).
  digits = stripMobileMarker(digits);

  // A national Argentine number is 10 digits: area code + subscriber.
  if (digits.length !== 10) {
    return null;
  }

  return `+${COUNTRY_CODE}9${digits}` as E164Phone;
}

/**
 * Remove the local mobile marker `15` that sits between the area code and the
 * subscriber number (`342 15 5782402`).
 *
 * Only strips when doing so leaves exactly the 10 digits a national number has,
 * which keeps it from mangling a number whose area code or subscriber digits
 * merely happen to contain `15`.
 */
function stripMobileMarker(digits: string): string {
  if (digits.length !== 12) {
    return digits;
  }
  for (const areaCodeLength of [2, 3, 4]) {
    if (digits.slice(areaCodeLength, areaCodeLength + 2) === "15") {
      return digits.slice(0, areaCodeLength) + digits.slice(areaCodeLength + 2);
    }
  }
  return digits;
}
