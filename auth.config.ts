import type { NextAuthConfig } from "next-auth";
import { canAccess } from "@/lib/auth/guard";

/**
 * Edge-safe NextAuth config — the part the middleware runs on every request.
 *
 * It must not import anything Node-only (bcrypt, the Mongo driver), so the
 * Credentials provider and its `authorize` (which hash-compare and hit the
 * repository) live in `auth.ts`, not here. The middleware only needs the
 * session cookie and the `authorized` callback. See the NextAuth v5 split-config
 * pattern.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/sign-in",
  },
  callbacks: {
    // Returning false on a protected path makes NextAuth redirect to `signIn`.
    authorized({ auth, request: { nextUrl } }) {
      return canAccess(nextUrl.pathname, Boolean(auth?.user));
    },
  },
  providers: [],
} satisfies NextAuthConfig;
