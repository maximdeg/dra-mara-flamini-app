/**
 * The public base URL the cancel link is built from. Read from the environment
 * at the composition roots, with a localhost fallback for local dev. Slice 03
 * documents `PUBLIC_BASE_URL` in `.env.example`; for real Notifications it must
 * be the deployment origin, or cancel links won't resolve.
 */
export function getPublicBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
}
