import type { Db, Filter } from "mongodb";
import type { Appointment } from "./appointment";
import type {
  AppointmentQuery,
  AppointmentRepository,
} from "./appointment-repository";

const COLLECTION = "appointments";

/**
 * MongoDB adapter at the repository seam — the production implementation.
 *
 * It receives an already-connected Db (it does not create its own connection),
 * so it stays a thin adapter and is itself easy to point at any database. The
 * Appointment's own `id` is the lookup key; Mongo's `_id` is projected away on
 * read so callers only ever see the domain shape.
 */
export class MongoAppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: Db) {}

  async create(appointment: Appointment): Promise<Appointment> {
    await this.db.collection(COLLECTION).insertOne({ ...appointment });
    return appointment;
  }

  async findById(id: string): Promise<Appointment | null> {
    const doc = await this.db
      .collection(COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });
    return (doc as Appointment | null) ?? null;
  }

  async scheduledTimesOn(date: string): Promise<string[]> {
    const docs = await this.db
      .collection<Appointment>(COLLECTION)
      .find({ date, status: "scheduled" }, { projection: { _id: 0, time: 1 } })
      .toArray();
    return docs.map((doc) => doc.time);
  }

  async findScheduledByPhone(phone: string): Promise<Appointment[]> {
    const docs = await this.db
      .collection<Appointment>(COLLECTION)
      .find(
        { patientPhone: phone, status: "scheduled" },
        { projection: { _id: 0 } },
      )
      .toArray();
    return docs;
  }

  async markConfirmationSent(
    id: string,
    sentAt: string,
    messageId: string,
  ): Promise<void> {
    await this.db.collection(COLLECTION).updateOne(
      { id },
      {
        $set: {
          whatsappSent: true,
          whatsappSentAt: sentAt,
          whatsappMessageId: messageId,
        },
      },
    );
  }

  async markEmailSent(
    id: string,
    sentAt: string,
    messageId: string,
  ): Promise<void> {
    await this.db.collection(COLLECTION).updateOne(
      { id },
      {
        $set: {
          emailSent: true,
          emailSentAt: sentAt,
          emailMessageId: messageId,
        },
      },
    );
  }

  async markCancelled(id: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ id }, { $set: { status: "cancelled" } });
  }

  async findAppointments(query: AppointmentQuery): Promise<Appointment[]> {
    const filter: Filter<Appointment> = {};
    if (query.from !== undefined || query.to !== undefined) {
      filter.date = {
        ...(query.from !== undefined ? { $gte: query.from } : {}),
        ...(query.to !== undefined ? { $lte: query.to } : {}),
      };
    }
    if (query.status !== undefined) {
      filter.status = query.status;
    }
    if (query.visitType !== undefined) {
      filter.visitType = query.visitType;
    }

    const docs = await this.db
      .collection<Appointment>(COLLECTION)
      .find(filter, { projection: { _id: 0 } })
      .sort({ date: 1, time: 1 })
      .toArray();
    return docs;
  }
}
