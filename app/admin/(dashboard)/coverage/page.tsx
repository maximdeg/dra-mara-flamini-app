import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "@/lib/deposit/get-self-pay-pricing-repository";
import { CoverageEditor } from "./coverage-editor";
import styles from "./page.module.css";

// Reads the persisted coverage and pricing on every request.
export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const insurances = await (await getHealthInsuranceRepository()).list();
  const pricing = await (await getSelfPayPricingRepository()).get();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Coberturas y precios</h1>
      <CoverageEditor initialInsurances={insurances} initialPricing={pricing} />
    </div>
  );
}
