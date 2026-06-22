# 02 — Decoupled worker + outbox draining

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Notification Delivery](../PRD.md)

## What to build

Move delivery out of the request and into a decoupled, always-on drain loop (ADR-0001), still
using fake senders so this slice needs no external credentials.

- Grow the **Notification outbox** seam with the methods its doc-comment already anticipates:
  `pending()` (entries still to send) and `markFailed(id, error, attempts)`. Add an `attempts`
  counter and a `failed` status (or `lastError`) to the outbox entry. Sending an entry must first
  **claim** it (atomic pending → sending) so a restart or overlapping tick never double-sends; the
  Mongo adapter uses an atomic update and the in-memory fake mirrors it.
- Introduce `drainOutbox(deps)` — the orchestration a worker runs each tick: claim pending → route
  each entry to its Channel sender → `markSent`/`markFailed` (with bounded retry/backoff and a max
  attempt cap) → for a Confirmation's **whatsapp** entry, update the Appointment WhatsApp bookkeeping.
- Add a minimal **always-on worker entrypoint** (its own script + npm script) that loops
  `drainOutbox` on an interval. Both Channels use `FakeNotificationSender` in this slice.
- Switch Booking and Cancellation to **enqueue-only**: they no longer send or mark sent inline, and
  the Appointment bookkeeping now lands when the worker sends, not at booking time.

## Acceptance criteria

- [x] Outbox seam exposes `pending()` and `markFailed(...)`, with `attempts` and a `failed` state.
- [x] An entry is claimed before sending; a restart/duplicate tick does not send it twice.
- [x] `drainOutbox` sends pending entries and marks them `sent`; a failing sender marks the entry
      `failed`, increments `attempts`, and stops after the cap — without touching the other Channel's entry.
- [x] The whatsapp Confirmation entry updates the Appointment bookkeeping on success.
- [x] Booking/Cancellation only enqueue; a delivery outage never fails or rolls back the booking.
- [x] The worker entrypoint runs locally and drains the outbox via the fakes (demoable end-to-end).
- [x] Drain-loop behavior is covered by tests using the in-memory outbox + fake senders.

## Blocked by

- [01 — Two-channel Notification model + message composition](./01-two-channel-notification-composition.md)

## Comments

- 2026-06-22: Implemented on branch `notification-delivery`. The outbox seam grew `pending()` and
  `claim()` (atomic `pending → sending` — the double-send guard) and `markFailed()`; `OutboxEntry`
  gained `attempts`/`lastError` and the `sending`/`failed` states, mirrored in the in-memory and
  Mongo adapters (Mongo `claim` uses `findOneAndUpdate({id, status:"pending"})`). New `drain.ts` —
  `drainOutbox(deps)` claims each pending entry, sends via the Channel sender, then `markSent` or
  `markFailed` (back to `pending` under the attempt cap, else `failed`); a successful WhatsApp
  Confirmation records the Appointment bookkeeping; entries are handled independently so one Channel
  failing leaves the other untouched. Request path is now **enqueue-only** via a shared
  `enqueue-notifications.ts`; `notify-confirmation`/`notify-cancellation` no longer take a sender or
  touch bookkeeping, and `dispatch.ts` was removed. Worker entrypoint `scripts/notification-worker.ts`
  loops `drainOutbox` over the Mongo adapters with a `FakeNotificationSender`, run via **tsx**
  (`npm run worker`); slices 03–05 swap the real senders in there. Tests: new `drain.test.ts` (6) and
  `in-memory-notification-outbox.test.ts` (4); `notify-*`/`cancellation` tests updated to enqueue-only.
  typecheck + build clean; full suite 185/185; **smoke-run** against local Mongo drained a seeded
  pending entry to `sent`. Deferred (noted for later hardening): backoff *timing* (only the attempt
  cap is implemented) and reclaiming entries stuck in `sending` after a worker crash.
