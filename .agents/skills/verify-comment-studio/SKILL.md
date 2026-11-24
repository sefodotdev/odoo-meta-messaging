---
name: verify-comment-studio
description: "Verify Comment Studio's web UI and protected API using disposable local Convex and existing smoke scripts. Use after changes to account/workspace access, drafts/publication, canvas editing, contacts/library, or delivery inspection. Keeps real Meta delivery disabled."
---

# Verify Comment Studio

Read `AGENTS.md` and [the feature index](features/README.md) first. The primary surface is the browser; the protected Next API is a second observable view. Convex owns runtime data, authorization, transactions and scheduled delivery. Never introduce a polling worker, application SQLite, or test endpoints. The local Convex binary's own storage is an implementation detail of the existing official-backend harness, not application SQLite.

## Launch

Run from the repository root on Linux x64 with Node 24+, Python 3, installed npm dependencies and Playwright Chromium. Reuse `scripts/test-backend.mjs`, `scripts/local-convex.mjs` and the repository smoke scripts. If dependencies or Chromium are absent, use `npm ci` and `npx playwright install chromium`; report installation/download failures. The backend is pinned to `precompiled-2026-10-22-1447815`, cached under ignored `data/convex-local-binary/`; its first use downloads the official release from GitHub.

Normal development is `npm run dev` on port 3000 with a configured Clerk/Convex target; it is not the disposable verification instance. Do not drive the user's existing server or load their credentials for the default proof.

Build into the existing separate validation directory, then launch the self-contained proof:

```bash
NEXT_VALIDATION_BUILD=true DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false npm run build
./.agents/skills/verify-comment-studio/scripts/verify.mjs
```

The helper prints `passed: <absolute evidence directory>/report.json` only after cleanup. To choose an evidence destination, pass a fresh directory:

```bash
./.agents/skills/verify-comment-studio/scripts/verify.mjs data/verification/comment-studio/library-folder-proof
```

The helper starts an empty, random-port local Convex instance, deploys schema/functions through `scripts/convex-cli.mjs` with its disposable `--env-file`, and seeds only the existing `owner` workspace fixture. It launches the built Next server directly on a separate loopback port, with temporary legacy credentials and all configured service credentials blanked. It avoids `scripts/run.mjs` for this proof so that wrapper cannot fill missing configuration from the user's target files. `NEXT_VALIDATION_BUILD=true` selects `.next-validation` without replacing an active server's `.next` build.

Usable readiness requires signing in through `Workspace name`, `Workspace password`, `Sign in`, seeing heading `Welcome`, passing the Doctor below, and reaching `Create folder` in Automation. A responding port alone is insufficient. No Meta channel or historical contact is seeded for this journey. Missing preconditions fail the journey.

Teardown is in the helper's `finally` block, including failed drives. Never launch a second build against `.next-validation` while it is being driven. Random ports and backend data permit separate runtime instances, but existing scripts can share fixed screenshot paths; serialize those runs and archive their outputs immediately.

## Doctor

The helper's read-only Doctor runs before its first feature mutation. It requires the owned Next child to remain alive, the validation `BUILD_ID` to match, local Convex `/version` to respond, unauthenticated `GET /api/folders` to return `401`, authenticated `GET /api/settings` to name `My workspace`, and authenticated `GET /api/readiness` to report `delivery.enabled=false`, `delivery.environment=test`, and zero accepted deliveries. Its settings/readiness requests reuse the browser session, proving authentication is usable. See `report.json` → `steps` and `readinessBefore`.

Whenever this journey looks wrong, stop the owned attempt and rerun the same helper against a fresh evidence directory; that repeats Doctor before driving. Do not point it at a shared origin, weaken the check, or bypass auth using admin mutations. The helper starts its own process and records its PID/origin/build. A failed Doctor is a failure, not a skip/pass.

## Drive

Use the exact journey and entry point from the feature map. The executable helper covers **only** `contacts-library.library-folder`: browser navigation → folder dialog → save → independent API/Convex read → folder link → reload. It uses repository selectors, records actions before the save, and captures before/action/after screenshots and ARIA snapshots. It does not implement a generic interactive browser controller.

Reuse these existing wider checks when the mapped change needs them, with output captured in the run's evidence directory. Here `VERIFY_EVIDENCE_DIR` is the absolute directory printed by the helper, set explicitly for the current run:

```bash
VERIFY_EVIDENCE_DIR="$PWD/data/verification/comment-studio/library-folder-proof"
DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false npm test > "$VERIFY_EVIDENCE_DIR/tests.log" 2>&1
npm run typecheck > "$VERIFY_EVIDENCE_DIR/typecheck.log" 2>&1
NEXT_VALIDATION_BUILD=true DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false npm run smoke > "$VERIFY_EVIDENCE_DIR/api-smoke.log" 2>&1
NEXT_VALIDATION_BUILD=true DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui > "$VERIFY_EVIDENCE_DIR/ui-smoke.log" 2>&1
NEXT_VALIDATION_BUILD=true DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false npm run smoke:channels > "$VERIFY_EVIDENCE_DIR/channel-smoke.log" 2>&1
```

