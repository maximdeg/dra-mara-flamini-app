# 04 — WhatsApp Confirmation with Indicaciones, behind a flag

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commits 9–12

## What to build

Teach the WhatsApp Confirmation to carry the Appointment's copied Coverage Instructions, matching the Professional's edit of `appointment_confirmation_1` [es_AR]. The edit is still **pending Meta review**, so the new shape is gated behind a flag that defaults to off.

Once approved, the template body is `{{1}}` name, `{{2}}` date, `{{3}}` time, `{{4}}` type, `{{5}}` Obra Social, `{{6}}` Instructions, `{{7}}` /cita link.

- **Builder:** the pure Confirmation builder takes an option for whether the template includes Instructions. When off, it emits today's six parameters unchanged. When on, it emits seven: `{{6}}` is the Appointment's copied Instructions, or the fallback constant "Sin indicaciones adicionales." when they're empty or missing (Meta rejects empty parameters), and `{{7}}` is the manage link.
- **Flag:** `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS`, enabled only when exactly `"true"`. The Booking composition root reads it and passes it down the Confirmation send path, so the builder stays free of env. With it off, production behavior is identical to today.
- **Smoke test:** the Meta smoke-test script sends seven parameters, including a sample Instructions value, when the flag is set, and six otherwise.
- **Docs:** add **Coverage Instructions** to CONTEXT.md (Coverage & payment): Patient-facing, per Health Insurance and per Self-Pay variant, copied at booking, distinct from internal Notas. Add a dated amendment to ADR-0003 covering the 7-parameter body, the fallback rule and the flag-gated cutover. Add a short cutover section to the manual test notes.

Cancellation Notice templates are unchanged.

## Acceptance criteria

- [ ] The existing 6-parameter builder tests still pass with the option off.
- [ ] With the option on, the builder emits seven parameters in order, and uses the fallback for empty and missing Instructions.
- [ ] The "no newline or 4+ space run in any parameter" test covers both modes.
- [ ] The flag reader is unit-tested: missing, empty, `"TRUE"`, `"false"` and `"true"`.
- [ ] With the flag unset, a booking sends exactly today's 6-parameter Confirmation.
- [ ] The smoke script sends seven parameters when the flag is set.
- [ ] CONTEXT.md, ADR-0003 and the manual test notes are updated.

## Blocked by

- [02 — Indicaciones for each Health Insurance](02-health-insurance-instructions.md) (needs `coverageInstructions` on the Appointment)
