import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it, vi } from "vitest";

import { parseEnvironment } from "@/lib/env/schema";
import { CORRELATION_HEADER, resolveCorrelationId } from "@/lib/observability/correlation";
import { createSafeLogRecord } from "@/lib/observability/logger";
import { scrubSentryEvent } from "@/lib/observability/sentry-privacy";
import {
  intentionalTestErrorMessage,
  runStagingObservabilityTest,
} from "@/lib/observability/staging-test";

const rawFixtureContent = "FICTIONAL_RAW_REQUEST_CONTENT_DO_NOT_TRANSMIT customer@example.invalid";
const correlationId = "019fa1a0-ff99-7173-98dd-051907bb2024";

const stagingEnvironmentSource = {
  APP_ENV: "staging",
  ENVIRONMENT_ID: "thatassistant-staging",
  PRODUCTION_ENVIRONMENT_ID: "thatassistant-production",
  NEXT_PUBLIC_APP_URL: "https://staging.example.invalid",
  SUPABASE_ENABLED: "false",
  SUPABASE_URL: "",
  SUPABASE_DB_URL: "",
  SUPABASE_PROJECT_ID: "",
  PRODUCTION_SUPABASE_PROJECT_ID: "thatassistant-os-production",
  INNGEST_ENABLED: "false",
  INNGEST_DEV: "false",
  INNGEST_BASE_URL: "",
  SENTRY_ENABLED: "true",
  SENTRY_DSN: "https://public@example.invalid/1",
  NEXT_PUBLIC_SENTRY_DSN: "",
  OBSERVABILITY_TEST_ENABLED: "true",
  OBSERVABILITY_TEST_TOKEN: "fictional-observability-token-000000",
};

const stagingEnvironment = parseEnvironment(stagingEnvironmentSource);

describe("observability privacy baseline", () => {
  it("preserves valid correlation IDs and replaces unsafe input", () => {
    expect(resolveCorrelationId(correlationId)).toBe(correlationId);
    expect(resolveCorrelationId(rawFixtureContent)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("allows only operational fields in structured logs", () => {
    const record = createSafeLogRecord(
      "info",
      "request.completed",
      {
        correlationId,
        route: "/api/health",
        status: 200,
        outcome: rawFixtureContent,
      },
      new Date("2026-07-28T00:00:00.000Z"),
    );
    expect(record.outcome).toBeUndefined();
    expect(JSON.stringify(record)).not.toContain(rawFixtureContent);
  });

  it("removes raw request, user, breadcrumb, context, and extra content", () => {
    const event = {
      type: undefined,
      message: rawFixtureContent,
      request: {
        data: rawFixtureContent,
        headers: {
          authorization: rawFixtureContent,
          [CORRELATION_HEADER]: correlationId,
        },
      },
      user: { email: rawFixtureContent },
      breadcrumbs: [{ message: rawFixtureContent }],
      contexts: { fixture: { content: rawFixtureContent } },
      extra: { body: rawFixtureContent },
      tags: {
        correlation_id: correlationId,
        unsafe: rawFixtureContent,
      },
      exception: {
        values: [
          {
            type: "Error",
            value: rawFixtureContent,
            stacktrace: {
              frames: [
                {
                  filename: "route.ts",
                  function: "POST",
                  context_line: rawFixtureContent,
                  vars: { body: rawFixtureContent },
                },
              ],
            },
          },
        ],
      },
    } satisfies ErrorEvent;

    const scrubbed = scrubSentryEvent(event);
    expect(JSON.stringify(scrubbed)).not.toContain(rawFixtureContent);
    expect(scrubbed.tags?.correlation_id).toBe(correlationId);
  });

  it("captures the intentional staging error without passing request content", async () => {
    const capture = vi.fn().mockResolvedValue(undefined);
    const request = new Request("https://staging.example.invalid/api/test", {
      method: "POST",
      headers: {
        [CORRELATION_HEADER]: correlationId,
        "x-observability-test-token": "fictional-observability-token-000000",
      },
      body: rawFixtureContent,
    });

    const result = await runStagingObservabilityTest(request, stagingEnvironment, capture);

    expect(result).toEqual({ status: 202, outcome: "accepted" });
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({ message: intentionalTestErrorMessage }),
      correlationId,
    );
    expect(JSON.stringify(capture.mock.calls)).not.toContain(rawFixtureContent);
  });

  it("hides the staging test when observability is disabled", async () => {
    const capture = vi.fn();
    const disabledEnvironment = parseEnvironment({
      ...stagingEnvironmentSource,
      SENTRY_ENABLED: "false",
      SENTRY_DSN: "",
      OBSERVABILITY_TEST_ENABLED: "false",
      OBSERVABILITY_TEST_TOKEN: "",
    });
    const result = await runStagingObservabilityTest(
      new Request("https://staging.example.invalid"),
      disabledEnvironment,
      capture,
    );
    expect(result).toEqual({ status: 404, outcome: "disabled" });
    expect(capture).not.toHaveBeenCalled();
  });
});
