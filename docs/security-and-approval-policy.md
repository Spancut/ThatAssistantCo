# Security and Approval Policy

## Row Level Security

Every organisation-owned table has RLS enabled with no exceptions. There is no table that relies solely on application-layer `WHERE org_id = ...` filtering — RLS is enforced at the database regardless of what the application code does. Policies are keyed off `memberships` via `SECURITY DEFINER` helper functions (`is_org_member`, `is_org_admin`) so policy logic isn't duplicated across every table's policy definitions. Cross-org isolation is part of the verification checklist for every milestone that touches the schema.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are server-only environment variables. They are read only inside `lib/server/` and route handlers/server actions — never inside a file reachable from a `"use client"` component.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the only credentials that reach the browser, by design (the anon key is safe to expose; RLS is what actually protects data).
- No secret is ever committed. `.env.local` is gitignored; `.env.example` documents required variables with placeholder values only.

## Approval boundary

Every externally consequential action requires an explicit human approval step before it happens. In the MVP, this is enforced by *not building the external action at all* — see below. Starting in Milestone 3, AI-generated outputs carry a status (`draft` → `pending_review` → `approved`/`rejected`/`revised`), and every status transition writes an `audit_events` row (actor, action, target, timestamp).

## MVP hard constraints — no automatic external actions

The MVP never, under any workflow or user action, automatically:

- sends an email
- publishes content
- changes a calendar
- contacts a customer or client
- issues a quote
- makes a commitment
- deletes external information
- modifies an external system

AI workflows only ever produce a stored, reviewable draft (see [ai-orchestration.md](ai-orchestration.md)). Where the product brief describes something that sounds like an external action (e.g. "send weekly client update"), the MVP implementation stops at "drafted and ready for the human to send through their own tool" — this is a durable product boundary, not a temporary MVP shortcut, and any future change to it is a deliberate, separately-reviewed decision.

## Audit events

`lib/server/audit.ts` exposes `recordAuditEvent({ orgId, actorUserId, action, targetType, targetId, metadata })`, used by every consequential server action (workspace creation, org rename today; approval/rejection/revision and future external-facing actions as they're built). Audit events are insert-only from the application's perspective — no update/delete path is exposed.

## Input handling

All external input (form submissions, server action arguments, AI model responses) is validated with Zod at the boundary before it touches the database or is rendered. No `any`-typed pass-through of user input.

## Rate limiting, size limits, file-type restrictions

Formalized in Milestone 5 (Hardening) once there are endpoints that need them (AI workflow runs, file uploads). Not required for Milestone 1, which has no unauthenticated or high-volume endpoints beyond standard Supabase Auth flows (which have their own built-in rate limiting).
