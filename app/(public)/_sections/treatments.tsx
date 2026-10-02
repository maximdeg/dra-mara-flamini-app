import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/ui/icons";
import {
  CLINIC_WHATSAPP_DISPLAY,
  clinicWhatsAppLink,
} from "@/lib/clinic/whatsapp-contact";
import styles from "./treatments.module.css";

type Treatment = {
  name: string;
  description: string;
};

// Aesthetic Treatments: offered by the practice but not Visit Kinds, so they
// are arranged over WhatsApp rather than booked online.
const TREATMENTS: Treatment[] = [
  {
    name: "Peeling",
    description:
      "Renovación de la capa superficial de la piel para mejorar textura, manchas y luminosidad.",
  },
  {
    name: "Skinbooster",
    description:
      "Hidratación profunda con ácido hialurónico para una piel más firme y luminosa.",
  },
  {
    name: "Toxina botulínica",
    description:
      "Suaviza las líneas de expresión del rostro con un resultado natural.",
  },
  {
    name: "Plasma rico en plaquetas",
    description:
      "Estimula la regeneración de la piel a partir de factores de tu propia sangre.",
  },
];

/** The "Consultas por WhatsApp" band: Aesthetic Treatments, each with a WhatsApp link. */
export function Treatments() {
  return (
    <section className={styles.treatments}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 className={styles.title}>Consultas por WhatsApp</h2>
          <p className={styles.subtitle}>
            Estos tratamientos se coordinan por WhatsApp. Escríbenos al{" "}
            <span className={styles.number}>{CLINIC_WHATSAPP_DISPLAY}</span>.
          </p>
        </header>
        <div className={styles.grid}>
          {TREATMENTS.map(({ name, description }) => (
            <Card key={name} className={styles.card}>
              <h3 className={styles.cardTitle}>{name}</h3>
              <p className={styles.cardDesc}>{description}</p>
              <Button
                as="a"
                variant="secondary"
                href={clinicWhatsAppLink(
                  `Hola, quisiera consultar por el tratamiento de ${name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Consultar por WhatsApp sobre ${name}`}
                className={styles.cta}
              >
                <WhatsAppIcon size={18} />
                Consultar por WhatsApp
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
