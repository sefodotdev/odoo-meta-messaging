# Account/workspace access

People sign in to their own account, connect an authorized Instagram account or Facebook Page to its own workspace, link earlier workspaces, switch memberships, and revoke their session on sign-out.

## Sub-features

- `access-sign-in`: email OTP/Facebook initiation; legacy password form is a separate compatibility path.
- `access-account-catalog`: identity-only onboarding, account search, authorized asset discovery before the first workspace, connection/reconnection.
- `access-membership`: create one workspace per connected account; link an older workspace; list/switch only owned memberships; preserve workspace on reconnect.
- `access-denial`: anonymous, foreign-workspace, foreign-asset and cross-origin requests are rejected without data leaks.
- `access-sign-out`: revoke the session, including after a workspace switch.

## How to get to it (user POV)

- Open `/sign-in`; choose `Sign in with email` or `Sign in with Facebook`. The isolated legacy form is at `/` with `Workspace name`/`Workspace password`.
- Open `/account` directly, `My Profile` → `Manage Accounts`, or a workspace's `Manage Accounts` link.
- Choose `New Account` → Instagram or Facebook, reaching `/account/new?platform=instagram` or `platform=facebook`; authorize then connect an available account. Reconnect an existing account from its account controls.
- Open `/onboarding` for `Link workspace`; use the `Switch workspace` region to open another membership.
- Choose `Sign out` from the profile menu.

## Driving it with repository smoke scripts

Preconditions: SKILL.md validation build and evidence directory exist. Default checks have no real identity/OAuth grants. Clerk integration additionally requires this project's own **development** `sk_test_`/`pk_test_` pair and a Clerk `convex` JWT template; do not expose or substitute another team's keys.

- **Local access boundaries.** Run `NEXT_VALIDATION_BUILD=true npm run smoke` with disabled-delivery variables and archive its exit code/log. It drives `/api/session` signup/login/logout, two workspaces, protected lists/detail/update/delete, `X-Workspace-Id` denial, OAuth state/Page-choice isolation and `401` for legacy access to `/api/account/channels`. Expected: no foreign data/actions, logout makes protected reads `401`. This is legacy API evidence, not Clerk UI proof.
- **Identity ownership.** Run `npm test`. Inspect `convex-tests/backend.test.ts`, `convex-tests/meta-connect.test.ts`, `convex-tests/meta-callback.test.ts`, `convex-tests/audit-hardening.test.ts`, `client-tests/account-connections.test.tsx`, and `client-tests/profile-menu.test.tsx`. They exercise authenticated memberships, account assets, expiring/single-use state, foreign grants, connection reservations and reconnect semantics at fixture boundaries. Preserve failing test names rather than reporting a blanket access pass.
- **Optional Clerk integration.** When explicitly running the provider integration, use `NEXT_VALIDATION_BUILD=true DELIVERY_MODE=disabled APP_ENVIRONMENT=test ALLOW_DEVELOPMENT_DELIVERY=false UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:auth > "$VERIFY_EVIDENCE_DIR/clerk-smoke.log" 2>&1`. This existing script deliberately loads the configured development Clerk keys, creates reserved random `+clerk_test@example.com` identities, uses the isolated backend and cleans up only those identities. It contacts Clerk; this is outside the default offline-provider proof.
- **Clerk UI handles.** The auth smoke uses `Email address`, `Sign in with email`, `Verification code`, `Verify and continue`, `Manage Accounts`, `New Account`, `Search accounts`, `Open workspace for …`, `Link workspace`, the `Switch workspace` region and `Sign out`. Assert connected/available account tables, the correct workspace heading and denied foreign HTTP reads after selection. Retain before/after UI evidence per exercised entry point. Facebook initiation ends at an authorization redirect; completion remains unverified.

## Gotchas

- The default helper's successful legacy sign-in cannot certify Clerk OTP, account discovery or identity-level authorization. A fresh helper has no Clerk identity or authorized assets; attempts to drive these journeys there fail for that reason.
- New users must not inherit `owner`. Browser-supplied identity/owner IDs never establish ownership. Account pending state must expire and be one-time; workspace pending state requires membership. Do not move these boundaries into a verification backdoor.
- Creating arbitrary unconnected workspaces is not equivalent to the supported new-account flow. A linked legacy workspace is a separate migration journey.
- OAuth page discovery/subscription fixtures in tests do not prove real grants, App Review, public access or Meta delivery. New connections require a fresh authorized Page/account; reconnect retains the existing workspace. Identity-only health does not prove messaging permissions.
- The optional Clerk script can change its development service by creating/deleting its own test users. Missing development keys/provider readiness must be recorded as an unmet prerequisite, never bypassed with production keys. It does not prove real email arrival or a completed Facebook login.
