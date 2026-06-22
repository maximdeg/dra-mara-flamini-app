import { describe, expect, it } from "vitest";
import { normalizeArgentinePhone, phoneToWhatsAppJid } from "./phone-jid";

describe("normalizeArgentinePhone", () => {
  it("prepends 549 to a bare 10-digit national number (the stored form)", () => {
    expect(normalizeArgentinePhone("3421112233")).toBe("5493421112233");
  });

  it("accepts an international +54 9 number with spacing", () => {
    expect(normalizeArgentinePhone("+54 9 342 111 2233")).toBe("5493421112233");
  });

  it("inserts the 9 mobile prefix when +54 is given without it", () => {
    expect(normalizeArgentinePhone("+543421112233")).toBe("5493421112233");
  });

  it("strips the trunk 0 and the domestic 15 marker (3-digit area code)", () => {
    expect(normalizeArgentinePhone("0342 15 111 2233")).toBe("5493421112233");
  });

  it("strips the trunk 0 and the domestic 15 marker (2-digit area code)", () => {
    // Buenos Aires: 011 15 1234-5678 → 54 9 11 12345678
    expect(normalizeArgentinePhone("011 15 1234 5678")).toBe("5491112345678");
  });

  it("leaves an already-canonical 549 number unchanged", () => {
    expect(normalizeArgentinePhone("5493421112233")).toBe("5493421112233");
  });

  it("ignores punctuation and parentheses", () => {
    expect(normalizeArgentinePhone("(0342) 15-111-2233")).toBe("5493421112233");
  });
});

describe("phoneToWhatsAppJid", () => {
  it("appends the WhatsApp domain", () => {
    expect(phoneToWhatsAppJid("3421112233")).toBe(
      "5493421112233@s.whatsapp.net",
    );
  });
});
