# PRD: Notification Delivery — real WhatsApp (Baileys) + Email (Gmail), with a cancel link

Status: ready-for-agent

## Problem Statement

A Patient who books an Appointment today receives nothing. The Notification subsystem
exists only as scaffolding: a `NotificationSender` seam with a single `FakeNotificationSender`
that returns a synthetic message id, a Mongo-backed outbox, and an inline
`dispatchNotification` (enqueue → send → markSent) that Booking and Cancellation call
best-effort. No message ever leaves the system, and the `Notification` carries no message
text — only `kind`, `appointmentId`, and `patientPhone`.

Two things are missing from the Patient's point of view:

- **No real Confirmation or Cancellation Notice.** The clinic wants the Patient to actually
  receive a WhatsApp message from the number they already know (the secretaries' number,
  per ADR-0001) when they book and when an Appointment is cancelled.
- **No way to act on the message.** A Confirmation should let the Patient reach the cancel
  page for that exact Appointment without searching — i.e. it must carry a link to
  `/cita/{appointmentId}`, the public page that already renders the Appointment and its
  Cancellation button.

The Professional also wants an **email** copy of every Notification, so there is a written
record in the Patient's inbox independent of WhatsApp's reliability and ban risk. This is a
deliberate extension of the domain: CONTEXT.md currently defines a Notification as a
*WhatsApp message* and explicitly lists "Confirmation email" under _Avoid_. That guidance
changes with this work.

Finally, ADR-0001 requires WhatsApp delivery to run in a **long-lived process** holding a
persistent session — but today delivery happens **inline inside the booking request**, which
on a serverless runtime cannot hold a Baileys socket. The decoupled worker the ADR calls for
has never been built.

## Solution

Make Notifications real, on **two channels that both always fire**, delivered by a **decoupled
always-on worker** rather than inline in the request:

1. **Promote the Notification to a two-channel concept.** A Notification is now sent over both
   **WhatsApp** and **Email**. Each channel is enqueued as its own outbox entry with its own
   send state, so WhatsApp can succeed while Email retries, and vice versa. This applies to
   both the Confirmation and the Cancellation Notice.

2. **Compose real message bodies.** A pure composition step turns an Appointment into the
   Patient-facing text: a WhatsApp body and an email (subject + HTML + plain-text). Both carry
   the Appointment's date, time, and details, and the Confirmation carries the **cancel link**
   `{PUBLIC_BASE_URL}/cita/{appointmentId}`. Copy is in Spanish, matching the UI.

3. **Real WhatsApp delivery via Baileys.** A real `NotificationSender` adapter holds a Baileys
   socket logged in as the clinic's number as a linked companion device, with persisted auth
   state and `markOnlineOnConnect: false` (ADR-0001). It sends a text message to the Patient's
   number as a WhatsApp JID.

4. **Real Email delivery via nodemailer over Gmail.** A second `NotificationSender` adapter
   sends through `smtp.gmail.com` using a Gmail **App Password** (the Google account must have
   2-Step Verification enabled).

5. **Decouple delivery into an always-on worker.** Booking and Cancellation now **only enqueue**
   the Notifications (per channel) and return immediately; they never block on or fail because
   of delivery. A standalone long-lived Node worker drains the outbox: it claims pending entries,
   routes each to its channel adapter, and records `sent` or `failed` with retry/backoff. This
   is the "real worker slice" deferred since slice 06.

The result: book an Appointment → the Patient gets a WhatsApp Confirmation and an email, both
with a working cancel link; cancel (by Patient or Professional) → both channels send a
Cancellation Notice. Delivery never costs a Patient their Appointment.

## User Stories

### Patient

