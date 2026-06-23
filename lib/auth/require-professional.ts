/**
 * The authorization decision on the dashboard's *write* boundary — the
 * server-action sibling of the middleware path guard in `guard.ts`.
 *
 * Every admin mutation is a Next.js server action, i.e. an independently
 * callable public endpoint that the `/admin` middleware does not protect, so
 * each one must re-establish that the caller is the signed-in Professional.
 * This owns that one decision and the identity read; callers map only the
 * negative case to their own response shape (`{ error }`, `{ ok: false }`,
 * `throw`, or a silent `return`).
 *
 * The session is read through an injected `readSession` (defaulting to the real
 * NextAuth `auth()`), giving the decision a testable seam without standing up
 * NextAuth — the same "accept dependencies, don't create them" discipline used
 * by `book()`, `changePassword()`, and the other domain cores. The default
 * loads `@/auth` lazily so a test that injects its own reader never drags
 * NextAuth (and its `next/server` glue) into the node test environment.
 */

/** Just enough of the session to extract the Professional's identity; NextAuth's
 * `Session` satisfies it structurally. */
type SessionLike = { user?: { email?: string | null } | null } | null;

export type ProfessionalSession =
  | { ok: true; email: string }
  | { ok: false };

async function readNextAuthSession(): Promise<SessionLike> {
  const { auth } = await import("@/auth");
  return auth();
}

export async function requireProfessional(
  readSession: () => Promise<SessionLike> = readNextAuthSession,
): Promise<ProfessionalSession> {
  const session = await readSession();
  const email = session?.user?.email;
  if (!email) {
    return { ok: false };
  }
  return { ok: true, email };
}
