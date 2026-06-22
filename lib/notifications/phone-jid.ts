/**
 * Turning a Patient's stored phone into a WhatsApp address.
 *
 * The clinic is in Argentina, where the same mobile is written many ways:
 * domestically `0342 15 111-2233`, internationally `+54 9 342 111 2233`, or — as
 * this app stores it — the bare 10-digit national number `3421112233`. WhatsApp
 * wants `54` (country) + `9` (mobile) + the 10-digit national number, suffixed
 * with `@s.whatsapp.net`. This module normalizes all of those to that one form.
 *
 * The authoritative JID still comes from the live socket's registration lookup
 * (slice 05) — this is the best-effort starting point handed to it.
 */

const COUNTRY_CODE = "54";
const MOBILE_PREFIX = "9";
const NATIONAL_LENGTH = 10;
const WHATSAPP_DOMAIN = "s.whatsapp.net";

/**
 * Normalize a stored Argentine phone to WhatsApp's international digits:
 * `549` + the 10-digit national number (area code + subscriber). Strips
 * formatting, the `+`, the `54` country code, the `9` mobile prefix, the trunk
 * `0`, and the domestic `15` mobile marker when present.
 */
export function normalizeArgentinePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length);
  }
  if (digits.startsWith(MOBILE_PREFIX)) {
    digits = digits.slice(MOBILE_PREFIX.length);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Domestic mobiles insert "15" after the (2–4 digit) area code, making the
  // national number two digits too long. Remove it so a 10-digit number remains.
  if (digits.length === NATIONAL_LENGTH + 2) {
    for (const areaLength of [2, 3, 4]) {
      if (digits.slice(areaLength, areaLength + 2) === "15") {
        digits = digits.slice(0, areaLength) + digits.slice(areaLength + 2);
        break;
      }
    }
  }

  return `${COUNTRY_CODE}${MOBILE_PREFIX}${digits}`;
}

/** The WhatsApp JID for a stored Argentine phone. */
export function phoneToWhatsAppJid(raw: string): string {
  return `${normalizeArgentinePhone(raw)}@${WHATSAPP_DOMAIN}`;
}
