# Observability baseline

T003 establishes error monitoring, correlation IDs, and privacy-safe operational
logging. It does not introduce product analytics, user tracking, session replay,
request-content logging, or hosted-service provisioning.

## Correlation IDs

`proxy.ts` assigns a UUID correlation ID to every application request and response
through `x-correlation-id`. A caller-provided value is accepted only when it is a
valid UUID; all other input is replaced. The identifier may be used in safe logs and
Sentry tags, but must never encode a user, tenant, client, email address, request
summary, or other business content.

## Safe logs

Application logs are one-line JSON records with an explicit event name and a narrow
allowlist:

- timestamp and severity;
- correlation ID;
- route template;
- HTTP status and duration;
- component and machine-safe outcome.

The logger does not accept arbitrary objects, messages, request bodies, headers,
query strings, user fields, tenant/client names, provider payloads, or errors.
Rejected label values are omitted. New fields require a privacy review and focused
tests.

## Sentry event boundary

Sentry is disabled unless `SENTRY_ENABLED=true` and a server DSN exists. The client
SDK is disabled unless `NEXT_PUBLIC_SENTRY_DSN` exists. The DSN identifies an ingest
endpoint and may be browser-public; auth tokens and provider administration
credentials must never be public.

Before an error event leaves the process:

- request data, headers, cookies, query strings, user data, breadcrumbs, contexts,
  arbitrary extras, server names, and logger-provided messages are removed;
- stack local variables and source-code context lines are removed;
- exception messages become `Application error`, except for the fixed T003
  staging-test title;
- only correlation, route, component, safe error code, and environment identifier
  tags are retained;
- tracing and replay sampling are disabled.

Provider-side default and advanced scrubbing remain a recommended defense in depth,
but application redaction is deterministic and tested without relying on provider
configuration.

## Staging acceptance test

An authorised staging operator must:

1. Configure encrypted staging settings:
   `SENTRY_ENABLED=true`, `SENTRY_DSN`, optional `NEXT_PUBLIC_SENTRY_DSN`,
   `OBSERVABILITY_TEST_ENABLED=true`, and a random
   `OBSERVABILITY_TEST_TOKEN` of at least 32 characters.
2. Keep `APP_ENV=staging` and all T002 non-production isolation guards valid.
3. Deploy the T003 branch to the existing staging application.
4. Submit one request:

   ```powershell
   $headers = @{
     "x-observability-test-token" = $env:OBSERVABILITY_TEST_TOKEN
     "content-type" = "text/plain"
   }
   Invoke-WebRequest `
     -Method Post `
     -Uri "https://STAGING_HOST/api/observability/test-error" `
     -Headers $headers `
     -Body "FICTIONAL_RAW_REQUEST_CONTENT_DO_NOT_TRANSMIT customer@example.invalid"
   ```

5. Confirm Sentry contains `T003 intentional staging observability test error` and
   the event does not contain `FICTIONAL_RAW_REQUEST_CONTENT_DO_NOT_TRANSMIT` or the
   fictional address anywhere.
6. Set `OBSERVABILITY_TEST_ENABLED=false`, remove the test token, and redeploy after
   evidence is captured.

The route returns 404 outside staging or when disabled, 401 for a bad token, 202
after capture/flush, and never returns Sentry or request details.

## Incident-safe operation

If redaction is uncertain, disable Sentry rather than broadening event content. Do
not paste provider events into tickets or chat; record only event ID, safe title,
environment, timestamp, and correlation ID.
