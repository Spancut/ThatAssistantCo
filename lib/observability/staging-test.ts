import { timingSafeEqual } from "node:crypto";

import * as Sentry from "@sentry/nextjs";

import type { RuntimeEnvironment } from "@/lib/env/schema";

export const intentionalTestErrorMessage = "T003 intentional staging observability test error";

export interface StagingTestResult {
  status: 202 | 401 | 404;
  outcome: "accepted" | "denied" | "disabled";
}

function tokenMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const actualBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function runStagingObservabilityTest(
  request: Request,
  environment: RuntimeEnvironment,
  capture: (error: Error, correlationId: string) => Promise<void> = async (
    error,
    correlationId,
  ) => {
    Sentry.captureException(error, {
      tags: {
        correlation_id: correlationId,
        component: "observability-test",
        error_code: "T003_TEST_ERROR",
        environment_id: "thatassistant-staging",
      },
    });
    await Sentry.flush(2_000);
  },
): Promise<StagingTestResult> {
  if (
    environment.APP_ENV !== "staging" ||
    !environment.SENTRY_ENABLED ||
    !environment.OBSERVABILITY_TEST_ENABLED ||
    !environment.OBSERVABILITY_TEST_TOKEN
  ) {
    return { status: 404, outcome: "disabled" };
  }

  if (
    !tokenMatches(
      request.headers.get("x-observability-test-token"),
      environment.OBSERVABILITY_TEST_TOKEN,
    )
  ) {
    return { status: 401, outcome: "denied" };
  }

  await request.text();
  const correlationId = request.headers.get("x-correlation-id") ?? "missing-correlation-id";
  await capture(new Error(intentionalTestErrorMessage), correlationId);
  return { status: 202, outcome: "accepted" };
}
