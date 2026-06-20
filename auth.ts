import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyProfessionalCredentials } from "@/lib/auth/credentials";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";

/**
 * Full NextAuth instance (Node runtime) — `auth.config` plus the Credentials
 * provider. `authorize` delegates to the testable `verifyProfessionalCredentials`
 * core, backed by the production Professional repository. Returning null means
 * "invalid credentials"; a returned user starts the session.
 *
 * JWT session strategy (no database session table) — the only authenticated
 * identity is the single Professional.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const professional = await verifyProfessionalCredentials(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? ""),
          { repository: await getProfessionalRepository() },
        );
        if (!professional) {
          return null;
        }
        return {
          id: professional.id,
          email: professional.email,
          name: professional.name,
        };
      },
    }),
  ],
});
