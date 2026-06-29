import { getClinicInfoRepository } from "@/lib/clinic/get-clinic-info-repository";
import { ClinicInfoEditor } from "./clinic-info-editor";
import styles from "./page.module.css";

// Reads the persisted clinic copy on every request.
export const dynamic = "force-dynamic";

export default async function ClinicInfoPage() {
  const info = await getClinicInfoRepository().then((r) => r.get());

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Información de la cita</h1>
      <p className={styles.intro}>
        Editá el texto que ve el paciente en la página de su cita. Los cambios se
        reflejan de inmediato.
      </p>
      <ClinicInfoEditor initialInfo={info} />
    </div>
  );
}
