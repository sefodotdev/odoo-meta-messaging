# Delivery inspection

People inspect retained delivery outcomes and pending work, filter older records, review an uncertain send with evidence, and distinguish accepted provider requests from local simulations and unavailable delivery receipts.

## Sub-features

- `delivery-history`: public/private records, search/outcome filters, older retained history and rule links.
- `delivery-inspect`: inspect attempts/errors/provider identifiers and record an evidence-backed outcome without resending.
- `delivery-readiness`: scoped accepted/pending/review/failed counts, heartbeat, account health and delivery gate.
- `delivery-boundaries`: cross-workspace privacy, ambiguous-outcome quarantine and no automatic retry.
- `delivery-live-acceptance`: real account authorization/subscription → signed comment → public/private provider acceptance and recipient confirmation, separately on Instagram/Facebook.

## How to get to it (user POV)

- Navigation `Delivery activity` → `/activity`; use `Search retained history`, `Delivery outcome`, `Apply filters` and `Inspect`.
- Open a retained history URL with its filters, or follow an automation link from that history.
- Inspect scoped Home/dashboard statistics and connection readiness; open the editor's `Recorded outcomes` dialog for that rule.
- Settings → Account for connection health; this checks identity/configuration separately from actual delivery.

## Driving it with repository smoke scripts

Preconditions: validation build and the existing smoke's isolated fixture workspace. History/inspection needs fabricated review jobs; the empty folder helper intentionally has none. No real provider credentials or sends are allowed in automated checks.

- **History/filter/review UI.** Run `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui` with disabled-delivery variables. It imports 105 clearly fabricated `review` records, clicks `Delivery activity`, fills `Search retained history` = `Old searchable`, operates combobox `Delivery outcome` (`Needs review`/`All outcomes`), and clicks `Apply filters`. Assert the `Old searchable outcome` link and persisted filter URL, including history older than the old latest-100 cutoff.
- **Evidence resolution.** That smoke clicks `Inspect`, fills label `Review evidence (exclude credentials)` with `Isolated fixture: no real provider request occurred.`, then `Record verified outcome`; the fixture becomes `cancelled` in UI and stored job `ui-history-0`. Capture before/action/after and assert there was no additional provider send attempt. Never mark a fixture sent merely to improve totals or retry an uncertain send.
- **API/privacy/readiness.** Run `NEXT_VALIDATION_BUILD=true npm run smoke` and `npm test`. These check scoped `/api/activity`, `/api/operations`, `/api/stats`, `/api/readiness`, rejected foreign reviews, uncertain-send behavior and fixtures at the provider boundary. The helper additionally reads `/api/readiness` before/after its folder action: delivery disabled, environment test, accepted zero; jobs/attempts/contacts/runs stay empty. This is safety evidence, not a populated history proof.
- **Live acceptance record, deliberately unexecuted.** Record this entry `not run — real delivery disabled`. A future separately authorized run requires this project's own approved Meta app, fresh consent and correct permissions/subscriptions for a specific Page/professional Instagram account, an eligible second account's new comment on the chosen publication, signed-event evidence, immutable revision/job/attempt correlation, provider acceptance IDs, visible public reply and recipient inbox/message-request confirmation. Check both platforms separately. This skill does not open the delivery gate, change remote config, authorize Meta, or send messages.

## Gotchas

- Successful identity health, webhook verification challenge, app Live mode or approved permissions alone does not prove a recipient received a message. API acceptance is separate from recipient confirmation; delivery/open/click receipts are unavailable.
- The local fixture accepted/review/cancelled rows in tests are synthetic. Never combine their counts or local previews with real accepted-send totals.
- No automatic retry for transport errors, unreadable/5xx responses, missing IDs or interrupted/uncertain sends. Operator resolution records evidence without resending; do not rerun a scheduled action from a dashboard.
- A heartbeat can be absent in the empty local stack. Do not introduce a polling worker to make it healthy: Convex scheduled actions own delivery. The safe folder journey need not create queued work just to fill the UI.
- Review/detail paths fail without a matching workspace's job. Readiness is a distinct entry point, not a substitute. Live Meta acceptance remains unverified even when all automated checks pass.
- The wider UI smoke has stale legacy greeting assertions noted in SKILL.md; resolve that harness prerequisite before reaching history/review. Those UI paths are not certified by the focused folder proof or the passing API smoke.
