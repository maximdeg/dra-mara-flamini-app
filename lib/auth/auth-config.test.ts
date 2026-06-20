import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import { authConfig } from "@/auth.config";

// Drive the actual NextAuth `authorized` callback the middleware runs, so the
// guard wiring (not just the pure helper) is covered end-to-end for guarded vs.
// unguarded access.
const authorized = authConfig.callbacks.authorized;

function request(pathname: string) {
  return { nextUrl: new URL(`http://localhost${pathname}`) } as Parameters<
    NonNullable<typeof authorized>
  >[0]["request"];
}

const signedIn = { user: { email: "mara@example.com" } } as Session;

describe("authConfig.authorized", () => {
  it("redirects an unauthenticated visitor away from a guarded /admin path", () => {
    expect(authorized?.({ auth: null, request: request("/admin") })).toBe(
      false,
    );
    expect(
      authorized?.({ auth: null, request: request("/admin/appointments") }),
    ).toBe(false);
  });

  it("admits an authenticated Professional to guarded /admin paths", () => {
    expect(authorized?.({ auth: signedIn, request: request("/admin") })).toBe(
      true,
    );
  });

  it("admits everyone to public paths and the sign-in page", () => {
    expect(authorized?.({ auth: null, request: request("/") })).toBe(true);
    expect(
      authorized?.({ auth: null, request: request("/admin/sign-in") }),
    ).toBe(true);
  });
});