Run the checks as separate commands and record every exit code; a later successful command must not hide an earlier failure. `npm test`, `npm run typecheck`, validation build, and post-build `npm run smoke` are the required AGENTS checks. The default proof needs one mapped journey; this does not imply every feature or entry point passed. Phase 1 repairs the UI/library greeting assertions, current local-test labels, and the library first-save response listener. See the shared-foundations map for exact scope. A repair alone does not certify its journey. For UI expansion edit/extend the existing smoke recipes, not production UI or backend setters. Capture actions and outcomes for the specific change; an old screenshot or a smoke's final success line is not full new UI evidence.

### Three kinds of evidence

| Kind | What counts | What it cannot establish |
| --- | --- | --- |
| Local simulation | Editor `Preview` → `Test` → `Test automation`; matching outcome plus unchanged jobs/contacts/runs | Provider permission, subscription, acceptance, recipient inbox, or a real send count |
| Automated verification | Production Next build + disposable local Convex; browser/API smoke and unit/client/backend tests; fabricated fixtures or provider responses clearly named | Live Clerk/Meta behavior where replaced by fixtures; Vercel deployment behavior; delivery/open/click receipts |
| Live Meta acceptance | Separate owner-authorized test on each real platform with OAuth, account subscription, real signed event, provider acceptance ID, public reply and recipient confirmation | Never inferred from local simulations, identity health, fixture `sent` rows, or mocked Graph responses |

Keep `DELIVERY_MODE=disabled`, `APP_ENVIRONMENT=test`, `ALLOW_DEVELOPMENT_DELIVERY=false` for this skill. Do not perform live acceptance or alter any real target's environment. Its prerequisites remain recorded as unverified in the map. Do not automatically retry uncertain deliveries. No Meta tokens or secrets enter client code, evidence, logs, or screenshots.

Optional provider-backed Clerk verification is a separate explicit integration run, documented in [account/workspace access](features/account-workspace-access.md). The default helper and required API smoke use legacy auth and cannot prove Clerk ownership semantics by themselves; backend tests cover those boundaries with verified-identity fixtures.

## Evidence

The default evidence directory is `data/verification/comment-studio/<ISO timestamp>/`, outside temporary backend storage. A supplied directory must be fresh. This ignored directory survives cleanup; do not commit credentials or raw provider/session traces.

The helper writes `report.json` (feature/entry point, build/origin/PID, timestamped action/result sequence, sanitized response method/path/status, readiness before/after, saved folder, side-effect counts, cleanup), `server.log`, and `01-before`, `02-action`, `03-persisted` PNG/ARIA pairs. Failures retain `failure.png`/`failure.aria.txt` when a browser is available. Check `result=passed` **and** cleanup fields; inspect the action and resulting state, not just the final screenshot.

Proof must use real user paths; admin imports are fixture setup only, never proof of save/publish/tag/review behavior. Check persisted side effects through an independent read as well as visible state. Mocks are permitted only at existing provider boundaries (e.g. media reads in UI smoke); name them. Never mock the API mutation under proof.

Observe the safety behavior: browser routing blocks non-local requests with service workers disabled, reports blocked origins, and the folder proof asserts zero jobs, attempts, contacts and runs after the action plus a still-disabled delivery gate. This proves no application send attempts for this journey; it is not a host-wide network capture. Backend setup may download the pinned binary and CLI tooling may access infrastructure; browser routing alone does not block server-side networking. The folder proof uses no account tokens or provider actions. Other smokes seed fabricated history or mocked accepted outcomes, which must never be reported as real messages.

Record unmet preconditions and attempted commands as failures or explicitly unexecuted entry points. Do not weaken a journey because the fresh backend lacks contacts, a channel, an OAuth grant, or a published graph. Historical status documents can mention the retired worker/SQLite implementation; current AGENTS.md and actual scripts take precedence.

## Cleanup

The helper closes its browser, stops only its Next child (SIGTERM then SIGKILL after three seconds if needed), calls the existing backend `close()` to stop its owned backend/remove temporary storage, compares local env-file fingerprints without printing values, and saves the proof after teardown. It never kills by process name. SIGINT/SIGTERM request shutdown; prefer allowing the helper to finish its `finally` block. Do not use SIGKILL for normal interruption.

After any failed iteration inspect `report.json.cleanup` before retrying; investigate an unremoved process using the exact recorded PID and command, never a shared process-name kill. After teardown require `serverStopped`, `backendScratchRemoved`, and `envFilesUnchanged` to be true, and confirm the evidence remains:

```bash
node -e 'const fs=require("node:fs");const p=process.argv[1];const r=JSON.parse(fs.readFileSync(p+"/report.json"));if(r.result!=="passed"||!r.cleanup.serverStopped||!r.cleanup.backendScratchRemoved||!r.cleanup.envFilesUnchanged)process.exit(1);for(const n of ["01-before.png","02-action.png","03-persisted.png","03-persisted.aria.txt","server.log"])if(!fs.existsSync(p+"/"+n))process.exit(1);console.log("Proof survives cleanup")' "$VERIFY_EVIDENCE_DIR"
```

Do not delete evidence when removing scratch state. Leave the pinned binary cache and validation build in place; they may be in use. The existing API/UI/channel smokes own their own process teardown and disposable backend. The optional Clerk smoke removes only its exact random test identities; never delete pre-existing users.

## Helpers

`scripts/verify.mjs` is executable and takes one optional evidence directory; its full invocation is shown above. It intentionally reuses the existing isolated backend rather than inventing another database or worker. Existing smoke commands remain the wider drivers. See [PROOF.md](PROOF.md) for the executed run and its limits. Keep this map honest with `/maintain-verification-skill` when behavior changes.
