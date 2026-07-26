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

## Milestone 3 — implemented (AI Workbench & Outputs)

Entitlement enforcement uses the already-implemented `usage_events`/`entitlements` tables (Milestone 1.5) via `checkEntitlement`/`recordUsage` — no separate `usage_records` table. One workflow_template, one orchestration path ([lib/ai/orchestrator.ts](../lib/ai/orchestrator.ts)), shared by both products.

| Table | Purpose | Key columns |
|---|---|---|
| `workflow_templates` | Registry of available AI workflows — global, **not** org-scoped | `key` (unique, e.g. `draft_email`), `product_mode` (`partner`\|`founder`\|`both`), `input_schema` (jsonb), `prompt_version`, `output_schema_key`, `requires_approval`, `created_at` |
| `workflow_runs` | One invocation: what was assembled and sent to the model, for debugging a bad output against its actual context | `workflow_template_id`, `org_id`, `initiated_by`, `input_snapshot` (jsonb — user prompt + full `AssembledContext`), `status` (`pending`\|`completed`\|`failed`), `created_at` |
| `outputs` | The structured, Zod-validated result of a run | `workflow_run_id`, `org_id`, `output_type`, `draft_content` (text — current human-readable draft, overwritten if edited), `structured_content` (jsonb — `{subject, body, tone_notes, context_sources_used, confidence_flag}`, kept in sync with edits), `status` (`draft`\|`approved`\|`edited_and_approved`\|`rejected`), `created_at` |
| `approvals` | One row per human review action — created only when a human actually acts, not eagerly at generation time | `output_id`, `approver_id`, `status` (`pending`\|`approved`\|`rejected`\|`edited_and_approved`), `edited_content` (nullable), `approved_at`. **No `org_id` column** (not in the source spec) — RLS scopes via a join to `outputs.org_id` instead of a direct membership check. |
| `human_value_entries` | Partner-only: free-text tags a human attaches on approval, distinguishing what they added from what the AI drafted | `output_id`, `org_id`, `created_by`, `context_added`, `judgment_applied`, `preference_considered`, `risk_identified`, `recommendation_made`, `corrections_made` (all optional text), `created_at` |

`workflow_templates` is seeded by the migration itself (one row, `key = "draft_email"`), not by `scripts/seed.ts` — it's platform config, not per-workspace demo data. `outputs.structured_content` is *not* immutable: approving with an edited subject/body overwrites it (and `draft_content`) with the final text, while `approvals.edited_content` keeps an audit trail of what changed. See [ai-orchestration.md](ai-orchestration.md) and [decisions.md](decisions.md).

**Not built** (deliberately, not deferred by accident): a `workflows` table keyed by dotted `product.workflow` names (collapsed into `workflow_templates.key` + `product_mode` instead); `assumptions`/`missing_information`/`review_checklist` as separate columns (folded into the single `structured_content` jsonb blob, since this workflow's actual output contract — set by this milestone's spec — is `{subject, body, tone_notes, context_sources_used, confidence_flag}`, narrower than `ai-orchestration.md`'s original general design); a drafts-history/"AI Workbench" list view (an output is only reachable via the direct link produced right after generating it).

## Milestone 4 — planned (Product Operations)

| Table | Purpose | Product |
|---|---|---|
| `delivery_tasks` | Tasks-by-client with due dates, status, and output attachment | Partner |
| `follow_ups` | Overdue/upcoming follow-up tracking derived from `contacts` | Founder |

## Milestone 5 — planned (Hardening)

Plan-derived entitlements (`subscriptions`/`entitlements`) were built early, in Milestone 1.5 — see above. Milestone 5 adds:

| Table | Purpose |
|---|---|
| `data_export_requests`, `data_deletion_requests` | Auditable record of workspace export/delete flows |

## Enums

- `product_mode`: `partner`, `founder`
- `membership_role`: `owner`, `admin`, `member`, `client_reviewer`, `certified_operator` — only `owner`/`admin`/`member` have defined behavior in the MVP; the other two exist now so the permission model doesn't need a breaking migration later (see [roles-and-permissions.md](roles-and-permissions.md))
- `workflow_product_mode`: `partner`, `founder`, `both` (distinct from `product_mode` — a workspace's mode vs. which mode(s) a workflow_template applies to)
- `workflow_run_status`: `pending`, `completed`, `failed`
- `output_status`: `draft`, `approved`, `edited_and_approved`, `rejected`
- `approval_status`: `pending`, `approved`, `rejected`, `edited_and_approved` — a distinct enum from `output_status` on the `approvals` table itself; in practice every `approvals` row is created already carrying its final status (see Milestone 3 above)

## Isolation guarantee

No table in this model is ever queried without an RLS policy scoping it to `org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())` (or a narrower policy for owner/admin-only actions, or — `approvals` only — a join to its parent `outputs.org_id`). Verified live for every table implemented so far — Milestone 1 (`organizations`, `memberships`, `audit_events`), Milestone 1.5 (`subscriptions`, `entitlements`, `usage_events`, `notifications`), Milestone 2 (`client_profiles`, `contacts`, `knowledge_base_items`), and Milestone 3 (`workflow_runs`, `outputs`, `approvals`, `human_value_entries`, plus confirming `workflow_templates` is readable by any authenticated user since it carries no tenant data) — by creating workspaces under different users and confirming neither reads, writes, updates, or deletes the other's rows. See docs/build-plan.md for the specific checks run per milestone.
