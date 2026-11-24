# Shared foundations

## Sub-features

- `mobile-navigation`: close, Escape, scrim, focus containment/return, same-route links, nested dialogs and unsaved-draft protection.
- `touch-controls`: ordinary icon/text controls, checkbox labels, modal close and reconnect actions use the existing touch token.
- `account-status`: Home/Account settings share unchecked/checked/error/disabled/authorization wording; reconnect reasons and sending availability remain independent.
- `automation-reference`: desktop/mobile list/grid, menus, inspector and preview captures, plus existing graph/save/publication behavior.

## How to get to it (user POV)

- On a narrow workspace page or editor, open `Toggle navigation`. Close with `Close navigation`, Escape or the scrim. Help opens a nested native dialog. Choosing a route still requires the existing unsaved-draft confirmation when appropriate.
- Open Automation list/grid and row actions, select a canvas node and open its inspector, then open Preview. On mobile, select the node and choose `Edit Comment trigger` to open the native inspector dialog.
- Visit Home and Settings → Account to compare the same account's latest check. Reconnect notices describe the existing domain reason; no button is used to contact Meta in this journey.

## Driving it with repository smoke scripts

Build with the isolated flags in the parent skill. Use a fresh `FOUNDATIONS_EVIDENCE_DIR` each time.

```bash
FOUNDATIONS_EVIDENCE_DIR=data/verification/foundations-before node scripts/foundations-smoke.mjs --capture-only
FOUNDATIONS_EVIDENCE_DIR=data/verification/foundations-after node scripts/foundations-smoke.mjs
node scripts/compare-foundations.mjs data/verification/foundations-before data/verification/foundations-after
```

Capture before UI edits. The driver reuses `testBackend`/`local-convex`, launches Next directly with service credentials blanked, signs in through the real form, checks authenticated scope/anonymous401 and disabled delivery, and seeds fabricated channel/contact/draft fixtures. It blocks external browser requests. It captures PNG/ARIA pairs, runs actual drawer and utility interactions with/without the notice, checks required layout widths, declines a real unsaved-draft confirmation while the autosave request is deliberately aborted, independently reads the saved record, and checks zero jobs/attempts/runs/accepted sends. `--serve` holds the owned fixture for shared-browser inspection after the journey, prints its origin, and writes a private ignored session file. SIGTERM/SIGINT cleans it up. Never archive the session file.

`report.json` records exact entry points, captures, checks, page errors, disabled delivery and cleanup. Require result passed and all cleanup flags true. The comparison decoder reuses the PNG parser bundled with installed Playwright; it introduces no app dependency. Pixel differences are evidence to inspect, not an automatic acceptance threshold. Library modification dates are masked. Menu captures avoid scrolling after opening because scrolling intentionally dismisses menus. Compare image dimensions as well as pixels; reconnect copy and deliberate hit-area changes can affect mobile framing.

Run required `npm test`, `npm run typecheck`, validation build and post-build `npm run smoke`. Also run `test:ui` for actual graph gestures/save/reload, preview isolation and publication guards, and `test:library` for filtering/sorting/list/grid/menu/folder behavior. Set `UI_ARTIFACT_DIR` to a fresh directory. The scoped foundations journey supplements these proofs; the folder helper alone does not cover it.

## Gotchas

- Fixture health is unchecked, not ready to send. The rendered account-status client tests cover healthy/error/disabled/renewal reasons and explicit server reconnect-null precedence without network calls.
- Viewport resizing proves layout. Existing UI smoke includes synthesized Chromium touch gestures. Neither establishes physical iOS/Android behavior or live Clerk/Meta acceptance.
- Capture failures and pre-existing page errors remain failures in the report. A completed screenshot set does not turn a failing baseline journey into a passing behavioral proof.
- The Phase 1 harness prerequisites update legacy greeting expectations to Welcome, the library first-save listener to `/api/rpc/saveDraft`, scroll lower rows into view before viewport assertions, and match the deliberate reconnect copy. They do not change application behavior to satisfy assertions.
- Preserve the source verification skill and existing unrelated workspace edits. Screenshots/ARIA contain fabricated fixtures; credentials, cookies, raw authorization responses and private session files remain outside durable evidence.
