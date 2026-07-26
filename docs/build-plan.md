# Build Plan

Living tracker, updated at the end of every milestone. See the individual milestone acceptance criteria in the original product spec (not duplicated here — this file tracks status and validation evidence, not requirements).

## Milestone 1 — Foundation

**Status:** complete (2026-07-24)

Scope: application foundation, auth, protected routes, workspace creation, product selection, Partner/Founder onboarding, shared shell, product-specific navigation, database schema + migrations + RLS + seed data, settings foundation, audit event utility.

Validation checklist — every item below was actually executed, not assumed:
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — succeeds (Turbopack, all app routes compiled)
- [x] `npm test` (Vitest unit tests) — 17/17 passing
- [x] Migrations applied to a real hosted Supabase project (`supabase db push`, project `wpvwifobozfnblcvvaxs`)
- [x] Live sign-up round trip (Playwright, real Supabase project) — correctly shows "check your email" since the project requires email confirmation; a fabricated email domain was also correctly rejected by Supabase's deliverability check, which surfaced through the app's error UI as designed
- [x] Live sign-in round trip (Playwright + seeded demo accounts, real Supabase project)
- [x] Cross-org RLS isolation verified live: signed in as two different seeded users, each could only see their own organization/membership rows (`scripts/seed.ts` creates the accounts; verified via a throwaway script, then again via the Playwright suite)
- [x] Partner vs Founder nav/dashboard confirmed genuinely different (Playwright asserts distinct nav labels — "Dashboard" vs "Command Centre" — and distinct dashboard content per mode)
- [x] Settings: workspace rename form and members list verified live (Playwright)
- [x] Playwright smoke test passing against the real dev server + real Supabase project (4/4)

Known limitations carried forward: `npm audit` flags 6 advisories, all in transitive dev-only dependencies (shadcn CLI's bundled MCP SDK; Next.js's own vendored `postcss`/`sharp`) — not part of the shipped app's dependency graph, and `npm audit fix --force` would downgrade Next.js to v9, which is worse. No member-invite flow yet (by design, see docs/roles-and-permissions.md). No dark mode toggle wired up yet (CSS variables exist, `next-themes` not yet connected to a UI control).

## Milestone 1.5 — Entitlements, Usage & Notifications Foundation

**Status:** complete (2026-07-24)

Scope: schema + server-side plumbing only, ahead of Milestone 3's AI generation so every AI call site is required to check entitlements from day one rather than retrofitted later. No Stripe checkout/webhooks, no upgrade/downgrade flow, no email delivery — those are separate future milestones. Milestone 2 (Client Hub / Contact & Lead Hub) had not yet run when this landed, so it doesn't depend on those tables.

