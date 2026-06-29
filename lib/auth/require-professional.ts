import { auth } from "@/auth";

/**
 * The result of the server-action authorization decision: either the caller is
 * the signed-in Professional (with their email extracted for downstream use) or
 * they are not. The negative case carries no detail — each action maps it to its
 * own response shape at the edge.
 */
export type ProfessionalSession =
  | { ok: true; email: string }
  | { ok: false };

/** The slice of a session this decision reads — just enough to decide. */
type SessionReader = () => Promise<{
  user?: { email?: string | null } | null;
} | null>;

/**
 * The /admin *write*-boundary authorization decision, the server-action sibling
 * of the middleware path guard (`./guard`). Every dashboard mutation is a
 * Next.js server action — an independently callable public endpoint the
 * middleware does not protect — so each must re-establish that the caller is the
 * signed-in Professional. This owns that one decision and the identity read in a
 * single place; callers map the negative case to their own return shape.
 *
 * The session is read through an injected `readSession` (defaulting to the real
 * NextAuth `auth()`) so the decision is unit-testable without standing up
 * NextAuth — the same "accept dependencies, don't create them" discipline the
 * domain modules use.
 */
export async function requireProfessional(
  readSession: SessionReader = auth,
): Promise<ProfessionalSession> {
  const session = await readSession();
  const email = session?.user?.email;
  if (!email) {
    return { ok: false };
  }
  return { ok: true, email };
}
