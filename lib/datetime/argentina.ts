/** The clinic's time zone. Argentina has no DST, so it is always UTC−3. */
export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

/**
 * Tomorrow's date (`YYYY-MM-DD`) on the Argentine calendar, as of `now`.
 *
 * Vercel functions run in UTC, so this must not depend on the server's local
 * time zone. It reads today's Argentine date from Intl, then adds one calendar
 * day with UTC date arithmetic, which never shifts across zones.
 */
export function tomorrowInArgentina(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = today.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}
