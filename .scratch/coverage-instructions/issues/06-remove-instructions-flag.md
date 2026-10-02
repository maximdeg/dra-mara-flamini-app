# 06 — Remove the flag and the 6-parameter path

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commit 14

## What to build

Once the 7-parameter Confirmation has been live in production for a while, remove the temporary `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS` flag. Remove its reader, the builder's option and the 6-parameter path, so the Confirmation always emits seven parameters. Simplify the smoke-test script the same way, and update ADR-0003 and the manual test notes to drop the cutover instructions.

## Acceptance criteria

- [ ] No references to `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS` remain in code or docs, apart from the ADR's history note.
- [ ] The builder always emits seven parameters. The 6-parameter tests are removed and the 7-parameter and fallback tests remain.
- [ ] The smoke script always sends seven parameters.
- [ ] Typecheck and the test suite pass.

## Blocked by

- [05 — Switch to the 7-parameter template](05-cutover-to-seven-param-template.md)
