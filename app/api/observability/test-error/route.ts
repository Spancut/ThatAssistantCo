import { NextResponse } from "next/server";

import { parseEnvironment } from "@/lib/env/schema";
import { CORRELATION_HEADER } from "@/lib/observability/correlation";
import { writeSafeLog } from "@/lib/observability/logger";
import { runStagingObservabilityTest } from "@/lib/observability/staging-test";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const result = await runStagingObservabilityTest(request, parseEnvironment(process.env));
    writeSafeLog(result.status === 202 ? "info" : "warn", "observability.test", {
      correlationId: request.headers.get(CORRELATION_HEADER) ?? undefined,
      route: "/api/observability/test-error",
      status: result.status,
      component: "observability",
      outcome: result.outcome,
    });
    return NextResponse.json(
      { outcome: result.outcome },
      {
        status: result.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    writeSafeLog("error", "observability.test_unavailable", {
      correlationId: request.headers.get(CORRELATION_HEADER) ?? undefined,
      route: "/api/observability/test-error",
      status: 503,
      component: "observability",
      outcome: "unavailable",
    });
    return NextResponse.json(
      { outcome: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
