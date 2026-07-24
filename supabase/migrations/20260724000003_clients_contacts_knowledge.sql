-- Milestone 2 (Knowledge & Relationships): the entities both products are
-- actually organized around. Data model + RLS only — no AI generation
-- (Milestone 3), no member-invite, no billing changes.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.pipeline_stage as enum (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'customer',
  'dormant'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Partner: a client the org does ongoing work for.
create table public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  brand_voice text,
  preferences jsonb not null default '{}'::jsonb,
  key_facts jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Founder: a lead/customer/contact moving through a pipeline.
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  company text,
  email text,
  phone text,
  pipeline_stage public.pipeline_stage not null default 'new',
  source text,
  notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared: freeform knowledge, optionally linked to one client OR one
-- contact (never both — a knowledge item belongs to at most one relationship).
create table public.knowledge_base_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0),
  content text not null default '',
  tags text[] not null default '{}',
  linked_client_profile_id uuid references public.client_profiles (id) on delete set null,
  linked_contact_id uuid references public.contacts (id) on delete set null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_base_items_single_link check (
    not (linked_client_profile_id is not null and linked_contact_id is not null)
  )
);

create index client_profiles_org_id_idx on public.client_profiles (org_id);
create index contacts_org_id_idx on public.contacts (org_id);
create index contacts_org_id_pipeline_stage_idx on public.contacts (org_id, pipeline_stage);
create index knowledge_base_items_org_id_idx on public.knowledge_base_items (org_id);
create index knowledge_base_items_linked_client_idx on public.knowledge_base_items (linked_client_profile_id);
create index knowledge_base_items_linked_contact_idx on public.knowledge_base_items (linked_contact_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
--
-- Also retrofitted onto subscriptions/entitlements (Milestone 1.5), which
-- had updated_at columns but no trigger to actually maintain them — a
-- latent gap that didn't matter yet because nothing updated those rows,
-- but would have the moment it did.
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.client_profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.knowledge_base_items
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.entitlements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Same membership-required pattern as every other workspace-scoped table.
-- Unlike organizations/memberships (creation locked behind an RPC), these
-- are ordinary CRUD tables: any member can insert/update rows in their own
-- workspace, attributed to themselves. client_profiles/contacts use soft
-- state changes (archived_at / pipeline_stage) rather than hard delete;
-- knowledge_base_items supports a real delete (removing a note).
-- ---------------------------------------------------------------------------

alter table public.client_profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.knowledge_base_items enable row level security;

create policy "client_profiles_select_member" on public.client_profiles
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "client_profiles_insert_member" on public.client_profiles
  for insert with check (
    created_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

create policy "client_profiles_update_member" on public.client_profiles
  for update using (public.is_org_member(org_id, auth.uid()))
  with check (public.is_org_member(org_id, auth.uid()));

create policy "contacts_select_member" on public.contacts
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "contacts_insert_member" on public.contacts
  for insert with check (
    created_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

create policy "contacts_update_member" on public.contacts
  for update using (public.is_org_member(org_id, auth.uid()))
  with check (public.is_org_member(org_id, auth.uid()));

create policy "knowledge_base_items_select_member" on public.knowledge_base_items
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "knowledge_base_items_insert_member" on public.knowledge_base_items
  for insert with check (
    created_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

create policy "knowledge_base_items_update_member" on public.knowledge_base_items
  for update using (public.is_org_member(org_id, auth.uid()))
  with check (public.is_org_member(org_id, auth.uid()));

create policy "knowledge_base_items_delete_member" on public.knowledge_base_items
  for delete using (public.is_org_member(org_id, auth.uid()));
