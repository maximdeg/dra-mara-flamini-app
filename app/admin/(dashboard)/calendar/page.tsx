import Link from "next/link";
import { listAppointments } from "@/lib/appointments/appointment-listing";
import { buildMonthCalendar, monthBounds } from "@/lib/appointments/calendar";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { VISIT_TYPE_LABELS } from "@/lib/appointments/visit-type";
import { formatDateAR } from "@/lib/datetime/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MonthCalendarGrid } from "./calendar-grid";
import styles from "./page.module.css";

// Reads Appointments from the database on every request.
export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseMonth(
  value: string | undefined,
  now: Date,
): { year: number; month: number } {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const now = new Date();
  const { year, month } = parseMonth(one(params.month), now);
  const selectedDay = one(params.day);
  const monthParam = `${year}-${pad(month)}`;

  const { from, to } = monthBounds(year, month);
  const allViews = await listAppointments(
    { from, to },
    { repository: await getAppointmentRepository() },
  );
  // The calendar is a workload view: Cancelled Appointments freed their slot, so
  // they are excluded from the grid and counts.
  const views = allViews.filter((v) => v.status !== "cancelled");
  const calendar = buildMonthCalendar(year, month, views);

  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const prevParam = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}`;
  const nextParam = `${next.getFullYear()}-${pad(next.getMonth() + 1)}`;

  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const selectedViews = selectedDay
    ? views.filter((v) => v.appointment.date === selectedDay)
    : [];

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Button as={Link} href={`/admin/calendar?month=${prevParam}`} variant="ghost">
          ← Mes anterior
        </Button>
        <h1 className={styles.title}>
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <Button as={Link} href={`/admin/calendar?month=${nextParam}`} variant="ghost">
          Mes siguiente →
        </Button>
      </header>

      <Card className={styles.calendarCard}>
        <MonthCalendarGrid
          calendar={calendar}
          monthParam={monthParam}
          todayISO={todayISO}
          selectedDay={selectedDay}
        />
      </Card>

      <Card>
        {selectedDay ? (
          <>
            <h2 className={styles.dayTitle}>
              Turnos del {formatDateAR(selectedDay)}
            </h2>
            {selectedViews.length === 0 ? (
              <p className={styles.empty}>No hay turnos este día.</p>
            ) : (
              <ul className={styles.agenda}>
                {selectedViews.map(({ appointment, status }) => (
                  <li key={appointment.id} className={styles.agendaItem}>
                    <span className={styles.agendaTime}>{appointment.time}</span>
                    <span className={styles.agendaName}>
                      {appointment.patientFirstName} {appointment.patientLastName}
                    </span>
                    <span className={styles.agendaType}>
                      {VISIT_TYPE_LABELS[appointment.visitType]}
                    </span>
                    <StatusBadge status={status} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className={styles.empty}>Seleccioná un día para ver sus turnos.</p>
        )}
      </Card>
    </div>
  );
}
