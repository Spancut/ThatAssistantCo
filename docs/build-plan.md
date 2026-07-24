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

## Milestone 3 — AI Workbench & Outputs

**Status:** not started

## Milestone 4 — Product-Specific Operations

**Status:** not started

## Milestone 5 — Hardening

**Status:** not started