1. As a Patient, I want to receive a WhatsApp Confirmation right after I book, so that I know my Appointment was registered.
2. As a Patient, I want the Confirmation to come from the clinic's familiar number, so that I trust it and can reply to a human if needed.
3. As a Patient, I want the Confirmation to show my Appointment's date and time, so that I can add it to my own calendar.
4. As a Patient, I want the Confirmation to show the Visit Type and its sub-type (Consultation/Practice and Consult/Practice Type), so that I know what I booked.
5. As a Patient, I want the Confirmation to show my chosen coverage (Health Insurance or Self-Pay), so that I bring the right documentation.
6. As a Patient who owes a Deposit, I want the Confirmation to mention the Deposit I acknowledged, so that I remember to transfer it.
7. As a Patient, I want the Confirmation to include a link to cancel this exact Appointment, so that I don't have to look up anything to cancel.
8. As a Patient, I want that cancel link to open the page for my Appointment specifically, so that I cancel the right one.
9. As a Patient, I want to also receive an email Confirmation, so that I have a written record even if I lose the WhatsApp message.
10. As a Patient, I want the email to contain the same details and the same cancel link, so that either channel is enough on its own.
11. As a Patient, I want to receive a WhatsApp Cancellation Notice when my Appointment is cancelled, so that I know the slot is no longer held.
12. As a Patient, I want to receive a Cancellation Notice whether I cancelled it myself or the Professional did, so that I'm never surprised.
13. As a Patient, I want an email Cancellation Notice too, so that the cancellation is recorded in my inbox.
14. As a Patient, I want to still get my Appointment even if WhatsApp or email delivery is down, so that a messaging outage never blocks my booking.
15. As a Patient, I want messages in Spanish, so that they match the rest of the site.
16. As a Patient whose number isn't on WhatsApp, I want to at least receive the email, so that I'm not left with nothing.

### Professional / clinic operator

17. As the Professional, I want every Confirmation and Cancellation Notice mirrored to email, so that there's a durable record independent of WhatsApp.
18. As the operator, I want WhatsApp delivery to run in an always-on worker, so that the Baileys session survives between requests and deploys.
19. As the operator, I want to pair the worker to the clinic's WhatsApp once (QR/pairing code) and have the session persist, so that I don't re-pair on every restart.
20. As the operator, I want the worker to reconnect automatically when the WhatsApp connection drops, so that delivery resumes without manual intervention.
21. As the operator, I want the bot to connect without suppressing notifications on the secretaries' phone (`markOnlineOnConnect: false`), so that humans still see incoming chats.
22. As the operator, I want WhatsApp sends paced/throttled, so that we reduce the ban risk on the clinic's primary number (ADR-0001).
23. As the operator, I want a Notification that fails to send to be retried, so that a transient outage doesn't silently drop a message.
24. As the operator, I want WhatsApp and email tracked separately per Notification, so that one channel failing doesn't hide or block the other.
25. As the operator, I want a failed send to stop retrying after a bounded number of attempts, so that a permanently bad address/number doesn't loop forever.
26. As the operator, I want to configure Gmail with an App Password via environment variables, so that no credentials live in the code.
27. As the operator, I want the public base URL configured in one place, so that cancel links point at the right deployment.
28. As the operator, I want the worker to not double-send a Notification if it restarts mid-drain, so that Patients don't get duplicates.
29. As the Professional, I want the dashboard's existing WhatsApp bookkeeping on the Appointment to reflect a real send, so that "Confirmation sent" means it truly went out.

### Domain / maintainer

30. As a maintainer, I want CONTEXT.md updated so a Notification spans WhatsApp and Email channels, so that the ubiquitous language matches reality.
31. As a maintainer, I want an ADR recording the Email channel and Gmail/App-Password choice, so that the decision and its trade-offs are documented.
32. As a maintainer, I want the message composition isolated as pure functions, so that message content is unit-testable without sending anything.
33. As a maintainer, I want the outbox-draining loop testable with in-memory fakes, so that retry/failure behavior is covered without real WhatsApp or SMTP.

## Implementation Decisions

### Domain model & docs

- **Notification gains a `channel`** dimension: `"whatsapp" | "email"`. `kind` stays
  `"confirmation" | "cancellation-notice"`. A single logical Notification (e.g. a Confirmation
  for an Appointment) is enqueued as **one outbox entry per channel**, each with independent
  `status`/`sentAt`/`messageId`, so the existing per-entry send state already models
  independent retry.
