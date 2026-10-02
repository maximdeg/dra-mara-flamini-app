# 01 — Stop exposing internal Notas on the public Health Insurance endpoint

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commit 5

## What to build

The public Health Insurance endpoint that feeds the booking form's coverage picker returns every insurer as stored, including **Notas**, which is internal Professional-only text. Make it return a Patient-safe view of each insurer instead: name and price only. The booking picker needs nothing else.

Put the projection in a small pure function in the coverage module, so the rule "Notas and anything internal never leaves through public endpoints" is tested in one place. Update the doc comment on Notas to say it is internal and never shown to Patients.

## Acceptance criteria

- [ ] The public Health Insurance endpoint returns only name and price per insurer.
- [ ] A unit test proves the projection never includes Notas.
- [ ] The booking form still lists insurers with their prices. Existing booking page tests pass.
- [ ] The Notas doc comment says it is internal.

## Blocked by

None - can start immediately
