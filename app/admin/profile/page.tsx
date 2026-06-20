import Link from "next/link";
import { auth } from "@/auth";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

// Reads the Professional from the database on every request.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const repository = await getProfessionalRepository();
  const professional = email ? await repository.findByEmail(email) : null;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <h1>Perfil</h1>
      <ProfileForm
        email={email}
        name={professional?.name ?? ""}
        phone={professional?.phone ?? ""}
        whatsappNumber={professional?.whatsappNumber ?? ""}
      />

      <h2 style={{ marginTop: "2rem" }}>Cambiar contraseña</h2>
      <ChangePasswordForm />
    </main>
  );
}
