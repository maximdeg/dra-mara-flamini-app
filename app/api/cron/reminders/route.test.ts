import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Appointment } from "@/lib/appointments/appointment";
import { InMemoryAppointmentRepository } from "@/lib/appointments/in-memory-appointment-repository";
import { FakeWhatsAppSender } from "@/lib/notifications/whatsapp/whatsapp-sender";
import { GET } from "./route";

const sender = new FakeWhatsAppSender();
const appointments = new InMemoryAppointmentRepository();

vi.mock("@/lib/notifications/whatsapp/get-reminder-deps", () => ({
  getReminderDeps: async () => ({
    appointments,
    sender,
    // 08:00 in Argentina, so tomorrow is 2026-11-03.
    now: () => new Date("2026-11-02T11:00:00.000Z"),
  }),
}));

const tomorrows: Appointment = {
  id: "apt-1",
  patientFirstName: "Lucía",
  patientLastName: "Gómez",
  patientPhone: "+5493421112233",
  patientEmail: null,
  visitType: "Consultation",
  consultType: "FollowUp",
  practiceType: null,
  coverage: { kind: "health-insurance", name: "OSDE" },
  deposit: null,
  date: "2026-11-03",
  time: "09:30",
  status: "scheduled",
  whatsappSent: true,
  whatsappSentAt: null,
  whatsappMessageId: null,
  emailSent: false,
  emailSentAt: null,
  emailMessageId: null,
  createdAt: "2026-10-20T12:00:00.000Z",
};

function get(authorization?: string) {
  return GET(
    new Request("http://localhost/api/cron/reminders", {
      headers: authorization ? { authorization } : {},
    }),
  );
}

beforeEach(async () => {
  sender.sent.length = 0;
  await appointments.create({ ...tomorrows });
  vi.stubEnv("CRON_SECRET", "s3cret-s3cret-s3cret");
  vi.stubEnv("META_WHATSAPP_REMINDERS_ENABLED", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/cron/reminders", () => {
  it("refuses a request without the cron secret", async () => {
    expect((await get()).status).toBe(401);
    expect((await get("Bearer wrong")).status).toBe(401);
    expect(sender.sent).toHaveLength(0);
  });

  it("refuses every request when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await get("Bearer ")).status).toBe(401);
    expect((await get("Bearer undefined")).status).toBe(401);
    expect(sender.sent).toHaveLength(0);
  });

  it("sends nothing while reminders are disabled", async () => {
    vi.stubEnv("META_WHATSAPP_REMINDERS_ENABLED", "false");

    const response = await get("Bearer s3cret-s3cret-s3cret");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enabled: false });
    expect(sender.sent).toHaveLength(0);
  });

  it("reminds tomorrow's Appointments and returns the summary", async () => {
    const response = await get("Bearer s3cret-s3cret-s3cret");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      enabled: true,
      date: "2026-11-03",
      sent: 1,
      skipped: 0,
      failed: [],
    });
    expect(sender.last?.templateName).toBe("confirmation_reminder");
  });
});
