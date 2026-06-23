import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import {
  AwardIcon,
  ShieldIcon,
  UsersIcon,
  type IconProps,
} from "@/components/ui/icons";
import styles from "./services.module.css";

type Service = {
  Icon: ComponentType<IconProps>;
  title: string;
  description: string;
};

const SERVICES: Service[] = [
  {
    Icon: ShieldIcon,
    title: "Dermatología General",
    description:
      "Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.",
  },
  {
    Icon: UsersIcon,
    title: "Dermatología Estética",
    description: "Tratamientos para mejorar la apariencia y salud de tu piel.",
  },
  {
    Icon: AwardIcon,
    title: "Cirugía Dermatológica",
    description: "Procedimientos quirúrgicos especializados en dermatología.",
  },
];

/** The "Nuestros Servicios" band: a heading plus three service cards. */
export function Services() {
  return (
    <section className={styles.services}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 className={styles.title}>Nuestros Servicios</h2>
          <p className={styles.subtitle}>
            Ofrecemos una amplia gama de servicios dermatológicos con la más
            alta calidad y tecnología.
          </p>
        </header>
        <div className={styles.grid}>
          {SERVICES.map(({ Icon, title, description }) => (
            <Card key={title} className={styles.card}>
              <span className={styles.icon}>
                <Icon size={28} />
              </span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
