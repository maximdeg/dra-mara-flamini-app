/**
 * The WhatsApp Send Log — a record of every business-initiated WhatsApp the
 * clinic sends, kept so the Professional can see how much of Meta's messaging
 * limit the clinic has used.
 *
 * Meta caps business-initiated conversations on a rolling 24-hour window; the
 * clinic's number currently sits at TIER_250 (250 per 24h). Exceeding it makes
 * the Cloud API reject further sends (error 131049 / 130429) until the window
 * slides, and because Booking sends best-effort those rejections are otherwise
 * invisible. Recording each attempt — delivered or rejected — turns the limit
 * into something the Panel can show before it bites.
 */

/** Meta's messaging limit for the clinic's number (business-initiated / 24h). */
export const MESSAGING_LIMIT_TIER_250 = 250;

/** The rolling window Meta measures the limit over. */
const WINDOW_HOURS = 24;

/**
 * One recorded send attempt. `delivered` distinguishes a message the Cloud API
 * accepted (and therefore counted against the limit) from one it rejected.
 */
export interface WhatsAppSendRecord {
  /** ISO-8601 instant of the attempt. */
  sentAt: string;
  /** Approved template used, e.g. "appointment_confirmation_1". */
  templateName: string;
  /** Recipient in E.164. */
  to: string;
  /** Whether the Cloud API accepted the message. */
  delivered: boolean;
  /** The `wamid` when delivered, else null. */
  messageId: string | null;
  /** The Cloud API error code when rejected, else null. */
  errorCode: number | null;
}

export interface WhatsAppSendLog {
  record(entry: WhatsAppSendRecord): Promise<void>;
  /** Every attempt at or after `since`, newest first. */
  since(since: string): Promise<WhatsAppSendRecord[]>;
}

/**
 * How much of the messaging limit the rolling window has consumed — what the
 * Panel renders.
 */
export interface MessagingUsage {
  /** Delivered messages inside the window; what Meta counts. */
  used: number;
  /** The tier cap. */
  limit: number;
  /** Remaining headroom, never negative. */
  remaining: number;
  /** Attempts the Cloud API rejected inside the window. */
  failed: number;
  /** When the oldest counted message leaves the window, or null if none. */
  resetsAt: string | null;
}

/** The instant the rolling window opens, given "now". */
export function windowStart(now: Date): string {
  return new Date(now.getTime() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
}

/**
 * Summarize the rolling window from its records — pure, so the Panel's numbers
 * are testable without a database.
 *
 * Only delivered messages count against Meta's limit; rejected attempts are
 * reported separately because a burst of them is the visible symptom of having
 * hit the cap. `resetsAt` is 24h after the oldest counted message, the moment
 * headroom next frees up.
 */
export function summarizeUsage(
  records: WhatsAppSendRecord[],
  limit: number = MESSAGING_LIMIT_TIER_250,
): MessagingUsage {
  const delivered = records.filter((record) => record.delivered);
  const failed = records.length - delivered.length;

  const oldest = delivered
    .map((record) => record.sentAt)
    .sort()
    .at(0);

  return {
    used: delivered.length,
    limit,
    remaining: Math.max(0, limit - delivered.length),
    failed,
    resetsAt:
      oldest === undefined
        ? null
        : new Date(
            new Date(oldest).getTime() + WINDOW_HOURS * 60 * 60 * 1000,
          ).toISOString(),
  };
}

/**
 * In-memory Send Log — records into an array instead of a database. Stands in
 * for Mongo in tests and dev, mirroring the other in-memory adapters.
 */
export class InMemoryWhatsAppSendLog implements WhatsAppSendLog {
  readonly records: WhatsAppSendRecord[] = [];

  async record(entry: WhatsAppSendRecord): Promise<void> {
    this.records.push(entry);
  }

  async since(since: string): Promise<WhatsAppSendRecord[]> {
    return this.records
      .filter((record) => record.sentAt >= since)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }
}
