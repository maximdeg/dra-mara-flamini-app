import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRightIcon,
  AwardIcon,
  CalendarIcon,
  ShieldIcon,
  UsersIcon,
  type IconProps,
} from "@/components/ui/icons";
import styles from "./page.module.css";

// The practice's main services — static marketing content (not domain data),
// editable here in one place.
const SERVICES: {
  Icon: ComponentType<IconProps>;
  title: string;
  description: string;
}[] = [
  {
    Icon: ShieldIcon,
    title: "Dermatología General",
    description:
      "Diagnóstico y tratamiento de enfermedades de la piel, el cabello y las uñas.",
  },
  {
    Icon: UsersIcon,
    title: "Dermatología Estética",
    description:
      "Tratamientos para cuidar y mejorar la apariencia y la salud de tu piel.",
  },
  {
    Icon: AwardIcon,
    title: "Cirugía Dermatológica",
    description: "Procedimientos quirúrgicos especializados en dermatología.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            Tu Piel, Nuestra <span className={styles.accent}>Especialidad</span>
          </h1>
          <p className={styles.lead}>
            Cuidamos la salud y la belleza de tu piel con atención dermatológica
            especializada y cercana. Reservá tu visita en línea, sin crear una
            cuenta.
          </p>
          <Button as={Link} href="/agendar-visita" className={styles.cta}>
            <CalendarIcon size={20} />
            Agendar visita
            <ArrowRightIcon size={18} />
          </Button>
        </div>

        <div className={styles.media}>
          <Image
            src="/images/mara-hero.jpg"
            alt="Mara Flamini, dermatóloga"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 440px"
            className={styles.image}
          />
        </div>
      </section>

      <section className={styles.services}>
        <header className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
          <p className={styles.sectionLead}>
            Atención dermatológica integral, con la cercanía de un consultorio
            que te conoce.
          </p>
        </header>
        <div className={styles.serviceGrid}>
          {SERVICES.map(({ Icon, title, description }) => (
            <Card key={title} className={styles.serviceCard}>
              <span className={styles.serviceIcon} aria-hidden="true">
                <Icon size={28} />
              </span>
              <h3 className={styles.serviceTitle}>{title}</h3>
              <p className={styles.serviceText}>{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>¿Listo para Cuidar tu Piel?</h2>
        <p className={styles.ctaLead}>
          Agendá tu visita hoy y empezá a cuidar la salud de tu piel.
        </p>
        <Button as={Link} href="/agendar-visita" className={styles.cta}>
          <CalendarIcon size={20} />
          Agendar visita
          <ArrowRightIcon size={18} />
        </Button>
      </section>
    </>
  );
}
