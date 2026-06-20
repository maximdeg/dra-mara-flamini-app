import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Guard /admin with the edge-safe config (no Node-only imports). The
// `authorized` callback decides access; an unauthenticated hit on a protected
// path redirects to the sign-in page.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
