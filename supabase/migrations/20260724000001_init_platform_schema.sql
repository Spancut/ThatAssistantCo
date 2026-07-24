-- Milestone 1: platform foundation schema
-- Tables: profiles, organizations, memberships, audit_events
-- Every table below is RLS-protected; there is no client-facing INSERT path
-- into organizations/memberships except via create_workspace().

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.product_mode as enum ('partner', 'founder');

-- client_reviewer / certified_operator have no application behavior yet
-- (see docs/roles-and-permissions.md) but exist now so future access-control
-- work is additive, not a breaking migration.
create type public.membership_role as enum (
  'owner',
  'admin',
  'member',
  'client_reviewer',
  'certified_operator'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  slug text not null unique,
  product_mode public.product_mode not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.membership_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid not null references auth.users (id),
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_org_id_idx on public.memberships (org_id);
create index audit_events_org_id_idx on public.audit_events (org_id);
create index audit_events_actor_user_id_idx on public.audit_events (actor_user_id);

-- ---------------------------------------------------------------------------
-- Auth trigger: create a profile row for every new auth.users row
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helper functions
--
-- SECURITY DEFINER + owned by the migration role (table owner) so these
-- bypass RLS internally when checking membership, which avoids infinite
-- recursion when a memberships RLS policy itself calls is_org_member().
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(target_org_id uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id and m.user_id = uid
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id
      and m.user_id = uid
      and m.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_org_member(uuid, uuid) to authenticated;
grant execute on function public.is_org_admin(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- create_workspace(): atomic org + owner-membership creation
--
-- Client code never inserts into organizations/memberships directly (no
-- INSERT policy is granted for either table). This function is the only
-- creation path, and it runs both inserts in a single transaction.
-- ---------------------------------------------------------------------------

create or replace function public.create_workspace(
  workspace_name text,
  mode public.product_mode
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
  base_slug text;
  candidate_slug text;
  suffix int := 0;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if btrim(coalesce(workspace_name, '')) = '' then
    raise exception 'workspace name is required';
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(workspace_name), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'workspace';
  end if;

  candidate_slug := base_slug;
  while exists (select 1 from public.organizations where slug = candidate_slug) loop
    suffix := suffix + 1;
    candidate_slug := base_slug || '-' || suffix::text;
  end loop;

  insert into public.organizations (name, slug, product_mode, created_by)
  values (btrim(workspace_name), candidate_slug, mode, auth.uid())
  returning * into new_org;

  insert into public.memberships (org_id, user_id, role)
  values (new_org.id, auth.uid(), 'owner');

  return new_org;
end;
$$;

grant execute on function public.create_workspace(text, public.product_mode) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_events enable row level security;

-- profiles: a user always sees their own row, plus the profile of anyone
-- who shares at least one org with them (needed for the settings members list).
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_co_members" on public.profiles
  for select using (
    exists (
      select 1
      from public.memberships mine
      join public.memberships theirs on theirs.org_id = mine.org_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- organizations: readable by members; renameable by owner/admin.
-- No insert policy: creation only happens via create_workspace().
create policy "organizations_select_member" on public.organizations
  for select using (public.is_org_member(id, auth.uid()));

create policy "organizations_update_admin" on public.organizations
  for update using (public.is_org_admin(id, auth.uid()))
  with check (public.is_org_admin(id, auth.uid()));

-- memberships: readable by co-members.
-- No insert/update/delete policy in M1: membership rows are only created by
-- create_workspace(); invite/remove flows are a later, additive migration.
create policy "memberships_select_member" on public.memberships
  for select using (public.is_org_member(org_id, auth.uid()));

-- audit_events: readable by org members, insertable only as yourself, into
-- an org you belong to. No update/delete policy -> append-only log.
create policy "audit_events_select_member" on public.audit_events
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "audit_events_insert_member" on public.audit_events
  for insert with check (
    actor_user_id = auth.uid() and public.is_org_member(org_id, auth.uid())
  );
