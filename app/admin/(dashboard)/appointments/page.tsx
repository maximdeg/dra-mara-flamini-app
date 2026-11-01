import { listAppointments } from "@/lib/appointments/appointment-listing";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import {
  DERIVED_STATUSES,
  filterFromSearchParams,
  type SearchParams,
} from "@/lib/appointments/appointment-filter-params";
import { STATUS_LABELS } from "@/lib/appointments/status";
import { VISIT_TYPES, VISIT_TYPE_LABELS } from "@/lib/appointments/visit-type";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { AppointmentsTable } from "./appointments-table";
import styles from "./page.module.css";

// Reads Appointments from the database on every request.
export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter = filterFromSearchParams(params);
  const views = await listAppointments(filter, {
    repository: await getAppointmentRepository(),
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Turnos</h1>

      <Card>
        <form method="get" className={styles.filters}>
          <Field label="Estado">
            <select name="status" defaultValue={filter.status ?? ""}>
              <option value="">Todos</option>
              {DERIVED_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de visita">
            <select name="visitType" defaultValue={filter.visitType ?? ""}>
              <option value="">Todos</option>
              {VISIT_TYPES.map((vt) => (
                <option key={vt} value={vt}>
                  {VISIT_TYPE_LABELS[vt]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Desde">
            <input type="date" name="from" defaultValue={filter.from ?? ""} />
          </Field>
          <Field label="Hasta">
            <input type="date" name="to" defaultValue={filter.to ?? ""} />
          </Field>
          <Button type="submit" className={styles.filterSubmit}>
            Filtrar
          </Button>
        </form>
      </Card>

      {views.length === 0 ? (
        <Card>
          <p className={styles.empty}>No hay turnos para este filtro.</p>
        </Card>
      ) : (
        <Card className={styles.tableCard}>
          <AppointmentsTable views={views} />
        </Card>
      )}
    </div>
  );
}
