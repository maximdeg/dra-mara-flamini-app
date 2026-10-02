import { describe, expect, it } from "vitest";
import {
  CLINIC_WHATSAPP_DISPLAY,
  clinicWhatsAppLink,
} from "./whatsapp-contact";

describe("clinicWhatsAppLink", () => {
  it("points wa.me at the clinic number in digits-only form", () => {
    const url = new URL(clinicWhatsAppLink("Hola"));

    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/5493425782344");
  });

  it("carries the message, encoded, as the prefilled text", () => {
    const message = "Hola, quisiera consultar por el tratamiento de Toxina botulínica.";
    const link = clinicWhatsAppLink(message);

    expect(link).not.toContain(" ");
    expect(new URL(link).searchParams.get("text")).toBe(message);
  });

  it("omits the text parameter when there is no message", () => {
    expect(clinicWhatsAppLink("")).toBe("https://wa.me/5493425782344");
  });
});

describe("CLINIC_WHATSAPP_DISPLAY", () => {
  it("is the human-readable form of the same number", () => {
    expect(CLINIC_WHATSAPP_DISPLAY).toBe("+54 9 3425 78-2344");
    expect(CLINIC_WHATSAPP_DISPLAY.replace(/\D/g, "")).toBe("5493425782344");
  });
});
