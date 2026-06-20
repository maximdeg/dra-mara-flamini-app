import type { Appointment } from "./appointment";
import type {
  AppointmentQuery,
  AppointmentRepository,
} from "./appointment-repository";

/**
 * In-memory adapter at the repository seam — the reference fake for tests and
 * local dev. It holds Appointments in a Map, with no database. This is the
 * adapter modules are tested against; production uses MongoAppointmentRepository.
 */
export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments = new Map<string, Appointment>();

  async create(appointment: Appointment): Promise<Appointment> {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) ?? null;
  }

  async scheduledTimesOn(date: string): Promise<string[]> {
    return [...this.appointments.values()]
      .filter((a) => a.date === date && a.status === "scheduled")
      .map((a) => a.time);
  }

  async findScheduledByPhone(phone: string): Promise<Appointment[]> {
    return [...this.appointments.values()].filter(
      (a) => a.patientPhone === phone && a.status === "scheduled",
    );
  }

  async markConfirmationSent(
    id: string,
    sentAt: string,
    messageId: string,
  ): Promise<void> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      this.appointments.set(id, {
        ...appointment,
        whatsappSent: true,
        whatsappSentAt: sentAt,
        whatsappMessageId: messageId,
      });
    }
  }

  async markCancelled(id: string): Promise<void> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      this.appointments.set(id, { ...appointment, status: "cancelled" });
    }
  }

  async findAppointments(query: AppointmentQuery): Promise<Appointment[]> {
    return [...this.appointments.values()]
      .filter(
        (a) =>
          (query.from === undefined || a.date >= query.from) &&
          (query.to === undefined || a.date <= query.to) &&
          (query.status === undefined || a.status === query.status) &&
          (query.visitType === undefined || a.visitType === query.visitType),
      )
      .sort((a, b) =>
        a.date === b.date
          ? a.time.localeCompare(b.time)
          : a.date.localeCompare(b.date),
      );
  }
}
