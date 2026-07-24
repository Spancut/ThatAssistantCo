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

## Milestone 2 — Knowledge & Relationships

**Status:** not started

## Milestone 3 — AI Workbench & Outputs

**Status:** not started

## Milestone 4 — Product-Specific Operations

**Status:** not started

## Milestone 5 — Hardening

**Status:** not started
