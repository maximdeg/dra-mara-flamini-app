import Link from "next/link";
import { listAppointments } from "@/lib/appointments/appointment-listing";
import { buildMonthCalendar, monthBounds } from "@/lib/appointments/calendar";
import { getAppointmentRepository } from "@/lib/appointments/get-appointment-repository";
import { STATUS_LABELS } from "@/lib/appointments/status";
import { VISIT_TYPE_LABELS } from "@/lib/appointments/visit-type";

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
const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseMonth(value: string | undefined, now: Date): { year: number; month: number } {
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
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
      <p>
        <Link href="/admin">← Panel</Link>
      </p>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href={`/admin/calendar?month=${prevParam}`}>← Mes anterior</Link>
        <h1 style={{ margin: 0 }}>
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <Link href={`/admin/calendar?month=${nextParam}`}>Mes siguiente →</Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {WEEKDAY_HEADERS.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "0.25rem", fontSize: "0.85rem" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell) => {
                const dayNumber = Number(cell.date.slice(8, 10));
                const isToday = cell.date === todayISO;
                const cellStyle: React.CSSProperties = {
                  border: "1px solid #e5e5e5",
                  verticalAlign: "top",
                  height: 72,
                  padding: "0.25rem",
                  background: cell.inMonth ? (isToday ? "#eef6ff" : "#fff") : "#fafafa",
                  color: cell.inMonth ? "inherit" : "#bbb",
                };
                return (
                  <td key={cell.date} style={cellStyle}>
                    {cell.inMonth ? (
                      <Link
                        href={`/admin/calendar?month=${monthParam}&day=${cell.date}`}
                        style={{ textDecoration: "none", color: "inherit", display: "block" }}
                      >
                        <span style={{ fontWeight: isToday ? 700 : 400 }}>{dayNumber}</span>
                        {cell.count > 0 ? (
                          <span
                            style={{
                              display: "block",
                              marginTop: 4,
                              fontSize: "0.75rem",
                              background: "#0f172a",
                              color: "#fff",
                              borderRadius: 4,
                              padding: "1px 6px",
                              width: "fit-content",
                            }}
                          >
                            {cell.count} turno{cell.count === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </Link>
                    ) : (
                      <span>{dayNumber}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDay ? (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Turnos del {selectedDay}</h2>
          {selectedViews.length === 0 ? (
            <p>No hay turnos este día.</p>
          ) : (
            <ul>
              {selectedViews.map(({ appointment, status }) => (
                <li key={appointment.id}>
                  {appointment.time} · {appointment.patientFirstName}{" "}
                  {appointment.patientLastName} ·{" "}
                  {VISIT_TYPE_LABELS[appointment.visitType]} ·{" "}
                  {STATUS_LABELS[status]}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Seleccioná un día para ver sus turnos.
        </p>
      )}
    </main>
  );
}
