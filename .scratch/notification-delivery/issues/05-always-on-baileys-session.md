# 05 — Always-on Baileys session (pairing / reconnect / throttle)

Status: ready-for-agent
Type: HITL

## Parent

[PRD: Notification Delivery](../PRD.md)

## What to build

Make the WhatsApp Channel real by giving the slice-04 adapter a live, persistent Baileys connection
inside the always-on worker — logged in as the clinic's number as a linked companion device (ADR-0001).

- A real Baileys socket satisfying the slice-04 socket seam: `makeWASocket` with persisted **auth
  state**, a logger, a `getMessage` implementation, `markOnlineOnConnect: false` (so the bot doesn't
  suppress incoming-message notifications on the secretaries' phone), and a `browser` identity.
- **Connection lifecycle:** handle `connection.update` — reconnect on disconnect unless
  `DisconnectReason.loggedOut`; expose first-run **pairing** (QR or pairing code). The session must
  survive worker restarts.
- **Pacing:** throttle/space out sends to reduce ban risk on the clinic's primary number.
- Wire the live socket into the worker so the `whatsapp` Channel now delivers real messages; the email
  Channel is unaffected.

This is HITL: it requires one-time pairing to the clinic's WhatsApp and a manual check, and it carries
ToS/ban risk on the number (ADR-0001).

## Acceptance criteria

- [ ] The worker holds a persistent Baileys session that re-pairs only when logged out and survives restarts.
- [ ] `markOnlineOnConnect: false` is set; the secretaries' phone still receives incoming-chat notifications.
- [ ] Booking sends a real WhatsApp Confirmation from the clinic number, with date/time/details and the
      `/cita/{id}` cancel link; cancellation sends a real Cancellation Notice.
- [ ] A dropped connection reconnects automatically and resumes draining without manual intervention.
- [ ] Sends are throttled/paced.
- [ ] Verified manually against a paired test number.

## Blocked by

- [04 — WhatsApp send adapter + JID normalization](./04-whatsapp-send-adapter-jid-normalization.md)
