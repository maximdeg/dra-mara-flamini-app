"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// The Professional's sign-in page. Unprotected (see lib/auth/guard) so it stays
// reachable while signed out. On success it lands on the dashboard; bad
// credentials show a single generic message (we never reveal which field was
// wrong).
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      setPending(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Ingresar</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Email
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
        </p>
        <p>
          <label>
            Contraseña
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
        </p>
        <button type="submit" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
    </main>
  );
}
