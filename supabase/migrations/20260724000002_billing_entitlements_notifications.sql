-- Billing/entitlements/notifications foundation.
-- Schema + server-side plumbing only: no Stripe checkout, no webhooks, no
-- upgrade/downgrade flow, no email delivery. The goal is to have the
-- structural pattern (checkEntitlement/recordUsage) in place before
-- Milestone 3 adds AI generation, so every AI call site is required to
-- check entitlements from day one.
--
-- Naming note: the product spec calls this column "workspace_id" in
-- places; every other table in this schema (memberships, audit_events)
-- uses "org_id" against organizations.id, so these new tables follow that
-- existing convention instead of introducing a second name for the same
-- concept. The public TypeScript helpers still use "workspaceId" as the
-- parameter name. See docs/decisions.md.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.subscription_plan as enum ('trial', 'starter', 'pro');
create type public.subscription_status as enum ('active', 'past_due', 'canceled');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations (id) on delete cascade,
  plan public.subscription_plan not null default 'trial',
  status public.subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  feature_key text not null,
  -- null = unlimited
  limit_value integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, feature_key)
);

-- Append-only. Summed against entitlements.limit_value for the current
-- period (calendar month, UTC — see lib/server/entitlements.ts) to compute
-- what's left.
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  feature_key text not null,
  amount integer not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index entitlements_org_id_idx on public.entitlements (org_id);
create index usage_events_org_id_feature_key_idx on public.usage_events (org_id, feature_key);
create index usage_events_created_at_idx on public.usage_events (created_at);
create index notifications_org_id_user_id_idx on public.notifications (org_id, user_id);
create index notifications_unread_idx on public.notifications (org_id, user_id) where read_at is null;

-- ---------------------------------------------------------------------------
-- create_notification(): the only path that creates a notification for a
-- workspace member. SECURITY DEFINER because the caller (the user whose
-- action triggered the notification) is very often not the recipient, and
-- there is deliberately no client-facing INSERT policy on notifications —
-- only the recipient can SELECT/UPDATE their own rows.
-- ---------------------------------------------------------------------------

create or replace function public.create_notification(
  target_org_id uuid,
  target_user_id uuid,
  notification_type text,
  notification_payload jsonb default '{}'::jsonb
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  new_notification public.notifications;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if not public.is_org_member(target_org_id, auth.uid()) then
    raise exception 'not a member of this workspace';
  end if;

  if not public.is_org_member(target_org_id, target_user_id) then
    raise exception 'recipient is not a member of this workspace';
  end if;

  if btrim(coalesce(notification_type, '')) = '' then
    raise exception 'notification type is required';
  end if;

  insert into public.notifications (org_id, user_id, type, payload)
  values (target_org_id, target_user_id, notification_type, coalesce(notification_payload, '{}'::jsonb))
  returning * into new_notification;

  return new_notification;
end;
$$;

grant execute on function public.create_notification(uuid, uuid, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Extend create_workspace() to also provision a trial subscription and a
-- generous default entitlement set, atomically with the org + membership.
-- Signature is unchanged, so this is CREATE OR REPLACE, not a new function.
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

  insert into public.subscriptions (org_id, plan, status)
  values (new_org.id, 'trial', 'active');

  -- Permissive by design: nothing here should block Milestone 3
  -- development. The check pattern is real; the limits are generous.
  insert into public.entitlements (org_id, feature_key, limit_value)
  values
    (new_org.id, 'ai_generations_per_month', 200),
    (new_org.id, 'max_clients', null),
    (new_org.id, 'max_contacts', null);

  return new_org;
end;
$$;

-- ---------------------------------------------------------------------------
-- Backfill: any organization created before this migration (e.g. seeded
-- demo workspaces) gets the same default subscription + entitlements.
-- ---------------------------------------------------------------------------

insert into public.subscriptions (org_id, plan, status)
select o.id, 'trial', 'active'
from public.organizations o
where not exists (select 1 from public.subscriptions s where s.org_id = o.id);

insert into public.entitlements (org_id, feature_key, limit_value)
select o.id, f.feature_key, f.limit_value
from public.organizations o
cross join (
  values
    ('ai_generations_per_month', 200),
    ('max_clients', null),
    ('max_contacts', null)
) as f (feature_key, limit_value)
where not exists (
  select 1 from public.entitlements e
  where e.org_id = o.id and e.feature_key = f.feature_key
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.usage_events enable row level security;
alter table public.notifications enable row level security;

-- subscriptions / entitlements: readable by members. No client-facing
-- insert/update policy — these are only written by create_workspace() and,
-- in a later milestone, Stripe webhook handling (service role).
create policy "subscriptions_select_member" on public.subscriptions
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "entitlements_select_member" on public.entitlements
  for select using (public.is_org_member(org_id, auth.uid()));

-- usage_events: readable by members, insertable only as yourself into an
-- org you belong to. No update/delete policy -> append-only, like audit_events.
create policy "usage_events_select_member" on public.usage_events
  for select using (public.is_org_member(org_id, auth.uid()));

create policy "usage_events_insert_member" on public.usage_events
  for insert with check (
    created_by = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

-- notifications: a user only ever sees/updates their own rows, and only
-- within a workspace they're a member of. No insert policy — creation only
-- happens via create_notification().
create policy "notifications_select_own" on public.notifications
  for select using (
    user_id = auth.uid() and public.is_org_member(org_id, auth.uid())
  );

create policy "notifications_update_own" on public.notifications
  for update using (
    user_id = auth.uid() and public.is_org_member(org_id, auth.uid())
  )
  with check (
    user_id = auth.uid() and public.is_org_member(org_id, auth.uid())
  );
