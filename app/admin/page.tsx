import Link from "next/link";
import { auth, signOut } from "@/auth";

// The dashboard shell. Reaching it at all means the middleware let the request
// through, i.e. the Professional is signed in. Later slices fill it with the
// Appointments list, calendar, schedule, and coverage management.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Panel</h1>
      <p>Sesión iniciada como {session?.user?.email}.</p>
      <p>Desde acá vas a gestionar turnos, agenda y coberturas.</p>
      <ul>
        <li>
          <Link href="/admin/appointments">Turnos</Link>
        </li>
        <li>
          <Link href="/admin/calendar">Calendario</Link>
        </li>
        <li>
          <Link href="/admin/schedule">Horarios</Link>
        </li>
        <li>
          <Link href="/admin/unavailable-days">Días no laborables</Link>
        </li>
        <li>
          <Link href="/admin/coverage">Coberturas y precios</Link>
        </li>
        <li>
          <Link href="/admin/profile">Perfil</Link>
        </li>
      </ul>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/sign-in" });
        }}
      >
        <button type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}
