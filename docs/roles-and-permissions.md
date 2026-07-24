# Roles and Permissions

## Membership roles

Defined now (enum `membership_role`), behavior scoped to what the MVP needs:

| Role | Behavior in MVP | Future-reserved behavior |
|---|---|---|
| `owner` | Full control of the workspace: rename, invite (future), delete (future), all data access | — |
| `admin` | Same data access as owner; cannot delete the workspace | — |
| `member` | Read/write on domain data (clients/contacts, workflows, tasks); cannot rename the workspace or manage membership | — |
| `client_reviewer` | Enum exists; **no application behavior in the MVP** | A future external collaborator (e.g. the Partner's client) with read-only or approval-only access to a scoped subset of records |
| `certified_operator` | Enum exists; **no application behavior in the MVP** | A future role for a vetted operator with elevated automation permissions (e.g. permission to approve certain AI actions on the org's behalf) |

The last two roles are in the schema and the permission-checking code path (so adding real behavior later is an additive change, not a migration that touches existing rows) but are not selectable anywhere in the MVP UI and have no granted capabilities beyond default-deny.

## How authorization works

1. **Row Level Security is the enforcement boundary.** Every policy on an org-owned table checks membership via a `SECURITY DEFINER` helper function `is_org_member(org_id, uid)` (and `is_org_admin(...)` where a stricter check is needed). Application code never substitutes for this — even if a server action forgot an authorization check, RLS still blocks the query.
2. **Server Actions re-verify the actor.** Every mutating server action reads the caller's session from Supabase (via `lib/supabase/server.ts`) and does not trust any client-supplied `org_id`/role beyond what RLS will itself enforce.
3. **Proxy is not an authorization boundary.** `proxy.ts` refreshes the Supabase session cookie and redirects obviously-unauthenticated requests away from app routes as a UX convenience, but per Next.js 16 guidance it is not relied on to gate access — Server Functions and RLS are.

## Product-mode access

`product_mode` on `organizations` is not a permission — it's a routing/rendering switch. A user's role is evaluated the same way regardless of mode; what differs is which domain tables and workflows are relevant to that mode's UI.

## What's out of scope for the MVP

- Inviting other users to a workspace (membership rows are created only for the workspace creator in Milestone 1; invite flows are a later addition to this same model, not a schema change)
- Any UI or capability tied to `client_reviewer` or `certified_operator`
