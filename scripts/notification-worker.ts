// The always-on Notification worker (ADR-0001).
//
// Booking and cancellation only enqueue Notifications; this long-lived process
// drains the outbox on an interval and delivers them, decoupled from the
// request path. Run it alongside the app:
//
//   npm run worker
//
// For now both Channels use the FakeNotificationSender — the real Baileys and
// nodemailer adapters arrive in later slices (03–05), swapped in right here.

import { getDb } from "../lib/db/mongo";
import { MongoAppointmentRepository } from "../lib/appointments/mongo-appointment-repository";
import { drainOutbox, type DrainDependencies } from "../lib/notifications/drain";
import { MongoNotificationOutbox } from "../lib/notifications/mongo-notification-outbox";
import { FakeNotificationSender } from "../lib/notifications/sender";

const INTERVAL_MS = Number(process.env.NOTIFICATION_WORKER_INTERVAL_MS ?? 5000);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  const db = await getDb();
  const deps: DrainDependencies = {
    outbox: new MongoNotificationOutbox(db),
    sender: new FakeNotificationSender(),
    appointments: new MongoAppointmentRepository(db),
  };

  let running = true;
  const stop = (signal: string) => {
    console.log(`[worker] ${signal} received, stopping after this tick…`);
    running = false;
  };
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));

  console.log(`[worker] draining the Notification outbox every ${INTERVAL_MS}ms`);
  while (running) {
    try {
      const { sent, failed } = await drainOutbox(deps);
      if (sent || failed) {
        console.log(`[worker] tick: sent=${sent} failed=${failed}`);
      }
    } catch (error) {
      console.error("[worker] tick error", error);
    }
    if (running) {
      await sleep(INTERVAL_MS);
    }
  }

  console.log("[worker] stopped");
  process.exit(0);
}

main().catch((error) => {
  console.error("[worker] fatal", error);
  process.exit(1);
});
