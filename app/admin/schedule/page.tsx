import Link from "next/link";
import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { ScheduleEditor } from "./schedule-editor";

// Reads the persisted Work Schedule on every request.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const repository = await getWorkScheduleRepository();
  const schedule = await repository.get();

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <h1>Horarios de atención</h1>
      <p>
        Marcá los días que atendés y sus rangos horarios. Reducir la agenda
        cuando hay turnos agendados requiere cancelarlos primero.
      </p>
      <ScheduleEditor initial={schedule} />
    </main>
  );
}
