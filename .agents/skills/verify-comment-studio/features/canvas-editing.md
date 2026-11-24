# Canvas editing

People build a comment automation by adding triggers and response/control nodes, editing an inspector, arranging nodes, connecting branches, and testing the current draft locally before publishing it.

## Sub-features

- `canvas-inspector`: select/edit/rename nodes and message content on desktop and narrow layouts.
- `canvas-graph`: drag/save/reload positions, add/remove nodes, connect/reconnect/delete edges and validate disconnected responses.
- `canvas-navigation`: pan/zoom/fit, arrange and responsive/touch navigation without losing edits.
- `canvas-simulation`: include/exclude matching and conversation preview without jobs, contacts, runs or real delivery.
- `canvas-controls`: action, condition, delay, randomizer and trigger branches within their supported restrictions.

## How to get to it (user POV)

- Create a blank automation via Automation → `New automation` → `Start from scratch`, or reopen its `/automation/<id>` link.
- Click a node card to open `Selected node settings`; narrow layouts may require `Edit Comment trigger`, `Edit Public response` or `Edit Private reply` after selecting it.
- Choose `+ New Trigger` in the trigger overview or `Add step` in the editor; choose the appropriate item in the trigger dialog/node palette.
- Drag a card, use its source/target handles, select a connection and press Delete, or use its accessible delete action.
- Open `Preview`; choose `Test` for `Comment text`/`Test automation` or the conversation view for interaction previews. Close with `Close preview`.

## Driving it with repository smoke scripts

Preconditions: validation build; the existing UI smoke owns an isolated session, unusable fixture channel, current graph and expected message values. Extra branch checks require their own richer fixtures. A bare folder-proof backend does not provide them.

- **Core canvas.** Run `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" npm run test:ui` with the disabled-delivery environment. It asserts region `Comment automation flow`, selects `.react-flow__node[data-id="comment-trigger"] .node-card`, `.react-flow__node[data-id="public-response"] .node-card` and `.react-flow__node[data-id="private-reply"] .node-card`; uses `Add step` and `.node-palette`; edits `Private reply text`; drags actual nodes/handles from their current bounds; saves and independently compares persisted graph nodes/edges/positions after reload.
- **Connection validation.** The same smoke deletes/reconnects actual edges, saves disconnected drafts, and confirms `Connect the comment trigger to the private reply before publishing.` when publication is attempted. An edge drawn on screen without a persisted graph read is incomplete evidence. Check desktop and 390px/touch paths separately.
- **Local matching simulation.** Existing UI smoke adds `User comments on your Post or Reel`, enters `Excluded keywords` = `STOP`, opens `Preview` → `Test`, fills `Comment text` = `LINK STOP`, and clicks `Test automation`. It expects `Excluded keyword matched: STOP.`; changing text to `LINK` expects `Matched. This comment would start the automation.`. It then independently checks zero jobs and contacts. Later conversation-preview checks compare jobs/contacts/runs before and after; preserve these observations when extending preview behavior.
- **Control/trigger branches.** For changes beyond the main editor path, use `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" node scripts/control-steps-smoke.mjs` and `NEXT_VALIDATION_BUILD=true UI_ARTIFACT_DIR="$VERIFY_EVIDENCE_DIR" node scripts/trigger-smoke.mjs`, with disabled-delivery variables. Read their concrete branch fixture/setup before selecting a journey; archive exit codes/screenshots. `npm test` corroborates evaluator/graph agreement and scheduler boundaries with provider fixtures.

## Gotchas

- Match/no-match preview is local simulation, even when its text says it would enqueue. It must not increment real send totals. Observe row counts/network behavior; do not trust the word “test”.
- Never click real OAuth or supply usable Meta tokens for graph tests. Existing UI smoke blocks non-local browser requests and mocks media reads only at the provider boundary; this does not firewall backend network traffic.
- Node IDs above are for initial comment/public/private nodes. Newly created nodes have generated IDs; derive them from the rendered graph rather than guessing.
- Disconnected drafts are saveable but not publishable. Do not “fix” this expected negative path by mutating stored edges behind the UI.
- A mouse gesture does not prove touch behavior; desktop inspector visibility differs from narrow selection/edit controls. Missing fixture channels, triggers or branches fail the relevant journey instead of reducing its assertions.
- Phase 1 updates the main UI smoke to the current Welcome heading and Test automation labels. Control/trigger helpers have separate legacy greeting assumptions; repair them before claiming those additional journeys. The folder proof alone certifies no canvas journey.
