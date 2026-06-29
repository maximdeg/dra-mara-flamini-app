import { describe, expect, it } from "vitest";
import { canAccess, isProtectedAdminPath } from "./guard";

describe("isProtectedAdminPath", () => {
  it("protects /admin and its sub-paths", () => {
    expect(isProtectedAdminPath("/admin")).toBe(true);
    expect(isProtectedAdminPath("/admin/appointments")).toBe(true);
    expect(isProtectedAdminPath("/admin/schedule/work")).toBe(true);
  });

  it("leaves the sign-in page unprotected (no redirect loop)", () => {
    expect(isProtectedAdminPath("/admin/sign-in")).toBe(false);
  });

  it("leaves the password-recovery pages unprotected (reachable while locked out)", () => {
    expect(isProtectedAdminPath("/admin/forgot-password")).toBe(false);
    expect(isProtectedAdminPath("/admin/reset-password")).toBe(false);
  });

  it("leaves public paths unprotected", () => {
    expect(isProtectedAdminPath("/")).toBe(false);
    expect(isProtectedAdminPath("/agendar-visita")).toBe(false);
    expect(isProtectedAdminPath("/cita/abc")).toBe(false);
    expect(isProtectedAdminPath("/administrators")).toBe(false);
  });
});

describe("canAccess", () => {
  it("blocks an unauthenticated visitor from a guarded /admin path", () => {
    expect(canAccess("/admin", false)).toBe(false);
    expect(canAccess("/admin/appointments", false)).toBe(false);
  });

  it("allows an authenticated Professional into guarded /admin paths", () => {
    expect(canAccess("/admin", true)).toBe(true);
    expect(canAccess("/admin/appointments", true)).toBe(true);
  });

  it("allows everyone onto public paths, sign-in, and password recovery", () => {
    expect(canAccess("/", false)).toBe(true);
    expect(canAccess("/agendar-visita", false)).toBe(true);
    expect(canAccess("/admin/sign-in", false)).toBe(true);
    expect(canAccess("/admin/forgot-password", false)).toBe(true);
    expect(canAccess("/admin/reset-password", false)).toBe(true);
  });
});
