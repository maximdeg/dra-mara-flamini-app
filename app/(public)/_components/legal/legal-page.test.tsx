import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalPage } from "./legal-page";
import { LegalSection } from "./legal-section";
import { ContactCard, RightCard, RightsGrid } from "./legal-cards";

describe("LegalPage", () => {
  it("renders the eyebrow, title, lead, and meta facts", () => {
    render(
      <LegalPage
        eyebrow="Documento legal"
        title="Política de Privacidad"
        lead="Servicio de confirmación de turnos"
        meta={[
          { label: "Última actualización", value: "Julio 2026" },
          { label: "Marco legal", value: "Ley 25.326" },
        ]}
      >
        <p>Contenido</p>
      </LegalPage>,
    );

    expect(
      screen.getByRole("heading", { name: "Política de Privacidad", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Documento legal")).toBeInTheDocument();
    expect(screen.getByText("Servicio de confirmación de turnos")).toBeInTheDocument();
    expect(screen.getByText("Última actualización")).toBeInTheDocument();
    expect(screen.getByText("Julio 2026")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});

describe("LegalSection", () => {
  it("renders its number and heading beside the body", () => {
    render(
      <LegalSection number={7} title="Seguridad de la información">
        <p>Implementamos medidas técnicas.</p>
      </LegalSection>,
    );

    expect(
      screen.getByRole("heading", { name: "Seguridad de la información", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Implementamos medidas técnicas.")).toBeInTheDocument();
  });
});

describe("legal cards", () => {
  it("RightsGrid renders its RightCards with titles and descriptions", () => {
    render(
      <RightsGrid>
        <RightCard title="Acceso">Conocer qué datos tenemos.</RightCard>
        <RightCard title="Rectificación">Corregir datos inexactos.</RightCard>
      </RightsGrid>,
    );

    expect(screen.getByText("Acceso")).toBeInTheDocument();
    expect(screen.getByText("Conocer qué datos tenemos.")).toBeInTheDocument();
    expect(screen.getByText("Rectificación")).toBeInTheDocument();
  });

  it("ContactCard renders its eyebrow, title, intro, and channels", () => {
    render(
      <ContactCard
        eyebrow="Contacto"
        title="¿Preguntas sobre tu privacidad?"
        intro="Comunicate con nosotros:"
      >
        <li>Email: privacidad@example.com</li>
      </ContactCard>,
    );

    expect(
      screen.getByRole("heading", { name: "¿Preguntas sobre tu privacidad?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Contacto")).toBeInTheDocument();
    expect(screen.getByText("Comunicate con nosotros:")).toBeInTheDocument();
    expect(screen.getByText("Email: privacidad@example.com")).toBeInTheDocument();
  });
});
