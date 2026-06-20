/**
 * The /admin authorization decision — the pure core the NextAuth middleware
 * (`authorized` callback) applies to every request. Kept out of the framework
 * glue so the guard rule is unit-testable on its own.
 *
 * The dashboard surface lives under `/admin`. The sign-in page is itself under
 * `/admin/sign-in` and must stay reachable while signed out, so it is the one
 * `/admin` path that is not protected (otherwise a redirect loop).
 */
const SIGN_IN_PATH = "/admin/sign-in";

export function isProtectedAdminPath(pathname: string): boolean {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return false;
  }
  if (pathname === SIGN_IN_PATH || pathname.startsWith(`${SIGN_IN_PATH}/`)) {
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
