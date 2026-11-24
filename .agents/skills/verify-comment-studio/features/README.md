# Comment Studio verification map

Read this index before selecting a journey. The maintained surface is the browser, with protected HTTP APIs and persisted Convex reads as secondary evidence. Start from [SKILL.md](../SKILL.md); all default runs use temporary local Convex, legacy test credentials, a separate validation build, and disabled delivery. Each file uses exactly four H2 sections and lists every relevant entry point; a pass through one does not certify the others.

## Features

| Feature | User entry points | Driver and coverage boundary |
| --- | --- | --- |
| [Shared foundations](shared-foundations.md) | Mobile navigation, ordinary touch controls, Home/Account status, Automation reference | Foundations smoke + library/UI smokes; fresh before/after captures; no live provider acceptance |
| [Account/workspace access](account-workspace-access.md) | Sign-in, Manage Accounts, New Account, Link workspace, workspace switcher, Sign out | API smoke + backend/client tests; optional development Clerk smoke for real test-mode identity UI; no completed Meta OAuth |
| [Draft save/publish](draft-save-publish.md) | New automation, saved library item/deep link, toolbar save/publish, revisions/recovery | Existing UI smoke + API smoke; immutable revisions verified locally, no real sends |
| [Canvas editing](canvas-editing.md) | Editor canvas, trigger/node controls, inspector, connection handles, preview | Existing UI smoke; real canvas gestures, persistence and simulator side-effect checks |
| [Contacts/library](contacts-library.md) | Contacts list/detail/export/tags; Automation folders/list/grid/Trash; Templates | New helper proves folder creation/open/reload only; wider UI/API smokes cover other listed paths |
| [Delivery inspection](delivery-inspection.md) | Delivery activity, Inspect, URL filters, readiness/dashboard, rule outcomes | UI/API smoke + backend tests, fabricated review history; live Meta acceptance separate |

## Baseline and driving conventions

- Linux x64, Node 24+, dependencies, Chromium, validation build; backend setup deploys functions before browser login.
- `scripts/verify.mjs` creates only `owner`/`My workspace`. No channels, contacts, jobs, runs or accepted history exist. Other smokes own their richer isolated fixtures. Do not invent contacts or real delivery counts to fill a UI.
- Scope all account/workspace operations to server-verified identity/membership. Never supply an owner ID from the browser. Account-only discovery must work before a workspace and use identity-owned `account_assets`/expiring `account_pending`. OAuth grants do not become shared fixtures.
- Stable ARIA names and route paths below come from current components/smokes. For gestures, derive positions from actual DOM handles/bounds rather than fixed screen coordinates.
- Existing UI smoke is launched by `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui` with the disabled-delivery environment from SKILL.md. Existing API smoke is `NEXT_VALIDATION_BUILD=true npm run smoke`. Both create their own disposable instances.
- Preserve existing target files and secrets. Convex CLI must go through `scripts/convex-cli.mjs ... --env-file <dedicated-target>`; the existing local harness handles this. Do not run `convex dev` against a logged-in/shared target.

## Proof reporting

Use the feature ID **and entry point** with each proof. Capture an action and result, then independently read persisted state. For browser journeys retain ARIA + screenshots; for command checks retain command, exit code, stdout/stderr. Missing prerequisites fail that entry point; another working route cannot stand in for it. Label results as local simulation, automated verification, optional Clerk integration, or live Meta acceptance. Fresh local proof is not deployment acceptance. [PROOF.md](../PROOF.md) records the executed subset; this index is the larger verification scope, not a claim that all journeys ran.
