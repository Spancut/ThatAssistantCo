# Data Model

Every table below lives in the `public` schema, carries an `org_id` (or is itself `organizations`), and is protected by Row Level Security scoped through `memberships`. Status column shows what's actually implemented in migrations today.

## Milestone 1 — implemented

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | 1:1 extension of `auth.users` | `id` (= `auth.users.id`), `full_name`, `avatar_url`, `created_at` |
| `organizations` | A workspace; the tenant boundary | `id`, `name`, `slug`, `product_mode` (`partner`\|`founder`), `created_by`, `created_at` |
| `memberships` | Who belongs to which org, with what role | `org_id`, `user_id`, `role` (`owner`\|`admin`\|`member`\|`client_reviewer`\|`certified_operator`), `created_at`; unique (`org_id`,`user_id`) |
| `audit_events` | Immutable log of consequential actions | `id`, `org_id`, `actor_user_id`, `action`, `target_type`, `target_id`, `metadata` (jsonb), `created_at` |

Workspace creation is atomic via the `create_workspace(name, product_mode)` `SECURITY DEFINER` function (inserts `organizations` + owner `membership` in one transaction) — see `supabase/migrations/`.

## Milestone 1.5 — implemented (Entitlements, Usage & Notifications Foundation)

Built ahead of Milestone 3 so every AI call site is required to check entitlements from day one. See [ai-orchestration.md](ai-orchestration.md) and [security-and-approval-policy.md](security-and-approval-policy.md).

| Table | Purpose | Key columns |
|---|---|---|
| `subscriptions` | One row per workspace: plan + status | `org_id` (unique), `plan` (`trial`\|`starter`\|`pro`), `status` (`active`\|`past_due`\|`canceled`), `stripe_customer_id`, `stripe_subscription_id`, `created_at`, `updated_at` |
| `entitlements` | Per-workspace, per-feature limits | `org_id`, `feature_key`, `limit_value` (null = unlimited); unique (`org_id`, `feature_key`) |
| `usage_events` | Append-only usage log, summed against `entitlements.limit_value` for the current calendar month (UTC) | `org_id`, `feature_key`, `amount`, `created_by`, `created_at` |
| `notifications` | Per-user, per-workspace notifications | `org_id`, `user_id`, `type`, `payload` (jsonb), `read_at`, `created_at` |

`create_workspace()` also provisions a trial `subscriptions` row and a generous default `entitlements` set (`ai_generations_per_month: 200`, `max_clients`/`max_contacts: unlimited`) atomically. `create_notification(org_id, user_id, type, payload)` is a `SECURITY DEFINER` function and the only write path into `notifications` — see [decisions.md](decisions.md). [lib/server/entitlements.ts](../lib/server/entitlements.ts) (`checkEntitlement`, `recordUsage`) is the only supported way to read/write entitlement state; no workflow or route queries these tables directly.

## Milestone 2 — implemented (Knowledge & Relationships)

| Table | Purpose | Product | Key columns |
|---|---|---|---|
| `client_profiles` | A Partner's client | Partner | `org_id`, `name`, `brand_voice`, `preferences` (jsonb), `key_facts` (jsonb), `archived_at`, `created_by`, timestamps |
| `contacts` | A Founder's lead/customer/contact | Founder | `org_id`, `name`, `company`, `email`, `phone`, `pipeline_stage`, `source`, `notes`, `created_by`, timestamps |
| `knowledge_base_items` | Freeform knowledge, linked to at most one client OR one contact (never both — `knowledge_base_items_single_link` check constraint) | Both | `org_id`, `title`, `content`, `tags` (text[]), `linked_client_profile_id`, `linked_contact_id`, `created_by`, timestamps |

`preferences`/`key_facts` are jsonb but edited in the MVP as a single freeform `{ notes: string }` shape — simple textareas, not structured forms. This keeps the schema forward-compatible with richer structured editing later without a migration. RLS on all three matches every other workspace-scoped table (member-required); unlike `organizations`/`memberships`, ordinary members can insert/update rows directly — there's no `create_workspace()`-style RPC gate, since these are ordinary CRUD entities, not tenant-boundary objects. `client_profiles` uses a soft `archived_at` rather than hard delete; `knowledge_base_items` supports a real delete.

Not built in Milestone 2 (deferred, not part of the shared platform's minimum): `documents` (file metadata / Storage), `notes`/`tasks` as separate tables (contacts already has an inline `notes` field; client_profiles' "recurring responsibilities" live in `preferences` for now), a distinct `knowledge_records` table (folded into `knowledge_base_items`).

## Milestone 3 — planned (AI Workbench & Outputs)

Entitlement enforcement for this milestone uses the already-implemented `usage_events`/`entitlements` tables (Milestone 1.5) via `checkEntitlement`/`recordUsage` — no separate `usage_records` table is needed.

| Table | Purpose |
|---|---|
| `workflows` | Registry of available AI workflows per product mode (e.g. `partner.draft_client_email`, `founder.enquiry_response`) |
| `workflow_runs` | One invocation of a workflow: inputs, assembled context, prompt version, model, usage, status |
| `generated_outputs` | The structured, Zod-validated result of a run: assumptions, missing information, confidence, review checklist, approval state, and per-run model/token usage metadata |

## Milestone 4 — planned (Product Operations)

| Table | Purpose | Product |
|---|---|---|
| `delivery_tasks` | Tasks-by-client with due dates, status, and output attachment | Partner |
| `human_value_entries` | Records of human judgment/correction applied on top of an AI draft, for the Weekly Client Value Report | Partner |
| `follow_ups` | Overdue/upcoming follow-up tracking derived from `contacts` | Founder |

## Milestone 5 — planned (Hardening)

Plan-derived entitlements (`subscriptions`/`entitlements`) were built early, in Milestone 1.5 — see above. Milestone 5 adds:

| Table | Purpose |
|---|---|
| `data_export_requests`, `data_deletion_requests` | Auditable record of workspace export/delete flows |

## Enums

- `product_mode`: `partner`, `founder`
- `membership_role`: `owner`, `admin`, `member`, `client_reviewer`, `certified_operator` — only `owner`/`admin`/`member` have defined behavior in the MVP; the other two exist now so the permission model doesn't need a breaking migration later (see [roles-and-permissions.md](roles-and-permissions.md))
- `approval_status` (M3+): `draft`, `pending_review`, `approved`, `rejected`, `revised`

## Isolation guarantee

No table in this model is ever queried without an RLS policy scoping it to `org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())` (or a narrower policy for owner/admin-only actions). Verified live for every table implemented so far — Milestone 1 (`organizations`, `memberships`, `audit_events`), Milestone 1.5 (`subscriptions`, `entitlements`, `usage_events`, `notifications`), and Milestone 2 (`client_profiles`, `contacts`, `knowledge_base_items`) — by creating workspaces under different users and confirming neither reads, writes, updates, or deletes the other's rows. See docs/build-plan.md for the specific checks run per milestone.
