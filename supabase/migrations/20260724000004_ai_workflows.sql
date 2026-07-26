-- Milestone 3 (AI Workbench & Outputs): the first workflow that calls a
-- real model. One workflow_template, one orchestration path
-- (lib/server/ai/orchestrator.ts) shared by both products; only context
-- assembly and UI copy differ per product_mode. No send/publish
-- integration, no multi-step/agentic workflows, no second template — get
-- this one pattern right first.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.workflow_product_mode as enum ('partner', 'founder', 'both');
create type public.workflow_run_status as enum ('pending', 'completed', 'failed');
create type public.output_status as enum ('draft', 'approved', 'edited_and_approved', 'rejected');
-- Distinct from output_status: an output starts life as 'draft' with no
-- approval row at all; an approvals row is only ever created at the moment
-- a human acts, already carrying its final status (never sits at 'pending'
-- in practice today, but the value exists for a future "assign a reviewer"
-- flow that doesn't create the row eagerly).
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'edited_and_approved');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Registry of available AI workflows. Not org-scoped — shared platform
-- config, seeded by migration below, not by scripts/seed.ts.
create table public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  product_mode public.workflow_product_mode not null,
  input_schema jsonb not null default '{}'::jsonb,
  prompt_version text not null,
  output_schema_key text not null,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_template_id uuid not null references public.workflow_templates (id),
  org_id uuid not null references public.organizations (id) on delete cascade,
  initiated_by uuid not null references auth.users (id),
  -- Exactly what was assembled and sent to the model (user prompt + the
  -- product-specific context object) — the debugging record for "why did
  -- it say that."
  input_snapshot jsonb not null default '{}'::jsonb,
  status public.workflow_run_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.outputs (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid not null references public.workflow_runs (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  output_type text not null,
  -- The current, human-readable draft — starts as the model's body text,
  -- overwritten with the reviewer's edit if they change it before approving.
  draft_content text not null,
  -- The full structured model response (subject, body, tone_notes,
  -- context_sources_used, confidence_flag) as originally generated —
  -- preserved even after an edit, so "what did the model actually say" is
  -- never lost.
  structured_content jsonb not null,
  status public.output_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- No org_id column (not in the source spec for this table) — scoped via
-- outputs.org_id through a join in RLS below instead of a denormalized copy.
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  output_id uuid not null references public.outputs (id) on delete cascade,
  approver_id uuid not null references auth.users (id),
  status public.approval_status not null,
  edited_content text,
  approved_at timestamptz not null default now()
);

-- Partner-only. Free-text tags a human attaches on approval, distinguishing
-- what the AI drafted from what a person actually added/judged/caught.
create table public.human_value_entries (
  id uuid primary key default gen_random_uuid(),
  output_id uuid not null references public.outputs (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid not null references auth.users (id),
  context_added text,
  judgment_applied text,
  preference_considered text,
  risk_identified text,
  recommendation_made text,
  corrections_made text,
  created_at timestamptz not null default now()
);

create index workflow_runs_org_id_idx on public.workflow_runs (org_id);
create index workflow_runs_workflow_template_id_idx on public.workflow_runs (workflow_template_id);
create index outputs_org_id_idx on public.outputs (org_id);
create index outputs_workflow_run_id_idx on public.outputs (workflow_run_id);
create index approvals_output_id_idx on public.approvals (output_id);
create index human_value_entries_output_id_idx on public.human_value_entries (output_id);
create index human_value_entries_org_id_idx on public.human_value_entries (org_id);

-- No set_updated_at triggers here: none of these tables have an updated_at
-- column. workflow_runs/outputs are mutated via explicit status-transition
-- updates (their own timestamped history lives in workflow_runs.created_at,
-- approvals.approved_at); workflow_templates is immutable platform config
-- once seeded.

-- ---------------------------------------------------------------------------
-- Seed the single workflow template. Platform config, not user data — lives
-- in the migration (like the enums above), not scripts/seed.ts.
-- ---------------------------------------------------------------------------

insert into public.workflow_templates (key, product_mode, input_schema, prompt_version, output_schema_key, requires_approval)
values (
  'draft_email',
  'both',
  jsonb_build_object(
    'userPrompt', 'string — what the email needs to say or respond to',
    'sourceType', 'client | contact',
    'sourceId', 'uuid — client_profiles.id or contacts.id'
  ),
  'draft-email-v1',
  'draft_email_output',
  true
)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.workflow_templates enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.outputs enable row level security;
alter table public.approvals enable row level security;
alter table public.human_value_entries enable row level security;

-- workflow_templates: readable by any authenticated user (shared registry,
-- no tenant data). No client-facing write policy — only this migration
-- (as the table owner) inserts rows.
create policy "workflow_templates_select_authenticated" on public.workflow_templates
  for select using (auth.uid() is not null);

create policy "workflow_runs_select_member" on public.workflow_runs
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "workflow_runs_insert_member" on public.workflow_runs
  for insert with check (
    initiated_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

-- Only the orchestrator flips pending -> completed/failed on its own run;
-- no content field is ever client-editable here.
create policy "workflow_runs_update_member" on public.workflow_runs
  for update using (public.is_org_member(org_id, auth.uid()))
  with check (public.is_org_member(org_id, auth.uid()));

create policy "outputs_select_member" on public.outputs
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "outputs_insert_member" on public.outputs
  for insert with check (public.is_org_member(org_id, auth.uid()));

create policy "outputs_update_member" on public.outputs
  for update using (public.is_org_member(org_id, auth.uid()))
  with check (public.is_org_member(org_id, auth.uid()));

-- approvals: no org_id column, so membership is checked by joining back to
-- the parent output's org_id.
create policy "approvals_select_member" on public.approvals
  for select using (
    exists (
      select 1 from public.outputs o
      where o.id = approvals.output_id and public.is_org_member(o.org_id, auth.uid())
    )
  );

create policy "approvals_insert_member" on public.approvals
  for insert with check (
    approver_id = auth.uid()
    and exists (
      select 1 from public.outputs o
      where o.id = approvals.output_id and public.is_org_member(o.org_id, auth.uid())
    )
  );

create policy "human_value_entries_select_member" on public.human_value_entries
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "human_value_entries_insert_member" on public.human_value_entries
  for insert with check (
    created_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );
