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

- [ ] Outbox seam exposes `pending()` and `markFailed(...)`, with `attempts` and a `failed` state.
- [ ] An entry is claimed before sending; a restart/duplicate tick does not send it twice.
- [ ] `drainOutbox` sends pending entries and marks them `sent`; a failing sender marks the entry
      `failed`, increments `attempts`, and stops after the cap — without touching the other Channel's entry.
- [ ] The whatsapp Confirmation entry updates the Appointment bookkeeping on success.
- [ ] Booking/Cancellation only enqueue; a delivery outage never fails or rolls back the booking.
- [ ] The worker entrypoint runs locally and drains the outbox via the fakes (demoable end-to-end).
- [ ] Drain-loop behavior is covered by tests using the in-memory outbox + fake senders.

## Blocked by

- [01 — Two-channel Notification model + message composition](./01-two-channel-notification-composition.md)
