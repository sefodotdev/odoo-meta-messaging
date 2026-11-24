# Contacts/library

People browse and tag contacts, export workspace contacts, and organize automations through folders, filters, list/grid layouts, duplication and Trash. Recipes install as editable drafts.

## Sub-features

- `library-folder`: create/open/reload nested folders, rename/remove and preserve contained rules.
- `library-rules`: search/filter/sort, list/grid, bulk pause/move/Trash, restore paused, permanently delete from Trash, duplicate drafts.
- `library-templates`: browse recipes and install configured drafts.
- `contacts-browse`: search/paginate/filter, open contact identity/acquisition/history, maintain supported fields.
- `contacts-tags-export`: create/assign/remove tags and export only the workspace's CSV with formula neutralization.

## How to get to it (user POV)

- Navigation `Automation` → `/automation`; `Create folder`, folder links/breadcrumbs, `Rename <folder>`, row `Actions for <automation>` and `List`/`Grid` controls.
- Open `Trash` from the automation library; select rows or use row actions for restore/permanent deletion.
- Navigation `Templates` → `/templates`; choose a recipe and install it.
- Navigation `Contacts` → `/contacts`; `Search contacts on this page`/`Search`, tag sidebar, `Create tag`, contact name link/detail `/contacts/<id>`, or `Export workspace CSV` link.

## Driving it with repository smoke scripts

Preconditions: the folder journey starts from the empty helper workspace after Doctor; no external accounts are required. Other journeys require richer fixtures supplied by the relevant existing smoke, not historical customer data. Set `VERIFY_EVIDENCE_DIR` to a fresh chosen evidence path.

- **Proven helper journey (`library-folder`).** Run `./.agents/skills/verify-comment-studio/scripts/verify.mjs "$VERIFY_EVIDENCE_DIR"`. It clicks link `Automation`, button `Create folder`, fills the dialog's `Folder name` with `Verification folder`, captures the action, and clicks `Save folder`. Expect the dialog to close and `.library-folder` link `Verification folder` to appear. It reads authenticated `/api/folders` and the stored row to verify the saved ID/workspace, opens the folder link, reloads, and asserts `Folder breadcrumbs` plus the same `folder` query parameter. `report.json` and before/action/after PNG/ARIA pairs are the proof. This does not certify nested/rename/remove or contact journeys.
- **Contacts/tagging and recipes.** Run `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui` with disabled-delivery variables. It seeds only a labeled fixture contact, uses `Contacts` → `Create tag`, dialog textbox `Tag name` = `Interested`, dialog `Create tag`, contact link `UI fixture contact`, then button `Interested`. Assert the tag state and persisted contact association, settings/history and template installation as checked by that script. Use `node scripts/trigger-smoke.mjs` with the same environment for supported contact-field interactions when those change.
- **API isolation/export.** Run `NEXT_VALIDATION_BUILD=true npm run smoke` and `npm test`. Existing checks independently cover `/api/contacts`, `/api/tags`, `/api/folders`, `/api/templates`, library metadata/filter validation and `/api/contacts?format=csv`, including cross-workspace denials and export content/formula handling. Capture the CSV only from fabricated contacts; API export coverage is not proof of clicking the browser export link.
- **Broader library UI.** Existing `NEXT_VALIDATION_BUILD=true npm run test:library` owns its disposable backend and drives `Actions for Spring collection` → `Rename`, `Move to folder`, `List`/`Grid`, breadcrumbs, nested `Launch`/`Offers` folders, search/bulk selection and folder removal. Set UI_ARTIFACT_DIR to a fresh evidence directory and preserve prior files; some legacy captures still use fixed `/tmp/automation-library-*.png` paths. Phase 1 changes the first-save response listener to `/api/rpc/saveDraft` and the default artifact destination to ignored data/verification/library. The focused folder helper avoids those paths.
- **Uncovered entry points.** Drive row `Move to Trash` → confirmation, Trash → `Restore`, then verify paused state through reload/API; drive `Delete permanently` only on disposable fixtures. Drive contact search, sidebar filter, pagination, remove-tag and browser CSV download individually when these paths change; do not mark them passed from the create-tag check.

## Gotchas

- The empty folder helper has no contacts, automations, recipes installed or Trash items. Contact detail/tagging, bulk selection and Trash journeys fail without their stated fixture preconditions; empty-state screenshots are not proof of those actions.
- Contacts come from new matching events, not fabricated historical synchronization. A seeded contact proves contact UI behavior only. Subscription stays unknown without explicit consent.
- Local preview must not create contacts. The API/browser smokes' imported contacts and history are labeled fixtures, not real acquisition or delivery evidence.
- Restored automations remain paused. Duplicates/templates must have no inherited live publication. Removing a folder must preserve/rehome contents rather than deleting customer rules.
- Existing library-smoke screenshots can collide across runs and its legacy response predicate may need maintenance. Do not overwrite prior audit evidence or change production behavior to satisfy a stale test. Record those paths unexecuted until actually run successfully.
- The main library/UI scripts now assert Welcome. The separate trigger helper retains legacy greeting assumptions; repair its prerequisite before claiming that additional journey.
