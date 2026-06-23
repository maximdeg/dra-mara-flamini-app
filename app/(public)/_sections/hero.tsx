import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";
import styles from "./hero.module.css";

/** The landing hero: practice image alongside the headline, lead, and CTA. */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            Tu Piel, Nuestra <span className={styles.accent}>Especialidad</span>
          </h1>
          <p className={styles.lead}>
            Cuidamos de la salud y belleza de tu piel con la más alta tecnología
            y experiencia médica especializada.
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
            alt="Primer plano de piel sana iluminada por luz natural"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            priority
            className={styles.image}
          />
          <span className={styles.overlay} aria-hidden />
        </div>
      </div>
    </section>
  );
}
