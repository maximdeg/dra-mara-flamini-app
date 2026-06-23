const DEV_FALLBACK = "http://localhost:3000";

/**
 * Absolute URL for a path on the public site, e.g. `siteUrl(`/cita/${id}`)`.
 *
 * Email links must be absolute (a relative `/cita/...` does not resolve in a
 * mail client), so they are built from `NEXT_PUBLIC_SITE_URL` — the deployed
 * origin, e.g. `https://<clinic-domain>`. Set it in the environment (and in the
 * Vercel project settings: Project → Settings → Environment Variables). When it
 * is unset (local dev), this falls back to `http://localhost:3000`.
 *
 * Read at call time, server-side (the email is rendered in the booking /
 * cancellation server actions), so a build-time value is not required.
 */
export function siteUrl(path = "/"): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || DEV_FALLBACK).replace(
    /\/+$/,
    "",
  );
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
