# Decisions

Lightweight decision log. Newest first.

## 2026-07-24 — Fixed email-bounce source: fabricated addresses through real Supabase Auth signup

Supabase flagged this project for a high email bounce rate. Root cause, confirmed by auditing every place `scripts/seed.ts`, `test/helpers/fake-supabase.ts`, and every Playwright spec touch an email address: `e2e/smoke.spec.ts`'s signup test filled the real `/signup` form (which calls Supabase's public `auth.signUp()`, the endpoint that actually attempts SMTP delivery) with `thatassistant.smoke.test+<timestamp>@gmail.com` — a fabricated, never-owned mailbox on a domain (gmail.com) that *does* have valid MX records, so it passed Supabase's deliverability pre-check and Supabase genuinely tried to deliver a confirmation email, which bounced. Every other email in the codebase goes through the Admin API (`auth.admin.createUser({ email_confirm: true })`), which doesn't send mail at all regardless of domain — those were a smaller, defense-in-depth concern (a fabricated domain that costs nothing to fix now, in case a future code path ever does email one of them), not the active bounce source.

Fix, matching the three approaches in order of preference:
- **(a) Admin API for test users, already the pattern everywhere except one test.** `e2e/entities.spec.ts`'s `createConfirmedUser` and `e2e/billing-and-notifications.spec.ts`'s notification-smoke user already used `auth.admin.createUser({ email_confirm: true })` — no signup email ever sent. Only tightened their email domain (see below) for consistency.
- **(b) Fixed, owned address for the one test that must exercise the real signup UI.** `e2e/smoke.spec.ts`'s signup test exists specifically to verify the real `auth.signUp()` path (Zod validation, Supabase's own deliverability check, the "check your email" messaging, and — the actual security property under test — that no session is ever silently granted without confirmation). Switching it to the Admin API would stop testing what it exists to test. Instead it now uses a **fixed** address, `danielcutrona+e2e-signup-test@gmail.com` — a real inbox someone on the team owns, and no longer a fresh `Date.now()`-suffixed address per run. If Supabase ever does attempt delivery (first run, or a resend on a repeat run), it lands in a real mailbox instead of bouncing. This also means a second run may see "user already registered" instead of "check your email"; the test asserts on "some Alert renders and we're still on /signup," which holds either way.
- **(c) Not used.** A no-op Send Email Auth Hook wasn't necessary once (a) and (b) closed the actual gap, and would have added infra to maintain across environments for no remaining benefit.

Every seed/test email is now under `danielcutrona+<alias>@gmail.com` (a real, owned inbox with `+` tagging) instead of the fabricated `thatassistant.dev` domain — see `e2e/helpers.ts` (`PARTNER_DEMO_EMAIL`, `FOUNDER_DEMO_EMAIL`, `testEmail()`) and `scripts/seed.ts`. The two live demo users (`partner-demo`, `founder-demo`) were renamed in place via `auth.admin.updateUserById` rather than recreated, so their existing workspace/data/membership rows were untouched.

**Explicitly left alone:** the 8 fake business-contact emails in `scripts/seed.ts`'s `CONTACT_SEEDS` (`jordan@skylineroasters.example.com` etc.) are `contacts.email` — plain data in the app's own table, never passed to Supabase Auth or any email-sending API. `example.com` (IANA-reserved, documented as non-deliverable by design) is the correct choice for fake CRM records precisely because nothing in this system will ever try to send them mail.

## 2026-07-24 — Custom SMTP is required before any real user signs up

Flagging now, not implementing: Supabase's default/shared email service is explicitly documented as non-production — rate-limited to roughly 2 emails/hour, and it shares sending reputation across every Supabase project using it (which is almost certainly *why* one bad batch of test bounces was enough to get this project flagged — the reputation pool is shared, not per-project). Before this app can accept a real signup, it needs a custom SMTP provider (e.g. Resend, Postmark, SES) configured in Supabase Auth settings, with its own domain, SPF/DKIM/DMARC, and dedicated (or at least not-shared-with-strangers) sending reputation. Out of scope for this pass — this is a pre-launch checklist item, not a code change.

## 2026-07-24 — Nav labels stay short ("Clients"/"Contacts"), distinct from page titles

`ModeNav` links to the Client Hub / Contact & Lead Hub as "Clients" / "Contacts", not their full page titles. Two reasons: it reads better as a short nav label, and it avoids a real problem — the dashboard's summary card and the hub page's own `<h1>` both use the full name ("Client Hub", "Contact & Lead Hub"), and `CardTitle` renders a `<div>`, not a semantic heading, so Playwright's `getByText("Client Hub")` can't be disambiguated by role the way `getByRole("heading", ...)` disambiguates the page's `<h1>` from the nav link. Keeping the nav label a different string entirely sidesteps the collision rather than papering over it with `.first()` in every test.

## 2026-07-24 — Test cleanup must delete the org before the user

