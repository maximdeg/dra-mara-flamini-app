import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";
import styles from "./page.module.css";

export default function HomePage() {
  return (
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
  );
}
