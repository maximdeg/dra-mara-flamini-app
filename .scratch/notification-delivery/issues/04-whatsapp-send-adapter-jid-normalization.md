# 04 — WhatsApp send adapter + JID normalization

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Notification Delivery](../PRD.md)

## What to build

The WhatsApp-side logic that does **not** require a live session, behind a small socket seam so it's
fully testable without connecting to WhatsApp.

- A pure **phone → WhatsApp JID** normalization: map the Patient's stored phone to
  `<countrycode><number>@s.whatsapp.net`, handling the representative Argentine mobile formats.
  This is a pure function with unit tests.
- A **WhatsApp `NotificationSender`** that, given a minimal **socket interface**
  (`sendMessage(jid, { text })`, `onWhatsApp(number)`), resolves the JID, optionally guards with
  `onWhatsApp` (marking the whatsapp Channel failed so email still covers a Patient not on WhatsApp),
  sends the composed text, and returns the WhatsApp message id as the entry's `messageId`.
- Route the `whatsapp` Channel through this adapter against a **fake socket** in tests/dev, so the
  whole WhatsApp path (JID resolution + adapter + routing + outbox bookkeeping) is verifiable without
  a real connection. The live Baileys socket is slice 05.

## Acceptance criteria

- [ ] Phone → JID normalization is a pure function with unit tests over representative AR formats.
- [ ] The adapter resolves the JID, sends via the socket seam, and returns the message id.
- [ ] A number not on WhatsApp (`onWhatsApp` negative) marks only the whatsapp entry failed; the
      email entry is untouched.
- [ ] The whatsapp Channel runs end-to-end against a fake socket in tests (correct JID + text).
- [ ] `npm test` and `npm run build` are green.

## Blocked by

- [02 — Decoupled worker + outbox draining](./02-decoupled-worker-outbox-draining.md)
