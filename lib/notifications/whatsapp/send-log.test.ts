import { describe, expect, it } from "vitest";
import {
  InMemoryWhatsAppSendLog,
  MESSAGING_LIMIT_TIER_250,
  summarizeUsage,
  windowStart,
  type WhatsAppSendRecord,
} from "./send-log";

function record(
  overrides: Partial<WhatsAppSendRecord> = {},
): WhatsAppSendRecord {
  return {
    sentAt: "2026-06-19T12:00:00.000Z",
    templateName: "appointment_confirmation_1",
    to: "+5493421112233",
    delivered: true,
    messageId: "wamid.ABC",
    errorCode: null,
    ...overrides,
  };
}

describe("windowStart", () => {
  it("opens the rolling window 24 hours before now", () => {
    expect(windowStart(new Date("2026-06-19T12:00:00.000Z"))).toBe(
      "2026-06-18T12:00:00.000Z",
    );
  });
});

describe("summarizeUsage", () => {
  it("reports an empty window as the full tier remaining", () => {
    expect(summarizeUsage([])).toEqual({
      used: 0,
      limit: MESSAGING_LIMIT_TIER_250,
      remaining: MESSAGING_LIMIT_TIER_250,
      failed: 0,
      resetsAt: null,
    });
  });

  it("counts only delivered messages against the limit", () => {
    const usage = summarizeUsage([
      record({ sentAt: "2026-06-19T09:00:00.000Z" }),
      record({ sentAt: "2026-06-19T10:00:00.000Z" }),
      record({
        sentAt: "2026-06-19T11:00:00.000Z",
        delivered: false,
        messageId: null,
        errorCode: 131049,
      }),
    ]);

    expect(usage.used).toBe(2);
    expect(usage.failed).toBe(1);
    expect(usage.remaining).toBe(MESSAGING_LIMIT_TIER_250 - 2);
  });

  it("resets 24 hours after the oldest delivered message", () => {
    const usage = summarizeUsage([
      record({ sentAt: "2026-06-19T10:00:00.000Z" }),
      record({ sentAt: "2026-06-19T08:30:00.000Z" }),
    ]);

    expect(usage.resetsAt).toBe("2026-06-20T08:30:00.000Z");
  });

  it("ignores rejected attempts when computing the reset", () => {
    const usage = summarizeUsage([
      record({
        sentAt: "2026-06-19T06:00:00.000Z",
        delivered: false,
        messageId: null,
        errorCode: 190,
      }),
      record({ sentAt: "2026-06-19T10:00:00.000Z" }),
    ]);

    expect(usage.resetsAt).toBe("2026-06-20T10:00:00.000Z");
  });

  it("never reports negative headroom once the tier is exhausted", () => {
    const records = Array.from({ length: 251 }, (_, i) =>
      record({ sentAt: `2026-06-19T10:00:${String(i % 60).padStart(2, "0")}.000Z` }),
    );

    const usage = summarizeUsage(records);

    expect(usage.used).toBe(251);
    expect(usage.remaining).toBe(0);
  });

  it("accepts a different tier limit", () => {
    expect(summarizeUsage([record()], 1000).remaining).toBe(999);
  });
});

describe("InMemoryWhatsAppSendLog", () => {
  it("records attempts and returns those inside the window, newest first", async () => {
    const log = new InMemoryWhatsAppSendLog();
    await log.record(record({ sentAt: "2026-06-17T12:00:00.000Z" })); // outside
    await log.record(record({ sentAt: "2026-06-19T09:00:00.000Z" }));
    await log.record(record({ sentAt: "2026-06-19T11:00:00.000Z" }));

    const inWindow = await log.since("2026-06-18T12:00:00.000Z");

    expect(inWindow.map((r) => r.sentAt)).toEqual([
      "2026-06-19T11:00:00.000Z",
      "2026-06-19T09:00:00.000Z",
    ]);
  });
});
