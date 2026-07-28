# T003 — CI and observability baseline

Status: implementation complete; external staging acceptance pending

## Authorised requirements

The governing Word document requires:

- CI checks;
- Sentry with content redaction;
- correlation IDs;
- privacy-safe logging.

Acceptance requires an intentional test error to appear in staging while raw
fictional request content does not.

## Initial state

- Started from T002 commit `31207fe15c47a523b89674e1fb312f00fca075f6`.
- T002 draft PR #3 remained open, draft, and unmerged.
- Docker-backed Supabase verification remained a closed machine-level blocker and
  was not investigated.
- No Sentry DSN, auth token, organisation, project, or public DSN was present.

## Delivered

- Least-privilege GitHub Actions CI with immutable action SHAs, frozen install,
  governance, environment, formatting, lint, type, unit, build, and Chromium gates.
- Pinned Sentry Next.js SDK with server, edge, client, and Next.js instrumentation.
- Deterministic Sentry event minimisation and fixed safe staging test error.
- UUID correlation propagation through request and response headers.
- Allowlisted structured logging used by health and observability routes.
- Staging-only, token-gated intentional-error endpoint.
- Infrastructure-independent tests using fictional content and deterministic mocks.
- Operator documentation for configuration, test evidence, teardown, and failure
  handling.

## Security boundary

- No request body, headers, cookies, user information, arbitrary extras,
  breadcrumbs, trace/replay payload, stack variables, or source context is allowed
  into Sentry.
- No real client data or credential is present in tests or documentation.
- No hosted Supabase/Sentry resource, environment setting, deployment, migration, or
  production/staging service was changed.
- CI has only `contents: read`; no deployment or secret-writing permission.
- CI uses `.env.example`, safe degraded service behavior, and no local/hosted
  Supabase runtime.

## External acceptance blocker

The staging Sentry acceptance cannot be executed without an authorised Sentry
project/DSN and staging environment access. The exact test and teardown procedure is
in `docs/observability.md`. T003 must not be marked fully accepted until the safe
event is observed and the fictional raw-content sentinel is confirmed absent.

## Local validation

- Frozen pnpm install: passed.
- Governance/credential scan and example environment validation: passed.
- Formatting, ESLint, and strict TypeScript: passed.
- Unit tests: 13/13 passed, including deterministic raw-content absence.
- Production build: passed with the health, Inngest, and disabled-by-default
  observability routes plus the correlation proxy.
- Local HTTP verification: correlation headers were returned; health used the
  existing safe degraded mode; the intentional-error endpoint returned 404 while
  disabled and did not contact Sentry.
- Chromium placeholder baseline: passed, 1/1.
- `git diff --check`: passed.
- Docker/Supabase runtime commands were not run, per the explicit T003 instruction.

## Acceptance criteria

- [x] Required CI gates are defined without Supabase runtime dependency.
- [x] Sentry integration removes raw request content deterministically.
- [x] Correlation IDs are generated and propagated safely.
- [x] Application logs accept operational fields only.
- [x] Intentional error route is staging-only, disabled by default, and token-gated.
- [x] Deterministic tests prove the raw fixture sentinel is not sent to the capture
  boundary.
- [ ] Intentional error appears in the authorised staging Sentry project and raw
  fixture content is absent (external credentials/access required).

## Stop boundary

No T010, authentication, schema, RLS, AI, workflow, product analytics, or Release 1
feature work is included. The next ticket remains T010 only after T003 staging
acceptance and explicit authorisation.
