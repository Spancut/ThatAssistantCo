# Staging setup

T002 documents staging but does not create hosted resources. A separate, explicitly
authorised operator must provision a non-production Supabase project and Inngest
environment before staging can be activated.

## Isolation requirements

1. Create dedicated staging projects; never link this checkout to production.
2. Use `APP_ENV=staging`, `ENVIRONMENT_ID=thatassistant-staging`, and a distinct
   staging `SUPABASE_PROJECT_ID`.
3. Keep `PRODUCTION_ENVIRONMENT_ID=thatassistant-production` and the production
   Supabase project identifier available only as non-secret comparison guards.
4. Store URLs and any future provider credentials in encrypted staging environment
   settings, never Git or `.env.example`.
5. Use only fictional or anonymized staging data. Do not clone production data.
6. Set `INNGEST_DEV=false`; bind only the staging app's `/api/inngest` endpoint.
7. Run `pnpm env:check` in the staging build/start process before serving traffic.
8. Verify `/api/health` without publishing its response beyond authorised
   operational access.

## Required provider work

- Provision/select the dedicated Supabase staging project and record its non-secret
  project ID.
- Provision/select the dedicated Inngest staging environment.
- Add the staging app and database URLs plus provider credentials through encrypted
  provider controls.
- Run migrations only in their future authorised schema ticket. T002 contains no
  application migration and performs no remote database mutation.

Preview should use its own `thatassistant-preview` environment identity. If preview
shares staging service resources, that exception requires an ADR and explicit
approval; it is not authorised by T002.
