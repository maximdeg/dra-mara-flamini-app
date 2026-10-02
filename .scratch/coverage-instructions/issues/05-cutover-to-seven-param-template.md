# 05 — Switch to the 7-parameter template

Status: ready-for-human
Type: HITL

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commit 13

## What to build

No code. Once Meta approves the edited `appointment_confirmation_1` [es_AR], switch production to the 7-parameter Confirmation.

1. Locally, run the Meta smoke test with `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS=true`. Confirm the WhatsApp arrives with the Indicaciones line.
2. Set `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS=true` in Vercel and redeploy or restart, so the env takes effect.
3. Book a test Appointment in production with a coverage that has Indicaciones and one that has none. Confirm the first message shows the Indicaciones and the second shows "Sin indicaciones adicionales."

**Do this promptly after approval.** Once the approved template expects seven parameters, every 6-parameter send fails with error 100. Booking still succeeds because sends are best-effort, but those Patients get no Confirmation. The Panel's WhatsApp usage log records those rejections with their error code.

If Meta **rejects** the edit, leave the flag off. Indicaciones still reach Patients on the cita page.

## Acceptance criteria

- [ ] Meta shows the edited template as Approved.
- [ ] The smoke test with the flag set delivers the 7-parameter message.
- [ ] The flag is set in Vercel, and a production booking's WhatsApp shows the Indicaciones, or the fallback when there are none.
- [ ] The Panel's usage log shows no error-100 rejections after the flip.

## Blocked by

- [04 — WhatsApp Confirmation with Indicaciones, behind a flag](04-whatsapp-confirmation-with-instructions.md)
- Meta's approval of the edited template
