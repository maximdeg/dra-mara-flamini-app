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

- [x] Phone → JID normalization is a pure function with unit tests over representative AR formats.
- [x] The adapter resolves the JID, sends via the socket seam, and returns the message id.
- [x] A number not on WhatsApp (`onWhatsApp` negative) marks only the whatsapp entry failed; the
      email entry is untouched.
- [x] The whatsapp Channel runs end-to-end against a fake socket in tests (correct JID + text).
- [x] `npm test` and `npm run build` are green.

## Blocked by

- [02 — Decoupled worker + outbox draining](./02-decoupled-worker-outbox-draining.md)

## Comments

- 2026-06-22: Implemented on branch `notification-delivery`. `phone-jid.ts` — pure
  `normalizeArgentinePhone`/`phoneToWhatsAppJid` producing `549` + the 10-digit national number,
  handling bare national (`3421112233`), `+54 9 …`, `+54 …` (no 9), trunk `0`, and the domestic `15`
  marker after a 2–4 digit area code; 8 unit tests. `whatsapp-socket.ts` — minimal `WhatsAppSocket`
  seam (`resolveJid`, `sendText`) + `FakeWhatsAppSocket`. `whatsapp-sender.ts` —
  `WhatsAppNotificationSender` resolves the JID, guards via `resolveJid` (a number not on WhatsApp
  throws → the worker fails only this Channel, email still covers the Patient), sends, returns the
  message id. `get-notification-sender.ts` now routes whatsapp through the real adapter over a
  `FakeWhatsAppSocket` (slice 05 swaps the live Baileys socket in there). Tests: `phone-jid.test.ts`,
  `whatsapp-sender.test.ts` (mapping, canonical-JID resolution, not-on-WhatsApp + wrong-Channel
  guards), and a `drain.test.ts` integration proving not-on-WhatsApp fails only the whatsapp entry
  while email sends. typecheck + build clean; full suite 202/202; **smoke-run**: a `0342 15 111 2233`
  whatsapp entry drained to `sent` as `…fake-wa-5493421112233@s.whatsapp.net`.
- Known limitation (noted for slice 05): the `15`/area-code strip is a length-based heuristic; the
  live socket's registration lookup returns the authoritative JID and is the real source of truth.
