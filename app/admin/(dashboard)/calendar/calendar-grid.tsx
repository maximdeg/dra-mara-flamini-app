import Link from "next/link";
import type { MonthCalendar } from "@/lib/appointments/calendar";
import { cn } from "@/components/ui/cn";
import styles from "./calendar-grid.module.css";

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Presentational month grid. Each in-month day links to itself (selecting it
 * shows that day's agenda) and shows its Appointment count; today's number is
 * circled, the selected day is highlighted.
 */
export function MonthCalendarGrid({
  calendar,
  monthParam,
  todayISO,
  selectedDay,
}: {
  calendar: MonthCalendar;
  monthParam: string;
  todayISO: string;
  selectedDay?: string;
}) {
  return (
    <div className={styles.wrap}>
      <table className={styles.grid}>
        <thead>
          <tr>
            {WEEKDAY_HEADERS.map((header) => (
              <th key={header} className={styles.weekday}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell) => {
                const dayNumber = Number(cell.date.slice(8, 10));
                const isToday = cell.date === todayISO;
                const isSelected = cell.date === selectedDay;

                if (!cell.inMonth) {
                  return (
                    <td
                      key={cell.date}
                      className={cn(styles.cell, styles.outside)}
                    >
                      <span className={styles.dayNumber}>{dayNumber}</span>
                    </td>
                  );
                }

                return (
                  <td
                    key={cell.date}
                    className={cn(styles.cell, isSelected && styles.selected)}
                  >
                    <Link
                      href={`/admin/calendar?month=${monthParam}&day=${cell.date}`}
                      className={styles.dayLink}
                      aria-current={isSelected ? "date" : undefined}
                    >
                      <span
                        className={cn(
                          styles.dayNumber,
                          isToday && styles.todayNumber,
                        )}
                      >
                        {dayNumber}
                      </span>
                      {cell.count > 0 ? (
                        <span className={styles.count}>
                          {cell.count} turno{cell.count === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
