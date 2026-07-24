# Architecture

## Stack

- **Next.js 16 (App Router)**, TypeScript strict, Turbopack (default in v16)
- **Tailwind CSS v4** + **shadcn/ui** (new-york style, CSS variables) for the design system
- **Supabase**: Postgres (data), Supabase Auth (email/password sessions via `@supabase/ssr`), Supabase Storage (documents, later milestone)
- **Zod** for all boundary validation (forms, server actions, AI structured output)
- **OpenAI** (Responses API) for the single AI orchestration service — server-side only (Milestone 3+)
- **Vitest** for unit tests, **Playwright** for end-to-end smoke tests

## Why this shape

One Next.js app, one Supabase project, one AI orchestration module — not two apps and not a multi-service architecture. The product split between Partner and Founder is a **data-driven mode**, not a build-time fork: a workspace (`organizations` row) has a `product_mode` column, and the application layer branches on it for navigation, dashboards, and which domain tables/workflows are relevant. This keeps the platform layer (auth, orgs, memberships, permissions, audit, AI orchestration, approvals) genuinely shared while letting each product feel purpose-built.

## Layers

```
app/                    Route segments (App Router). Server Components by default.
  (auth)/               Public auth routes: login, signup, callback
  (app)/[orgSlug]/      Authenticated, org-scoped routes (dashboard, settings, ...)
components/
  ui/                   shadcn primitives (generated, lightly customized)
  shell/                AppShell, Sidebar, ModeNav — product-mode-aware chrome
lib/
  supabase/             Client factories: browser client, server (RSC/Server Action) client
  server/                Server-only utilities (audit events, RPC wrappers) — never imported by client components
  validations/          Zod schemas shared between forms and server actions
supabase/
  migrations/           Timestamped SQL migrations (schema, RLS, functions)
  seed.sql              Deterministic dev-only seed data
docs/                   This documentation set
```

Route protection and request-scoped Supabase session refresh happen in `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; the exported function is `proxy`, not `middleware`). Per Next.js 16 guidance, Proxy alone is not treated as the authorization boundary — every server action and server component that touches org data re-checks the caller's membership (via RLS, which is unconditional) rather than trusting Proxy to have gated the route.

## Server/client boundary

- All Supabase writes that matter (workspace creation, org rename, future AI runs) go through **Server Actions** or Route Handlers — never client-side inserts.
- The browser only ever holds the **anon key**; the **service role key** exists only in server-only modules (`lib/server/*`) and is never imported by a file that can end up in a client bundle. Nothing in `lib/server/` has a `"use client"` boundary above it.
- All AI model calls (Milestone 3+) happen inside server actions/route handlers using a server-only OpenAI client — the API key is never sent to the browser.

## Multi-tenancy

Every organisation-owned table carries `org_id` and is protected by Postgres Row Level Security keyed off the `memberships` table (see [data-model.md](data-model.md) and [roles-and-permissions.md](roles-and-permissions.md)). The application never relies on application-layer filtering alone to enforce tenant isolation — RLS is the enforcement boundary, application code is a convenience layer on top of it.

## Extensibility

The schema and permission model are built to extend without rewrites: the `role` enum already includes `client_reviewer` and `certified_operator` even though the MVP doesn't expose behavior for them, and the platform tables (contacts, documents, workflows, workflow_runs, generated_outputs, approvals, tasks, human_value_entries, usage_records, subscription_entitlements) are documented in [data-model.md](data-model.md) now so later milestones add to an already-considered shape rather than bolting on.
