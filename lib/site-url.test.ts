import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds an absolute URL from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://clinica.example");
    expect(siteUrl("/cita/abc")).toBe("https://clinica.example/cita/abc");
  });

  it("trims a trailing slash on the base and normalizes a relative path", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://clinica.example/");
    expect(siteUrl("cita/abc")).toBe("https://clinica.example/cita/abc");
  });

  it("falls back to localhost when the env var is empty/unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl("/agendar-visita")).toBe(
      "http://localhost:3000/agendar-visita",
    );
  });
});
