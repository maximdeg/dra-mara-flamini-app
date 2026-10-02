import { CtaBand } from "./_sections/cta-band";
import { Hero } from "./_sections/hero";
import { Services } from "./_sections/services";
import { Treatments } from "./_sections/treatments";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <Hero />
      <Services />
      <Treatments />
      <CtaBand />
    </div>
  );
}
