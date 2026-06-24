"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import styles from "./page.module.css";

// The Professional's sign-in page. Unprotected (see lib/auth/guard) so it stays
// reachable while signed out, and outside the dashboard shell so it shows no
// nav. On success it lands on the dashboard; bad credentials show a single
// generic message (we never reveal which field was wrong).
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
    <div className={styles.page}>
      <Card className={styles.card}>
        <header className={styles.header}>
          <span className={styles.brand}>Dra. Mara Flamini</span>
          <h1 className={styles.title}>Ingresar</h1>
          <p className={styles.subtitle}>Panel del profesional</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Contraseña" required>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" busy={pending} className={styles.submit}>
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
