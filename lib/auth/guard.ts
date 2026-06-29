/**
 * The /admin authorization decision — the pure core the NextAuth middleware
 * (`authorized` callback) applies to every request. Kept out of the framework
 * glue so the guard rule is unit-testable on its own.
 *
 * The dashboard surface lives under `/admin`. A few `/admin` paths must stay
 * reachable while signed out — the sign-in page (otherwise a redirect loop) and
 * the password-recovery flow (otherwise a locked-out Professional could never
 * reach the pages that let them back in) — so those are not protected.
 */
const PUBLIC_ADMIN_PATHS = [
  "/admin/sign-in",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function isProtectedAdminPath(pathname: string): boolean {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return false;
  }
  if (
    PUBLIC_ADMIN_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Whether a request to `pathname` is allowed given whether the visitor is
 * signed in. Public paths and the sign-in page are always allowed; protected
 * `/admin` paths require a session.
 */
export function canAccess(pathname: string, isLoggedIn: boolean): boolean {
  if (!isProtectedAdminPath(pathname)) {
    return true;
  }
  return isLoggedIn;
}
