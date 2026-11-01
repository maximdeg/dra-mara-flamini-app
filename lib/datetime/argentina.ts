/** The clinic's time zone. Argentina has no DST, so it is always UTC−3. */
export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

/**
 * An instant (ISO-8601) as the Argentine wall-clock date and time:
 * `{ date: "DD/MM/YYYY", time: "HH:MM" }`, regardless of the server's zone.
 */
export function instantInArgentina(iso: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ARGENTINA_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.day}/${parts.month}/${parts.year}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/**
 * Today's date (`YYYY-MM-DD`) on the Argentine calendar, as of `now`.
 *
 * Vercel functions run in UTC, so this must not depend on the server's local
 * time zone: between 21:00 and midnight in Argentina, the UTC date is already
 * tomorrow.
 */
export function todayInArgentina(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Tomorrow's date (`YYYY-MM-DD`) on the Argentine calendar, as of `now`. Adds
 * one calendar day with UTC date arithmetic, which never shifts across zones.
 */
export function tomorrowInArgentina(now: Date): string {
  const [year, month, day] = todayInArgentina(now).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}