- **The Notification carries its composed body.** Rather than have a sender look up the
  Appointment, the message text is composed at enqueue time and stored on the outbox entry.
  This keeps senders dumb (deliver a prepared payload), keeps composition pure and testable,
  and lets the persisted outbox entry be the full record of what was sent.
- **CONTEXT.md update:** revise the **Notification**, **Confirmation**, and **Cancellation
  Notice** entries so a Notification is "a WhatsApp message **and** an email"; drop
  "Confirmation email" from the _Avoid_ list. Introduce the term **Channel** (WhatsApp, Email).
- **New ADR-0003 — Email channel via nodemailer + Gmail App Password**, and a short amendment
  to **ADR-0001** noting delivery is now multi-channel and the decoupled worker is realized.

### Message composition (new pure seam)

- A pure composer maps an `Appointment` (+ a `baseUrl`) to per-channel payloads:
  `{ whatsapp: { text }, email: { subject, html, text } }`, parameterized by `kind`
  (Confirmation vs Cancellation Notice).
- The **cancel link** is `${PUBLIC_BASE_URL}/cita/${appointment.id}` — the existing public
  page. The Confirmation includes it; the Cancellation Notice does not (the Appointment is
  already cancelled).
- Content includes Patient first name, date, time, Visit Type + sub-type, coverage label, and
  Deposit acknowledgment when one applies. Spanish copy.

### Outbox seam (extend the existing one)

- Grow `NotificationOutbox` with the methods its own doc-comment already anticipates:
  `pending()` (entries the worker still needs to send) and `markFailed(id, error, attempts)`.
  Add an `attempts` counter and a `failed` status (or `lastError`) to `OutboxEntry`.
- The worker must **claim** an entry before sending (e.g. atomic status transition
  pending → sending) so two worker ticks, or a restart, don't double-send. Mongo `findOneAndUpdate`
  is the production mechanism; the in-memory fake mirrors it.

### Decoupling delivery (change the dispatch path)

- At request time, Booking and Cancellation **enqueue only** — one entry per channel — and
  return. They no longer call the sender or `markSent`. `notifyConfirmation` still records the
  Appointment-level WhatsApp bookkeeping, but that is now set by the **worker** when the
  WhatsApp entry actually sends (not inline at booking).
- A new **drain loop** (`drainOutbox(deps)`) is the orchestration the worker runs each tick:
  `outbox.pending()` → route each entry to its channel sender → `markSent`/`markFailed` →
  for a Confirmation's WhatsApp entry, update the Appointment bookkeeping. This loop is pure
  orchestration over the seams, so it's testable with in-memory fakes.

### Channel routing & senders

- A **channel router** picks the adapter by `entry.notification.channel`. The existing
  `NotificationSender` interface (`send(...) → { messageId }`) is the per-channel seam; the
  `FakeNotificationSender` stays for tests/dev.
- **WhatsApp adapter (Baileys):** `makeWASocket` with persisted **multi-file (or DB) auth
  state**, a Pino `logger`, a `getMessage` implementation, `markOnlineOnConnect: false`, and a
  `browser` identity. Handle `connection.update`: reconnect on disconnect unless
  `DisconnectReason.loggedOut`; expose first-run **pairing** (QR or pairing code). Normalize the
  Patient phone to a WhatsApp **JID** (`<countrycode><number>@s.whatsapp.net`); optionally guard
  with `onWhatsApp` and mark that channel failed (so email still covers the Patient) if the
  number isn't registered. Throttle/pace sends per ADR-0001. `sendMessage(jid, { text })`
  returns the WhatsApp message id used as the entry's `messageId`.
- **Email adapter (nodemailer):** `createTransport({ service: "gmail", auth: { user, pass } })`
  where `pass` is a Gmail **App Password**; `sendMail({ from, to: patientEmail, subject, html,
  text })`. The returned `messageId` is the entry's `messageId`.

### Runtime & config

