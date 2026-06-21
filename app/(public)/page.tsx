import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.hero}>
      <Card className={styles.card}>
        <p className={styles.eyebrow}>Consultorio de dermatología</p>
        <h1 className={styles.title}>Maraflamini</h1>
        <p className={styles.lead}>
          Reservá tu visita en línea, sin crear una cuenta. Elegí el día y el
          horario que mejor te queden.
        </p>
        <Button as={Link} href="/agendar-visita" className={styles.cta}>
          Agendar una visita
        </Button>
      </Card>
    </div>
  );
}
