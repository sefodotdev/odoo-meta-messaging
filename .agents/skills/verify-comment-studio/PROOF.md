# Executed verification

## Codex path migration verification — 19 November 2026

The complete skill folder now lives in `.agents/skills/verify-comment-studio/`.
Its documented commands and feature-map references use that Codex project path.
The helper's relative imports and repository-root calculation remain valid at
the same directory depth. No application runtime code changed for this move.

Executed from the repository root:

```bash
./.agents/skills/verify-comment-studio/scripts/verify.mjs data/verification/comment-studio/2026-11-19-codex-path-proof
```

Exit 0. The [new lifecycle report](../../../data/verification/comment-studio/2026-11-19-codex-path-proof/report.json)
records a passing doctor, folder creation/persistence/reload, zero side effects,
disabled delivery, and all three cleanup checks true. The screenshot/ARIA
evidence survived cleanup. This used the existing validation build; it reran
the moved helper, not the full test/build suite or live provider acceptance.
Codex skill validation, helper syntax checking, project Markdown link checks,
and diff whitespace checks also passed.

## Original verification run

The generated instructions were executed on this checkout using the existing isolated local Convex backend and the separate production validation build. The successful browser journey is **`contacts-library.library-folder` only**: sign in through the real UI → Automation → create/save a folder → verify its API response and persisted workspace row → open its link → wait for its URL → reload → verify its breadcrumb and URL. No production application code or AGENTS.md constraints were changed.

## Retained evidence

Repository-root directory: `data/verification/comment-studio/2026-11-19-skill-proof-r3/` (ignored local artifacts, intentionally retained after teardown).

- [Lifecycle report](../../../data/verification/comment-studio/2026-11-19-skill-proof-r3/report.json): passed; build `QEeJ6l3mL44HgCpdWGhGd`; six action/result records, scoped readiness before/after, stored folder ID, sanitized HTTP responses, zero side effects and cleanup confirmations.
- [Before](../../../data/verification/comment-studio/2026-11-19-skill-proof-r3/01-before.png), [action](../../../data/verification/comment-studio/2026-11-19-skill-proof-r3/02-action.png), [persisted result](../../../data/verification/comment-studio/2026-11-19-skill-proof-r3/03-persisted.png), with corresponding `.aria.txt` files. The action screenshot shows the filled folder dialog before Save; the final result shows the reloaded folder breadcrumb.
- [Check commands and exit codes](../../../data/verification/comment-studio/2026-11-19-skill-proof-r3/checks.json), plus `tests.log`, `typecheck.log`, `build.log`, `smoke.log`, and `server.log` in the same directory.

## Outcomes

| Check | Result |
| --- | --- |
| Generated helper launch/doctor/drive/cleanup | Exit 0, passed |
| `npm test` with delivery disabled | Exit 0; 83 Node tests + 253 Vitest tests passed |
| `npm run typecheck` | Exit 0 |
| `NEXT_VALIDATION_BUILD=true npm run build` with delivery disabled | Exit 0 |
| Post-build `NEXT_VALIDATION_BUILD=true npm run smoke` with delivery disabled | Exit 0; protected production API against disposable local Convex |
| Generated cleanup's evidence-survival command | Exit 0, `Proof survives cleanup` |
| Feature-map shape/frontmatter/executable helper; JavaScript syntax; diff whitespace | Passed |

The browser proof observed `delivery.enabled=false`, environment `test`, accepted count zero, and empty `jobs`, `delivery_attempts`, `contacts`, and `runs`. Browser requests were restricted to its owned loopback origin; there were no blocked external browser requests. This is not a host-wide network trace or live Meta acceptance. Cleanup stopped the owned Next child, stopped/removed the disposable backend, preserved the proof, and confirmed local env files were unchanged. The validation build's generated `next-env.d.ts` path change was restored to the checkout's original contents after checks.

## Failed iterations and repairs

Two earlier attempts remain under `data/verification/comment-studio/2026-11-19-skill-proof/` and `.../2026-11-19-skill-proof-r2/`. Both reported `serverStopped=true`, `backendScratchRemoved=true`, and `envFilesUnchanged=true`; their failure screenshots/reports survive cleanup.

1. The first attempt reused a stale smoke assertion for `Welcome My`; current legacy Home renders `Welcome`. The helper now asserts the actual heading, with no application change.
2. The second attempt saved the folder correctly, but reloaded before client navigation reached its folder URL. The helper now waits for that exact persisted folder ID in the URL before reloading; the same breadcrumb and persisted-state assertions pass.

## Stand-in setup and remaining acceptance

This was a local production-build stand-in for the deployed app. It performed these verification-only setup steps that the deployed target does not automatically perform:

1. Selected `.next-validation`, built locally, and launched Next directly on a random loopback port rather than Vercel/HTTPS or the configured development server.
2. Used the cached pinned official Linux x64 Convex binary with disposable database/storage, generated local credentials, set isolated test environment values, and deployed schema/functions through the existing dedicated-target CLI wrapper.
3. Enabled migration import only on that isolated, delivery-disabled test backend to seed the existing empty `owner` workspace fixture. There were no connected channels or historical records.
4. Generated a temporary legacy workspace password/session/gateway/encryption configuration instead of authenticating a real Clerk identity. Blank service credentials prevented automatic loading of configured runtime secrets for the owned Next server.
5. Used a fresh headless Chromium context at 1440×1000, disabled service workers, and blocked all non-local browser requests. Dependencies, Python, the backend cache and Chromium were already present; installation from a clean machine was not exercised. The folder proof used no media/provider mocks or usable provider token.
6. Wrote evidence outside scratch storage, removed only owned processes/backend scratch state, and left the shared validation build/backend binary cache in place.

These steps do not certify deployment provisioning, Vercel routing/configuration, production identity/HTTPS sessions, fresh dependency/backend downloads, Clerk email/social completion, real OAuth permissions/subscriptions, webhook reception on a public hostname, provider send acceptance, or recipient delivery. Those target-specific paths remain unverified.

The remaining mapped browser journeys were not executed by this proof. Existing broad UI/control/trigger/library smokes have stale legacy greeting assertions; the library smoke also has a legacy new-draft response predicate and fixed historical artifact destinations. Their current limitations are recorded in the feature map. Unit/client/backend tests and API smoke passed, but do not replace those browser entry points. The optional Clerk integration was not run, and no real Meta authorization, live gate change, delivery or uncertain-send retry occurred. Live Meta acceptance is explicitly **not run — real delivery disabled**.

Use `/maintain-verification-skill` to update these journeys and their proof as the product changes.
