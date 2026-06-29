import { describe, expect, it } from "vitest";
import { SEEDED_CLINIC_INFO, sanitizeClinicInfo } from "./clinic-info";

describe("sanitizeClinicInfo", () => {
  it("falls back to the seed for anything missing", () => {
    expect(sanitizeClinicInfo({})).toEqual({
      arrival: { title: SEEDED_CLINIC_INFO.arrival.title, body: "" },
      documentation: {
        title: SEEDED_CLINIC_INFO.documentation.title,
        items: SEEDED_CLINIC_INFO.documentation.items,
      },
      cancellation: { title: SEEDED_CLINIC_INFO.cancellation.title, body: "" },
      contact: {
        title: SEEDED_CLINIC_INFO.contact.title,
        intro: "",
        contacts: SEEDED_CLINIC_INFO.contact.contacts,
      },
      senaTransfer: {
        title: SEEDED_CLINIC_INFO.senaTransfer.title,
        intro: "",
        alias: "",
        cbu: "",
      },
    });
  });

  it("trims strings and keeps an edited title", () => {
    const result = sanitizeClinicInfo({
      senaTransfer: { title: "  Datos de transferencia  ", alias: " mara ", cbu: " 123 " },
    });
    expect(result.senaTransfer.title).toBe("Datos de transferencia");
    expect(result.senaTransfer.alias).toBe("mara");
    expect(result.senaTransfer.cbu).toBe("123");
  });

  it("restores a blanked title from the seed", () => {
    const result = sanitizeClinicInfo({ cancellation: { title: "   ", body: "x" } });
    expect(result.cancellation.title).toBe(SEEDED_CLINIC_INFO.cancellation.title);
  });

  it("drops blank documentation items and empty contact rows", () => {
    const result = sanitizeClinicInfo({
      documentation: { title: "Traé", items: ["DNI", "   ", ""] },
      contact: {
        title: "Contacto",
        intro: "Hola",
        contacts: [
          { name: "Clínica", phone: "341" },
          { name: "  ", phone: "  " },
        ],
      },
    });
    expect(result.documentation.items).toEqual(["DNI"]);
    expect(result.contact.contacts).toEqual([{ name: "Clínica", phone: "341" }]);
  });
});
