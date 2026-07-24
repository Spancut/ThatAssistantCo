# Decisions

Lightweight decision log. Newest first.

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
