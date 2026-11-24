# Draft save/publish

People create and recover drafts, save changes without changing published content, publish a validated immutable revision, and inspect or restore older publication content as a draft.

## Sub-features

- `draft-create`: blank draft or recipe installation; naming, autosave and persisted URL.
- `draft-save`: explicit save, reload, version conflict/failure and unsaved-tab recovery.
- `draft-publish`: review/validate publication; disconnected graph and unavailable account guards; update a published rule.
- `draft-revisions`: immutable live snapshot, view versions, restore/revert into a draft, duplicate without copying live state.

## How to get to it (user POV)

- Automation `/automation` → `New automation` → `Automation templates` → `Start from scratch`.
- Open an existing automation from the library or its saved `/automation/<id>` deep link. Folder creation must retain the selected folder.
- Open Templates `/templates`, choose a recipe, install it into a draft and open it.
- In the editor choose `Save draft`, `Publish`/`Update`, or `More automation actions` → `Show version history`, `View published`, `Revert to published`, `Duplicate`.
- Revisit the same browser tab after unsaved edits to reach `Recover unsaved edits?`.

## Driving it with repository smoke scripts

Preconditions: validation build; isolated legacy session; for publication, the existing UI smoke seeds its unusable `UI fixture account` channel and constructs a connected, valid graph. The new folder helper has neither a channel nor a publishable rule.

- **Create/save.** Run `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui` with SKILL.md's disabled-delivery environment. Its real UI path clicks `New automation` → `Start from scratch`, fills textbox `Automation name`, then `Save draft`. Capture save requests/results to `/api/rpc/saveDraft`, `Saved.`/`.save-state`, the resulting `/automation/<id>` URL and reload. The smoke independently reads saved Convex data; do not use that reader as the action.
- **Publish/update.** In the same existing smoke, `Publish` → dialog `Publish revision` changes the toolbar to `Update` and creates `publishedRevisionId`. Edit node `private-reply` → `Private reply text`, save a different message, then assert persisted `published.dm` stays equal to the earlier publication and current `dm` differs. Publication validation must still reject a disconnected graph. Archive UI and stored before/after values without tokens.
- **Revisions/recovery.** The UI smoke opens `More automation actions`, then the exact menu items `Show version history`, `Revert to published`, `View published`; checks the `Published revisions`/`Published revision` dialogs; navigates away/back; and exercises retained tab recovery. Assert restored values are drafts and the live revision changes only through publication. Run `npm test` for immutable queued content/revision/node IDs and client editor persistence/concurrency checks.
- **API corroboration.** Run `NEXT_VALIDATION_BUILD=true npm run smoke`. It proves draft persistence and activation/access guards through real protected APIs. Templates installed through `/api/templates` stay draft with no publication; this API entry does not replace Templates UI evidence.

## Gotchas

- An empty helper workspace cannot publish to a nonexistent channel. Record that prerequisite failure; never enable real delivery to make publication pass.
- Autosave and explicit save use `/api/rpc/saveDraft`; a listener waiting only for old `POST /api/automations` will miss current editor saves. Wait for the actual action response and persisted state, not a timeout or stale toast.
- A publication in a disposable backend is an automated content/state check. It does not establish a real webhook, provider acceptance or recipient receipt.
- Recovery belongs to the same browser tab/session storage. A new context cannot prove recovery of the prior tab. Disabling a channel or restoring Trash must not silently reactivate a rule.
- Template, folder, deep-link, library and recovery entry points are separately reportable. Running the scratch-draft path alone does not mark all of them verified.
- Phase 1 updates the main UI smoke greeting assertions to Welcome. Its draft journeys still need their own executed proof; the folder helper does not certify draft behavior.
