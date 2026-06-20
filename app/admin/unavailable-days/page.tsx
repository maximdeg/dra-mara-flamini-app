import Link from "next/link";
import { getUnavailableDaysRepository } from "@/lib/availability/get-unavailable-days-repository";
import { UnavailableDaysManager } from "./unavailable-days-manager";

// Reads the persisted Unavailable Days on every request.
export const dynamic = "force-dynamic";

export default async function UnavailableDaysPage() {
  const repository = await getUnavailableDaysRepository();
  const days = await repository.list();

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <h1>Días no laborables</h1>
      <p>
        Bloqueá fechas puntuales aunque caigan en un día que atendés. Bloquear un
        día con turnos agendados requiere cancelarlos primero.
      </p>
      <UnavailableDaysManager days={days} />
    </main>
  );
}
