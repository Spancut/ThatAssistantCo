# Decisions

Lightweight decision log. Newest first.

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
