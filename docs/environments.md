# Environment model

T002 defines five explicit environments. Configuration is validated at runtime and by
`pnpm env:check`; no environment is inferred from a branch name or provider default.

| Environment | Identifier | Service endpoints | Inngest mode | Data |
|---|---|---|---|---|
| local | `thatassistant-local` | Loopback only | Development | Fictional/local only |
| test | `thatassistant-test` | Loopback only | Development | Isolated test data |
| preview | `thatassistant-preview` | HTTPS only | Cloud | Fictional/anonymized |
| staging | `thatassistant-staging` | HTTPS only | Cloud | Fictional/anonymized |
| production | `thatassistant-production` | HTTPS only | Cloud | Not provisioned by T002 |

`PRODUCTION_ENVIRONMENT_ID` and `PRODUCTION_SUPABASE_PROJECT_ID` are comparison
guards, not credentials. Non-production validation fails if either active identifier
matches its production counterpart. Local/test validation also fails for any
non-loopback app, database, Supabase, or Inngest URL. Preview/staging/production
validation requires HTTPS and forbids Inngest development mode.

All server configuration is parsed by `lib/env/schema.ts`. Only
`NEXT_PUBLIC_APP_URL` is browser-public. Do not add secrets under a `NEXT_PUBLIC_`
name.

## Required variables

- Core: `APP_ENV`, `ENVIRONMENT_ID`, `PRODUCTION_ENVIRONMENT_ID`,
  `NEXT_PUBLIC_APP_URL`.
- Supabase: `SUPABASE_ENABLED`, and when enabled `SUPABASE_URL`,
  `SUPABASE_DB_URL`, `SUPABASE_PROJECT_ID`; always
  `PRODUCTION_SUPABASE_PROJECT_ID`.
- Inngest: `INNGEST_ENABLED`, `INNGEST_DEV`, and when enabled
  `INNGEST_BASE_URL`.

Missing or inconsistent values fail with field-level messages. Provider signing keys
and hosted credentials are intentionally absent from T002.
