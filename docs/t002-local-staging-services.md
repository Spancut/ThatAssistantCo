# T002 — Local/staging services

Status: complete with Docker-backed runtime verification blocked

## Initial state

- Started from T001 commit `6552ad55e73268c33210b0d33a2e4532ad399c25`
  on `codex/t002-local-staging-services`.
- T001 draft PR #2 remained open, draft, and unmerged.
- No production credentials, hosted-project metadata, application schema, or real
  client data was present.

## Sources and current guidance

The governing Word T002 section, source hierarchy, architecture, security,
open decisions, T000/T001 records, roadmap, and journal were reviewed. Current
official Supabase and Inngest local-development, CLI, configuration, deployment
environment, Next.js serve-handler, and SDK guidance was checked before selecting
the pinned versions.

## Delivered

- Pinned Supabase CLI 2.109.1, Inngest SDK 4.13.0, Inngest CLI 1.38.1, and Zod
  4.4.3 with lockfile and narrow build-script policy.
- Local Supabase configuration with a fixed local project ID, PostgreSQL 17,
  local-only ports, disabled analytics, no seed, and ignored runtime metadata.
- Inngest Next.js serve route and a safe infrastructure health event/function.
- Runtime-typed environment schema, field-level failure messages, and strict
  local/staging/production identifier and URL guards.
- Production-safe app/database/Supabase/Inngest health response.
- Explicit local commands, combined local launcher, environment model, and staging
  operator instructions.
- Unit coverage for missing variables, identifier isolation, local URL isolation,
  healthy/degraded reporting, and secret/error omission.

## Security and boundaries

- No hosted service was created, linked, migrated, or changed.
- No production credential, signing key, client data, send action, AI call, or
  Release 1 feature was introduced.
- Health responses expose status labels only.
- The local database reset command explicitly passes `--local`.
- Preview and staging must use HTTPS, non-production identifiers, and
  `INNGEST_DEV=false`; local/test must use loopback URLs.

## Workstation blockers

- The Docker Desktop engine/Windows pipe is not running, so Supabase
  start/status/stop and live database/API health cannot be completed on this
  workstation. Remediation: run
  `winget install --exact --id Docker.DockerDesktop`, start Docker Desktop using
  Linux containers, then run the documented commands and verify `/api/health`.
- Vercel CLI is unavailable and GitHub's check surface exposes only the failed
  deployment link, not its logs. The T001 Vercel failure cannot be attributed to
  T002 code from local evidence. Remediation: an authorised Vercel user opens the
  linked deployment log or installs/authenticates the CLI read-only, then records
  the exact build failure. T002 avoids build-time environment parsing, so previews
  can build before provider variables are configured.

## Acceptance criteria

- [x] Missing enabled-service variables fail clearly.
- [x] Local/test reject hosted endpoints and production identifiers.
- [x] Preview/staging reject HTTP endpoints, development Inngest mode, and
  production identifiers.
- [x] Supabase and Inngest local configuration is repository-controlled.
- [x] Staging is documented without unauthorised hosted provisioning.
- [x] No T003, schema, authentication, AI, workflow, or Release 1 work was added.
- [ ] Live Supabase and full service health verification (Docker blocker above).

## Validation

- Frozen pnpm install, governance/credential scan, example environment validation,
  formatting, lint, type checking, unit tests, production build, Chromium, and
  `git diff --check`: passed.
- Unit tests: 8/8 after the staging isolation case was added.
- Build routes: `/`, `/api/health`, and `/api/inngest` plus framework not-found.
- Inngest dev UI: HTTP 200; SDK inspection: HTTP 200, dev mode, one function, no
  event/signing key.
- Health with the app and Inngest live but Docker unavailable: HTTP 503 with app and
  Inngest healthy, database and Supabase degraded. The response contained no URL,
  credential, provider error, or connection detail.
- Supabase `start`, `status`, and scoped `stop`: attempted and blocked consistently
  by the unavailable Docker engine; no hosted fallback was used.

## Next ticket

T003 — CI and observability baseline. It requires separate explicit approval. Work
stops at the T002 boundary.
