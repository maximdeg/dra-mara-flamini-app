import Link from "next/link";
import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "@/lib/deposit/get-self-pay-pricing-repository";
import {
  addInsuranceAction,
  editInsuranceAction,
  removeInsuranceAction,
  saveSelfPayPricingAction,
} from "./actions";

// Reads the persisted coverage and pricing on every request.
export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const insurances = await (await getHealthInsuranceRepository()).list();
  const pricing = await (await getSelfPayPricingRepository()).get();

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <h1>Coberturas y precios</h1>

      <section>
        <h2>Particular (Self-Pay)</h2>
        <p style={{ color: "#666" }}>
          Las dos variantes Particular son fijas y no se pueden renombrar ni
          eliminar; solo se editan sus precios.
        </p>
        <form
          action={saveSelfPayPricingAction}
          style={{ display: "grid", gap: "0.6rem", maxWidth: 420 }}
        >
          <label>
            Particular (Consulta) — precio
            <br />
            <input
              type="number"
              name="consultationFullPrice"
              min={0}
              defaultValue={pricing.consultationFullPrice}
            />
          </label>
          <label>
            Practica Particular — precio (también es la seña)
            <br />
            <input
              type="number"
              name="practiceFullPrice"
              min={0}
              defaultValue={pricing.practiceFullPrice}
            />
          </label>
          <label>
            Seña de primera consulta Particular
            <br />
            <input
              type="number"
              name="firstVisitConsultationDeposit"
              min={0}
              defaultValue={pricing.firstVisitConsultationDeposit}
            />
          </label>
          <button type="submit">Guardar precios</button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Obras sociales</h2>
        {insurances.length === 0 ? (
          <p>No hay obras sociales cargadas.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {insurances.map((insurance) => (
              <li
                key={insurance.name}
                style={{ border: "1px solid #eee", borderRadius: 6, padding: "0.6rem", marginBottom: "0.6rem" }}
              >
                <form
                  action={editInsuranceAction}
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}
                >
                  <input type="hidden" name="originalName" value={insurance.name} />
                  <label>
                    Nombre
                    <br />
                    <input name="name" defaultValue={insurance.name} required />
                  </label>
                  <label>
                    Precio
                    <br />
                    <input type="number" name="price" min={0} defaultValue={insurance.price} />
                  </label>
                  <label>
                    Notas
                    <br />
                    <input name="notes" defaultValue={insurance.notes} />
                  </label>
                  <button type="submit">Guardar</button>
                </form>
                <form action={removeInsuranceAction} style={{ marginTop: "0.4rem" }}>
                  <input type="hidden" name="name" value={insurance.name} />
                  <button type="submit">Quitar</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <h3>Agregar obra social</h3>
        <form
          action={addInsuranceAction}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <label>
            Nombre
            <br />
            <input name="name" required />
          </label>
          <label>
            Precio
            <br />
            <input type="number" name="price" min={0} defaultValue={0} />
          </label>
          <label>
            Notas
            <br />
            <input name="notes" />
          </label>
          <button type="submit">Agregar</button>
        </form>
      </section>
    </main>
  );
}
