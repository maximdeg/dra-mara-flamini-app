import { auth } from "@/auth";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";
import { Card } from "@/components/ui/card";
import { ProfileTabs } from "./profile-tabs";
import styles from "./profile.module.css";

// Reads the Professional from the database on every request.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const repository = await getProfessionalRepository();
  const professional = email ? await repository.findByEmail(email) : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Perfil</h1>
      <Card>
        <ProfileTabs
          email={email}
          name={professional?.name ?? ""}
          phone={professional?.phone ?? ""}
          whatsappNumber={professional?.whatsappNumber ?? ""}
        />
      </Card>
    </div>
  );
}