New tables (`subscriptions`, `entitlements`, `usage_events`, `notifications`), all `org_id`-scoped with RLS matching the Milestone 1 pattern (see docs/decisions.md for why `org_id` rather than the spec's literal `workspace_id` column name). `create_workspace()` now also provisions a trial subscription and a generous default entitlement set atomically; a migration-time backfill covers workspaces that existed before this migration. A new `create_notification()` SECURITY DEFINER RPC is the only write path into `notifications` (parallel to `create_workspace()`).

**The actual deliverable:** [lib/server/entitlements.ts](../lib/server/entitlements.ts) exports `checkEntitlement(workspaceId, featureKey, client?)` and `recordUsage(workspaceId, featureKey, amount = 1, client?)` — this is the only path Milestone 3's AI generation call sites should use; see "Milestone 3 integration" below. Unconfigured feature keys are default-denied, not default-allowed. The "current period" is the calendar month in UTC (no billing-anniversary data exists yet).

Also shipped: [lib/server/notifications.ts](../lib/server/notifications.ts) (`createNotification`, `getRecentNotifications`, `getUnreadNotificationCount`, `markNotificationRead`), a bell icon in the app shell with unread badge and a real (not placeholder) mark-as-read dropdown, a read-only `/settings/billing` page, and exactly one notification-writing call site (`app/onboarding/actions.ts`, on workspace creation) to prove the pipe works end to end.

Validation checklist — every item below was actually executed, not assumed:
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — succeeds
- [x] `npm test` — 27/27 passing (17 from Milestone 1 + 10 new: `checkEntitlement`/`recordUsage` block/allow/unlimited/default-deny/error-surfacing, including a stateful fake-Postgres test proving `recordUsage()` → `checkEntitlement()` reflects the new usage on the next call)
- [x] Migration applied to the real hosted Supabase project (`supabase db push`)
- [x] Live RLS isolation verified (throwaway script, then deleted): two seeded users each see only their own `subscriptions`/`entitlements`/`notifications` rows; both have the 3 default entitlements
- [x] Live `usage_events` write-path RLS verified: own-org/own-user insert succeeds; cross-org insert is rejected; impersonating another user's `created_by` is rejected — all confirmed against real Postgres, not just unit-tested
- [x] Playwright: `/settings/billing` renders plan + usage for the seeded workspace (2/2 new tests), plus a live end-to-end proof that creating a workspace through the real onboarding UI produces a real notification visible in the bell

**Bug found and fixed along the way:** Base UI's `Menu.GroupLabel` (used by the shared `DropdownMenuLabel`) requires a `Menu.Group` ancestor. `UserMenu` (built in Milestone 1) violated this too — it just had never been exercised by a test that actually opened the dropdown. Both `UserMenu` and the new `NotificationBell` now wrap their label in `DropdownMenuGroup`.

Known limitations: no Stripe integration (by design, future milestone); no email notification delivery (by design); notification "polling" is a fresh read on each server-rendered navigation, not a client-side interval or realtime subscription; the live RLS/usage-events verification scripts were throwaway (deleted after use, per the Milestone 1 pattern) rather than a permanent automated integration-test suite against a live database.

### Milestone 3 integration

```ts
import { checkEntitlement, recordUsage } from "@/lib/server/entitlements";

const { allowed, remaining } = await checkEntitlement(workspaceId, "ai_generations_per_month");
if (!allowed) {
  // return a clear "you're out of AI generations this period" response
}
// ... run the workflow ...
await recordUsage(workspaceId, "ai_generations_per_month");
```

Both functions accept an optional trailing `SupabaseClient<Database>` for tests/scripts; production call sites in Route Handlers/Server Actions can omit it and it resolves the request's own Supabase client internally.

## Milestone 2 — Knowledge & Relationships

**Status:** complete (2026-07-24)

Scope: the entity both products are actually organized around — Partner's `client_profiles`, Founder's `contacts` — plus a shared `knowledge_base_items` table. Data model + CRUD + RLS + navigation only; no AI generation (Milestone 3), no member-invite, no billing changes.

New tables (`client_profiles`, `contacts`, `knowledge_base_items`), `org_id`-scoped with RLS identical in shape to every other workspace-scoped table. Ordinary members can insert/update rows in their own workspace (unlike `organizations`/`memberships`, which are locked behind `create_workspace()`); `client_profiles` uses a soft `archived_at` rather than hard delete, `knowledge_base_items` supports a real delete. A `knowledge_base_items_single_link` check constraint prevents a knowledge item from being linked to both a client and a contact at once. Retrofitted a `set_updated_at` trigger onto `client_profiles`/`contacts`/`knowledge_base_items` and, while in there, onto `subscriptions`/`entitlements` (Milestone 1.5) too — those had `updated_at` columns but no trigger ever maintaining them, a latent gap that hadn't mattered yet only because nothing updated those rows.

**UI:** Partner gets a Client Hub (`/clients`, `/clients/[id]`) with a brand-voice/preferences/key-facts editor and linked knowledge items; Founder gets a Contact & Lead Hub (`/contacts`, `/contacts/[id]`) with a stage-grouped board (dropdown-based stage changes, not drag-and-drop — kept intentionally simple per scope) and linked knowledge items. Both hubs are genuinely empty until the user adds something — the empty state is the real create form, not a fake button. The dashboard's "Client Hub"/"Contact & Lead Hub" cards, previously `ComingSoonCard` placeholders, are now real links showing live counts. Nav gained "Clients"/"Contacts" (kept short and distinct from the full page titles to avoid a `getByText` collision with the dashboard cards — see docs/decisions.md).

Every create/edit/archive/delete on these three tables writes an `audit_events` row via the existing `lib/server/audit.ts` helper — no parallel logging path. Pipeline stage changes get their own `contact.stage_changed` audit action (metadata: `{from, to}`) distinct from generic `contact.updated`.

**Seed data:** `scripts/seed.ts` now creates 3 realistic clients for `partner-demo` (Brightleaf Bakery, Nordholt Legal Group, Cedar & Vine Landscaping) and 8 contacts spread across all 6 pipeline stages for `founder-demo`, each with 1 linked knowledge item on most of them — idempotent by name, so re-running `npm run seed` doesn't duplicate rows.

Validation checklist — every item below was actually executed, not assumed:
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — succeeds
- [x] `npm test` — 41/41 passing (27 prior + 14 new org-scoping tests against a purpose-built in-memory fake Postgres, see `test/helpers/fake-supabase.ts` and `lib/server/entities.test.ts`)
- [x] Migration applied to the real hosted Supabase project (`supabase db push`)
- [x] Live RLS isolation verified (throwaway script, then deleted) for all three tables: reads scoped correctly, cross-org insert rejected, a blind cross-org update/delete by id affects zero rows without erroring (proper RLS-filtered no-op) and leaves the real data untouched
- [x] Playwright: creating a client through the real UI as `partner-demo` is invisible to a second, freshly-created Partner user in their own workspace — both absent from their list AND a 404 when guessing the exact URL (proves row-level, not just workspace-level, isolation). Same pattern for a contact in a second Founder workspace. (2/2)
- [x] Playwright: changing a contact's pipeline stage via the board persists after a full page reload and writes a matching `contact.stage_changed` audit_events row (1/1)
- [x] Full Playwright suite (9 tests across all milestones) run twice consecutively with no failures, to rule out flakiness after fixing the bugs below

**Bugs found and fixed along the way (all in test infrastructure, not the app):**
- `organizations.created_by` has no cascade from `auth.users` (deliberately — an org must keep pointing at its creator). Test cleanup that called `admin.auth.admin.deleteUser()` directly on a user who'd created a workspace was silently failing (the error was never checked), leaving two stray "notification smoke" users/workspaces permanently in the live project from Milestone 1.5's own test runs. Fixed with `e2e/helpers.ts:deleteTestUserAndOrgs()` (delete the org first, which cascades away every org-scoped table, then the user), applied retroactively to `billing-and-notifications.spec.ts` too. Cleaned up the stray data.
- Tests that sign in as one user, then sign in as a second user without signing out first, silently fail: `proxy.ts` redirects an already-authenticated session away from `/login` back into the app, so the "login form" the test tries to fill out doesn't exist, and every subsequent action times out. Added `e2e/helpers.ts:signOut()` (drives the real UI sign-out) and gave the account-menu trigger an `aria-label="Account menu"` so it's reliably targetable.
- A test that calls `page.reload()` immediately after a UI interaction that triggers a Server Action can race ahead of that action and cancel it mid-flight — the pipeline-stage test was reloading before the stage change had actually persisted, making a real, working feature look broken. Fixed by waiting for network idle before reloading.

Known limitations: no drag-and-drop on the contact board (dropdown only, per scope); no "unarchive" action for clients (one-way archive, matches the literal spec — a restore path is a reasonable future addition); the live RLS verification script was throwaway (deleted after use, per the Milestone 1 pattern) rather than a permanent automated integration-test suite; one harmless unconfirmed test signup (`thatassistant.smoke.test+...@gmail.com`, no workspace, from the Milestone 1 smoke test) remains in the live project — it was never captured as a variable to clean up and poses no risk.

## Milestone 3 — AI Workbench & Outputs

**Status:** complete (2026-07-24)

Scope: the first workflow that calls a real model — the pattern every later AI workflow copies. One workflow_template ("draft_email"), one orchestration path, shared by both products; only context assembly and UI copy differ per product_mode. Partner: "Draft email" from a client's detail page. Founder: "Draft response" from a contact's detail page. No send/publish integration, no multi-step/agentic workflows, no second workflow_template.

**Data model:** `workflow_templates` (global registry, not org-scoped — seeded by the migration itself, not `scripts/seed.ts`), `workflow_runs`, `outputs`, `approvals`, `human_value_entries` (Partner-only). RLS matches the established member-required pattern; `approvals` has no `org_id` column per the source spec, so its policies join back to `outputs.org_id` via `exists (...)` instead of a direct `is_org_member(org_id, ...)` check. See docs/decisions.md for why `approvals`/`human_value_entries` are shaped the way they are.

**Orchestration ([lib/ai/](../lib/ai/)):** `orchestrator.ts` is the only place `checkEntitlement`/`recordUsage` (Milestone 1.5) and the model get called together — `client.ts` is the only place that imports the `openai` package. Output contract (`schema.ts`): `{ subject, body, tone_notes, context_sources_used, confidence_flag }`, validated with Zod against every model response; `generateWithValidation()` retries once on a schema-validation failure (not on a network/API error, which fails immediately) and throws `ModelOutputValidationError` if the second attempt also fails, which the orchestrator turns into `workflow_run.status = "failed"` — never a malformed output surfaced as usable. Prompt is versioned (`prompts/draft-email.ts`, `DRAFT_EMAIL_PROMPT_VERSION`), one shared template for both products with the recipient block swapped by `AssembledContext`'s discriminated union (`context.ts`: `assembleClientContext` pulls `brand_voice`/`preferences`/`key_facts`/linked knowledge items; `assembleContactContext` pulls `notes`/`pipeline_stage`/linked knowledge items). Safety-policy guidance (no earnings/health/legal/financial claims, no invented testimonials, etc.) is embedded directly in the single prompt rather than a separate moderation call, to stay a one-model-call workflow per scope.

**Approval gate:** every output starts `status = "draft"` and is never shown anywhere as sendable — there is no send button. Review screen lets the human edit the subject/body before approving; approving does not send anything, it only marks the output reviewed (`approved` or `edited_and_approved` depending on whether the text actually changed) and locks in the final text for copy-paste. Every approve/reject writes an `audit_events` row. Partner-only: on approval, the Human Value Layer form (6 optional free-text fields: context added, judgment applied, preference considered, risk identified, recommendation made, corrections made) appears and saves to `human_value_entries`, also audited. Founder never sees this UI.

**Entitlements integration (the actual test of Milestone 1.5's work):** `checkEntitlement(orgId, "ai_generations_per_month")` runs before the model is ever called; if blocked, the UI shows "You've used all your AI drafts for this month" and the model is never invoked (unit-tested by asserting the injected model client's mock was never called). `recordUsage()` runs only after a successful generation — never on a failed one.

Validation checklist — every item below was actually executed, not assumed:
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — succeeds
- [x] `npm test` — 48/48 passing (41 prior + 7 new: `generateWithValidation`'s retry-then-fail logic in isolation, and three orchestrator-level tests — entitlement-blocked never calls the model, malformed-response-twice ends the run `failed` with no output ever created, and a full happy-path proving `workflow_run.status="completed"`, `output.status="draft"`, and usage recorded — all against the shared in-memory fake Postgres with an injected fake `ModelClient`, no network calls)
- [x] Migration applied to the real hosted Supabase project (`supabase db push`); the `draft_email` `workflow_templates` row confirmed present
- [x] Live RLS isolation verified (throwaway script, then deleted) for all four tables: reads scoped correctly, cross-org `workflow_runs` insert rejected, approving another org's output rejected, a blind cross-org status update affects zero rows without erroring, `human_value_entries` isolated the same way, and `workflow_templates` confirmed readable by any authenticated user (shared registry, not tenant data)
- [x] Playwright, **real OpenAI calls** (not mocked): Partner generates a draft for a real seeded client, edits the body, approves — confirmed `edited_and_approved` status, a matching `output.edited_and_approved` audit_events row, and a `human_value_entries` row with the saved text persisting after reload. Founder generates a draft for a real seeded contact, approves unedited — confirmed plain `approved` status (not edited), a matching `output.approved` audit_events row, and zero `human_value_entries` rows (Founder never gets that UI). Full suite (11 tests) run twice consecutively with no failures.

**Bugs found and fixed along the way — both are real correctness bugs the live model calls exposed, not test-only issues:**
- **Unedited approvals were misclassified as edited.** `approveOutputAction` compared the submitted subject/body against the model's raw stored values to decide `approved` vs `edited_and_approved`. Two separate discrepancies made an untouched draft look edited: (1) the review form's Zod schema trims the submitted values but the comparison used the untrimmed original, and (2) the HTML form-submission spec normalizes `<textarea>` line breaks to `\r\n` when serialized, so even byte-for-byte-identical text differed from the model's `\n`-only JSON by line-ending style alone. Fixed by trimming both sides before comparing and normalizing `\r\n → \n` in the body schema itself (`lib/validations/ai.ts`). Caught by the live Founder Playwright test, which asserted "approved" and got "edited_and_approved" — reproducible every time against real model output, not a flaky fluke.
- `eslint`'s default `no-unused-vars` "after-used" policy only ignores an unused arg if a *later* arg is used — a Server Action with every param after the first unused (e.g. `rejectOutputAction`, which needs no form fields) warned despite following the codebase's existing `_prevState` naming convention for "intentionally unused." Fixed by configuring `argsIgnorePattern: "^_"` in `eslint.config.mjs` so the convention is actually enforced, not just followed by luck of parameter order.
- Also fixed a pre-existing duplicate "Milestone 3" heading in this file (harmless, but confusing) while filling in this section.

Known limitations: no drafts-history/"AI Workbench" list view — a draft is only reachable by the direct `/outputs/[id]` link produced right after generating it (dashboard now says so honestly instead of leaving the old "coming soon, Milestone 3" card, which would have been actively wrong once this shipped); `structured_content`'s `tone_notes`/`context_sources_used`/`confidence_flag` are not re-editable by the human (only subject/body are — matches the spec's "editable" scope, which named those two fields); no retry/regenerate button on a failed generation (the user just submits the prompt again); the live RLS verification script was throwaway per the established pattern.

## Milestone 4 — Product-Specific Operations

**Status:** not started

## Milestone 5 — Hardening

**Status:** not started
