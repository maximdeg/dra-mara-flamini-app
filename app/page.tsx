import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Maraflamini</h1>
      <p>Consultorio de dermatología.</p>
      <p>
        <Link href="/agendar-visita">Agendar una visita</Link>
      </p>
    </main>
  );
}
