import Link from "next/link";
import {
  listAppointments,
  type AppointmentFilter,
} from "@/lib/appointments/appointment-listing";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { STATUS_LABELS, type DerivedStatus } from "@/lib/appointments/status";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPES,
  VISIT_TYPE_LABELS,
  type VisitType,
} from "@/lib/appointments/visit-type";
import { coverageLabel } from "@/lib/coverage/coverage";
import { cancelAppointmentAsProfessional } from "./actions";

// Reads Appointments from the database on every request.
export const dynamic = "force-dynamic";

const DERIVED_STATUSES: DerivedStatus[] = [
  "scheduled",
  "cancelled",
  "completed",
];

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

function parseFilter(params: SearchParams): AppointmentFilter {
  const status = one(params.status);
  const visitType = one(params.visitType);
  return {
    from: one(params.from),
    to: one(params.to),
    status: DERIVED_STATUSES.includes(status as DerivedStatus)
      ? (status as DerivedStatus)
      : undefined,
    visitType: VISIT_TYPES.includes(visitType as VisitType)
      ? (visitType as VisitType)
      : undefined,
  };
}

function subTypeLabel(appointment: {
  consultType: string | null;
  practiceType: string | null;
}): string | null {
  if (appointment.consultType) {
    return CONSULT_TYPE_LABELS[
      appointment.consultType as keyof typeof CONSULT_TYPE_LABELS
    ];
  }
  if (appointment.practiceType) {
    return PRACTICE_TYPE_LABELS[
      appointment.practiceType as keyof typeof PRACTICE_TYPE_LABELS
    ];
  }
  return null;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter = parseFilter(params);
  const views = await listAppointments(filter, {
    repository: await getAppointmentRepository(),
  });

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <h1>Turnos</h1>

      <form
        method="get"
        style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end", margin: "1rem 0" }}
      >
        <label>
          Estado
          <br />
          <select name="status" defaultValue={filter.status ?? ""}>
            <option value="">Todos</option>
            {DERIVED_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo de visita
          <br />
          <select name="visitType" defaultValue={filter.visitType ?? ""}>
            <option value="">Todos</option>
            {VISIT_TYPES.map((vt) => (
              <option key={vt} value={vt}>
                {VISIT_TYPE_LABELS[vt]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <br />
          <input type="date" name="from" defaultValue={filter.from ?? ""} />
        </label>
        <label>
          Hasta
          <br />
          <input type="date" name="to" defaultValue={filter.to ?? ""} />
        </label>
        <button type="submit">Filtrar</button>
      </form>

      {views.length === 0 ? (
        <p>No hay turnos para este filtro.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Tipo</th>
              <th>Cobertura</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {views.map(({ appointment, status }) => {
              const sub = subTypeLabel(appointment);
              return (
                <tr key={appointment.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>
                    {appointment.patientFirstName} {appointment.patientLastName}
                  </td>
                  <td>
                    {VISIT_TYPE_LABELS[appointment.visitType]}
                    {sub ? ` · ${sub}` : ""}
                  </td>
                  <td>{coverageLabel(appointment.coverage)}</td>
                  <td>{STATUS_LABELS[status]}</td>
                  <td>
                    {status === "scheduled" ? (
                      <form action={cancelAppointmentAsProfessional}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <button type="submit">Cancelar</button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