- The worker is a **standalone long-lived Node process** (its own entrypoint/script + npm
  script), not a Next.js route, so it can hold the Baileys socket (ADR-0001). It loops on a
  short interval (or change-stream) draining the outbox, with bounded retry/backoff and a max
  attempt cap.
- New env (add to `.env.example`): `PUBLIC_BASE_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`,
  `MAIL_FROM` (display name + address), WhatsApp auth-state location, and the clinic sender
  number. Update the composition roots (`getBookingDeps`, the cancellation deps, a new worker
  deps root) to wire the real outbox + real senders; keep fakes wired in tests.

## Testing Decisions

- **Test external behavior through the seams, not implementation details.** Don't assert on
  Baileys/Gmail internals; assert on what a Patient/operator can observe: the composed message
  content, which outbox entries exist and their final status, and the Appointment bookkeeping.
- **Message composition (pure):** unit-test the composer directly — Confirmation body contains
  the date, time, Visit Type/sub-type, coverage, Deposit (when applicable), and the exact cancel
  link `/cita/{id}`; Cancellation Notice omits the link; both render in Spanish; email has a
  subject and both html and text parts.
- **Enqueue-on-booking / cancellation:** a successful booking enqueues exactly **two** entries
  (whatsapp + email) for the Confirmation; a cancellation enqueues two for the Cancellation
  Notice. Reuse the prior-art style of `notify-confirmation.test.ts` with
  `InMemoryAppointmentRepository` + `InMemoryNotificationOutbox`.
- **Drain loop:** with an in-memory outbox + fake senders, assert pending entries get sent and
  marked `sent`; a failing sender marks the entry `failed` and increments attempts without
  touching the other channel's entry; a claimed/sending entry isn't sent twice; the WhatsApp
  Confirmation entry updates the Appointment bookkeeping on success. Mirror the existing
  "propagates a sender failure" decoupling test.
- **Phone → JID normalization (pure):** unit-test the mapping for representative Argentine
  mobile formats.
- **Real adapters are thin and not unit-tested against live services.** The Baileys and
  nodemailer adapters sit behind the `NotificationSender` seam and are verified manually /
  via integration against a test number and a test inbox, not in the Vitest suite. Prior art:
  the Mongo adapters are likewise exercised through their seam, with the in-memory fakes
  carrying the unit coverage.

## Out of Scope

- **Reminders** and any Notification kind beyond Confirmation and Cancellation Notice
  (CONTEXT.md _Avoid_: "Reminder").
- **Inbound/two-way messaging** — replies, chatbots, read-receipt tracking. We send only.
- **The official WhatsApp Business API** — explicitly rejected by ADR-0001.
- **Multi-provider / multiple numbers** — still exactly one Professional and one clinic number.
- **An admin UI for pairing or session health** — first-run pairing is operational (QR/pairing
  code at the worker), not a dashboard feature.
- **Rich HTML email theming / templating engine** — a single clean Spanish template per kind is
  enough; no per-Patient branding.
- **Delivery/read receipts surfaced in the dashboard** beyond the existing
  "Confirmation sent" bookkeeping.
- **Localization beyond Spanish.**

## Further Notes

- **Ban risk (ADR-0001).** The WhatsApp number is the clinic's primary human channel; a Baileys
  ban takes down human contact too. Throttling and human-like pacing matter, and the email
  channel is partly insurance against losing WhatsApp.
- **Gmail App Password requires 2-Step Verification** on the Google account, and Gmail imposes a
  daily send cap (~500/day for a standard account) — comfortably above clinic volume. If the
  account's security posture changes, the App Password may need regenerating; OAuth2 was
  considered and deferred as heavier.
- **`PUBLIC_BASE_URL` must be the public deployment origin** (not `localhost`) or cancel links
  in real messages won't work — call this out in `.env.example`.
- **The cancel page already exists** at `/cita/[id]` and enforces the Cancellation Window, so the
  link needs no new page — only a correct absolute URL.
- This PRD finally builds the "always-on Baileys worker" repeatedly deferred since slice 06; the
  outbox seam was intentionally shaped (`pending()`/`markFailed` noted in its doc-comment) to
  receive it.