Discovered via two stray "notification smoke" workspaces left permanently in the live Supabase project: `organizations.created_by` references `auth.users(id)` with no cascade (deliberate — an org shouldn't lose its creator record just because the row happens to still exist), so `admin.auth.admin.deleteUser()` fails with a foreign-key violation for any test user who created a workspace, unless the organization is deleted first (which cascades away every org-scoped table and clears the path). The failure was silent because the test's cleanup call wasn't checking the returned error. Fixed in `e2e/helpers.ts` (`deleteTestUserAndOrgs`), applied to every Playwright test that creates a throwaway user via the Admin API.

## 2026-07-24 — `org_id`, not `workspace_id`, on the new billing/notification tables

The entitlements-foundation spec described the new tables' tenant column as `workspace_id`. Every existing workspace-scoped table (`memberships`, `audit_events`) uses `org_id` against `organizations.id` — "workspace" is the product-facing term for what the schema calls an organization, not a second underlying concept. Introducing `workspace_id` alongside `org_id` would make every future cross-table join/RLS policy inconsistent for no benefit. `subscriptions`, `entitlements`, `usage_events`, and `notifications` all use `org_id`. The public TypeScript helpers (`checkEntitlement`, `recordUsage`, `createNotification`) still take `workspaceId` as their parameter name, since that's user-facing API surface, not a DB column — so callers writing Milestone 3 code can use the exact signature from the spec regardless of this internal naming choice. Cheap to rename later if this guess was wrong (brand-new tables, no data yet).

## 2026-07-24 — Usage periods are calendar-month UTC, not billing-anniversary

`checkEntitlement`'s "current period" sums `usage_events` since the start of the current calendar month in UTC. There's no Stripe integration yet and `subscriptions` has no `current_period_start`/`current_period_end` columns, so there's no billing-anniversary date to anchor to. When Stripe billing lands, this should switch to the subscription's actual billing period — noted here so that migration isn't a surprise.

## 2026-07-24 — Entitlement checks default-deny on an unconfigured feature key

`checkEntitlement(workspaceId, featureKey)` returns `{ allowed: false, remaining: 0 }` if no `entitlements` row exists for that `(org_id, feature_key)` pair, rather than treating a missing row as unlimited. An unconfigured feature key is a bug (forgot to seed the entitlement) that should fail closed, not a product decision to grant unlimited access silently.

## 2026-07-24 — `create_notification()` RPC instead of a client-facing INSERT policy

`notifications` has no INSERT policy for `authenticated` — the acting user and the notification's recipient are very often different people (someone's action notifies a teammate), which doesn't fit the "you can only insert rows about yourself" shape every other insertable table in this schema uses. `create_notification()` is a `SECURITY DEFINER` function (same pattern as `create_workspace()`) that requires the caller AND the recipient to both be members of the target workspace before it will write a row.

## 2026-07-24 — Proxy over Middleware for session refresh

Next.js 16 deprecated `middleware.ts`/`export function middleware` in favor of `proxy.ts`/`export function proxy`; the Edge runtime is not supported in `proxy` (Node.js only, not configurable). We use `proxy.ts` for Supabase session-cookie refresh and basic unauthenticated-route redirects, but per Next.js 16's own guidance we do **not** treat Proxy as the authorization boundary — every server action/server component re-verifies the caller via Supabase session + RLS. See [architecture.md](architecture.md).

## 2026-07-24 — Native forms + Server Actions over react-hook-form

shadcn's `form` component (react-hook-form + `@hookform/resolvers`) was not installed. M1's forms (sign up, sign in, create workspace, rename workspace) are simple enough that native `<form>` + Server Actions + `useActionState` + Zod validation on the server is less machinery and stays consistent with the App Router's server-first data flow. Revisit if a later milestone needs complex client-side multi-field validation/interaction.

## 2026-07-24 — Atomic workspace creation via a `SECURITY DEFINER` RPC

Creating a workspace requires two inserts (`organizations`, then the creator's owner `membership`) that must succeed together. Rather than relying on RLS policies clever enough to allow both inserts from the client in sequence (fragile, and prone to leaving an orphaned org row if the second insert fails), a single Postgres function `create_workspace(name, product_mode)` does both inside one transaction and is called via `supabase.rpc()`. This is the standard Supabase pattern for "create a resource and become its owner."

## 2026-07-24 — Hosted Supabase project, no local Docker stack

The build machine has no Docker, so `supabase start` (local dev stack) isn't available. Migrations are written as plain SQL in `supabase/migrations/` and applied to a hosted Supabase project via `supabase link` + `supabase db push`, using credentials the user provides. This has no effect on the schema/RLS design — it only changes how migrations get applied during development.

## 2026-07-24 — Product mode as data, not a build-time fork

`organizations.product_mode` (`partner`|`founder`) drives navigation, dashboard content, and (from Milestone 2 on) which domain tables are relevant — evaluated at request time in the app layer. This was chosen over separate codebases/apps per the spec's explicit instruction not to duplicate the application, and over a route-level static split, since a single workspace's mode is a data fact that could in principle change support/administration needs without a redeploy.
