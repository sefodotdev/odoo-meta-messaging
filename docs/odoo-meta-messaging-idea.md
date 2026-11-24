# Odoo Meta Messaging Integration — Project Idea

> Working name: `meta_messaging` (rename later)
> Target: Odoo 19 Community (LGPL-3), so anyone can run it without Enterprise.
> Goal: a production-quality open-source module, built to show real Odoo skills before applying.

> Reference project: my own `ManyChatClone` (see section 9). Read it before designing anything here.

## 1. The idea

Let a company connect its **Facebook Page** and **Instagram** business account to Odoo so that:

1. Incoming Messenger/Instagram DMs show up inside **Discuss** and are linked to a **contact** (`res.partner`) and, optionally, a **CRM lead**.
2. Agents reply from Odoo and the reply is delivered back to Meta.
3. Simple **automation rules** (keyword/first-message/out-of-hours) can auto-reply or create a lead.

Why this: it's a real gap, it plays to my existing experience with Meta webhooks and messaging flows, and it exercises backend, security, and frontend work in one module.

## 2. Scope

### MVP (must ship)

- Account configuration: App ID/secret, Page access token, verify token, per-company.
- Webhook controller: GET verification + POST events, with `X-Hub-Signature-256` validation.
- Inbound text messages → conversation in Discuss, linked to a partner (create or match).
- Outbound text replies from Odoo → Meta Send API.
- "Create lead from conversation" action.
- Access rights + record rules (multi-company safe).
- Tests (unit tests with mocked Meta API) and a clear README.

### Nice to have

- Attachments (images, files).
- Rule-based auto-replies (first message, keyword, outside business hours).
- Message status (delivered/read) where the API provides it.
- Basic OWL UI touches (channel badge, "reply window" indicator).
- Queue/retry for failed sends (via `ir.cron` or a queue approach).

### Out of scope (for now)

- WhatsApp (separate API and concerns).
- Chatbot builders / visual flow editor.
- Enterprise-only apps (e.g. Helpdesk). Stay on Community modules: `mail`, `crm`, `contacts`.

## 3. High-level architecture

```
Meta Platform ──webhook──▶ Odoo controller (/meta/webhook)
                              │  verify signature, parse events
                              ▼
                       meta.account (credentials, page/IG ids)
                              │
                              ▼
        conversation mapping (external sender id ↔ partner ↔ discuss channel)
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
     Discuss channel / mail.message      optional crm.lead
              │
        agent replies
              ▼
   Meta Send API (via Python `requests`, with retries)
```

Rough model list (names are placeholders):

- `meta.account` — credentials, platform (Messenger/Instagram), company, status.
- `meta.conversation` — external user id, partner, linked channel, last-inbound timestamp.
- `meta.automation.rule` — trigger type, condition, response text, active flag (nice to have).

## 4. Constraints to design around

- **24-hour messaging window:** Meta restricts freeform replies outside the window after a user's last message. The UI and send logic should respect this.
- **App Review / permissions:** Real use needs Meta app review. Document how to test in development mode with test users.
- **Security:** validate signatures, never log tokens, store secrets with restricted access groups.
- **Idempotency:** webhooks can be delivered more than once; dedupe by message id.

## 5. Roadmap

| Phase | Focus                                   | Output                                                        |
| ----- | --------------------------------------- | ------------------------------------------------------------- |
| 0     | Dev environment, read `mail`/`crm` code | Odoo from source running; notes on ORM, inheritance, security |
| 1     | Warm-up PRs                             | 2–3 small merged/open PRs (OCA preferred)                     |
| 2     | Webhook + account config                | Verified webhook, signature check, tests                      |
| 3     | Inbound → Discuss/partner               | Messages appear in Odoo                                       |
| 4     | Outbound replies                        | Two-way chat working                                          |
| 5     | CRM lead action + security              | Access rights, multi-company, record rules                    |
| 6     | Polish                                  | README, demo video, screenshots, CI, packaging                |
| 7     | Publish                                 | GitHub (LGPL-3), propose to OCA / Odoo Apps Store             |

## 6. What makes it stand out

- It actually works end to end, with a short demo video.
- Clean code that follows Odoo/OCA conventions (pre-commit, linting, tests).
- Honest README: what works, what doesn't, known limitations.
- Merged contributions elsewhere that show I can work inside their review process.

## 7. Open questions

- Which Discuss primitive fits best for external conversations (custom channel type vs. thread on partner/lead)?
- Does this belong in OCA, on the Apps Store, or both?
- How far to go on automation vs. keeping the MVP tight?
- Which Odoo version to target first, and how to handle future migrations?

## 8. Next steps

1. Set up Odoo 19 Community from source + Postgres.
2. Create a Meta developer app with a test Page and test Instagram account.
3. Skeleton module with manifest, security files, and the webhook controller.
4. Pick the first warm-up PR targets.

## 9. Reference project: ManyChatClone (my existing work)

I'm building an open-source ManyChat clone that already deals with the same Meta problems. This Odoo module should reuse what I learned there, as concepts, not as copied code.

- **Repo:** https://github.com/seifkhaled123/ManyChatClone
- **Local path:** `/home/seif/dev/AppsClone/ManyChatClone`
- **Stack (as I know it):** Next.js on Vercel (UI/API boundary), Convex (runtime records, auth, transactions, scheduled delivery), Clerk (identity), Meta Page + Instagram connections.
- **Model:** one workspace per connected Facebook Page or Instagram account, with access scoped to authenticated membership.
- **Validation commands there:** `npm test`, `npm run typecheck`, `npm run build`, `npm run smoke`.

### Instructions for the AI agent

The details above come from my notes, not from reading the code. Before writing any Odoo code, inspect the local project and report back (briefly, in a notes file) on:

1. **Meta webhook handling:** how verification (GET) and event intake (POST) work, how the signature is checked, how duplicate events are handled.
2. **Conversation/contact mapping:** how an external sender id maps to a contact and a conversation.
3. **Outbound sending:** how replies are sent, how failures and retries are handled, and how the 24-hour messaging window is enforced (if at all).
4. **Automation rules:** how triggers and responses are modelled, as input for the optional rules feature.
5. **Meta app setup:** which app, permissions and test Page/Instagram accounts already exist, so I can reuse them in development mode.
6. **Bugs and gotchas** noted in the code, comments, issues or `AGENTS.md` that I should avoid repeating.

Also read its `AGENTS.md` for how I like to work with coding agents. Create a similar `AGENTS.md` for the Odoo module repo, adapted to Python/Odoo (test and lint commands, conventions).

### Rules

- **Port ideas, not code.** Next.js/Convex/Clerk don't apply in Odoo. Re-implement in Python on Odoo's ORM, security model and `mail` stack.
- **Keep the projects separate.** The Odoo module must stand alone and be LGPL-3 licensed. Don't import or depend on ManyChatClone.
- **Credit honestly.** In the README, mention ManyChatClone as prior work only where it is true and relevant. Don't overstate what it does.
- **Do not modify ManyChatClone** while working on the Odoo module unless I ask.
