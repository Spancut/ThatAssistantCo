import { NextResponse } from "next/server";

import { parseEnvironment } from "@/lib/env/schema";
import { buildHealthReport } from "@/lib/health/checks";
import { CORRELATION_HEADER } from "@/lib/observability/correlation";
import { writeSafeLog } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = performance.now();
  const correlationId = request.headers.get(CORRELATION_HEADER) ?? undefined;
  try {
    const report = await buildHealthReport(parseEnvironment(process.env));
    writeSafeLog("info", "health.completed", {
      correlationId,
      route: "/api/health",
      status: report.status === "healthy" ? 200 : 503,
      durationMs: performance.now() - startedAt,
      outcome: report.status,
    });
    return NextResponse.json(report, {
      status: report.status === "healthy" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    writeSafeLog("warn", "health.configuration_invalid", {
      correlationId,
      route: "/api/health",
      status: 503,
      durationMs: performance.now() - startedAt,
      outcome: "degraded",
    });
    return NextResponse.json(
      {
        status: "degraded",
        environment: "invalid",
        services: { app: "healthy", configuration: "degraded" },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
