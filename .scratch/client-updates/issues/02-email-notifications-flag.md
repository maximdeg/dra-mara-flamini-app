# 02 — Turn off Patient email notifications behind a flag

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Client updates](../PRD.md), Part B (commits 5–8), plus the email-confirmation row from commit 13

## What to build

Stop sending the Confirmation email and the Cancellation email to Patients. All email code stays in place so it can be turned back on with one env change.

Add a flag reader for `EMAIL_NOTIFICATIONS_ENABLED`. It's enabled only when the value is exactly `"true"`; missing, empty or any other value means off. The Booking and Cancellation composition roots check the flag. When it's off, they supply a no-op for the email channel instead of building the Gmail sender. Put that choice in a small pure helper so it's testable without Mongo or Gmail. When the flag is off, the Cancellation root also skips the clinic-info read it only does for the email's contact block. `book()` and `cancel()` keep their interfaces and best-effort email step unchanged. WhatsApp Notifications are unaffected.

The Patient's /cita page hides the "Confirmación por email" row whenever the flag is off, so it never shows "Pendiente" for an email that will never be sent. The server page reads the flag and passes it to the details component as a prop, so the component stays pure.

The Professional's password-reset email is **not** a Patient Notification and is out of the flag's reach. Note this at the flag reader.

## Acceptance criteria

- [ ] The flag reader returns true only for `"true"`. Unit tests cover missing, empty, `"false"`, `"TRUE"` and `"true"`.
- [ ] With the flag off, booking and cancelling send no email and write no email bookkeeping. With it on, behavior is the same as today. The gating helper's tests prove both.
- [ ] Existing Booking and Cancellation tests pass unchanged, since the domain interfaces don't move.
- [ ] The /cita details component shows the "Confirmación por email" row only when the flag prop is on. Tests cover both states, and the snapshot is updated.
- [ ] Password reset still sends its email regardless of the flag.
- [ ] `EMAIL_NOTIFICATIONS_ENABLED` and its off-by-default behavior are documented wherever env vars are documented.

## Blocked by

None - can start immediately

## Comments

Touches the same /cita details component as 03. Running them in parallel may cause a small merge conflict, but there's no real dependency.
