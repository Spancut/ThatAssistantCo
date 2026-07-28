import { NextResponse } from "next/server";

import { parseEnvironment } from "@/lib/env/schema";
import { buildHealthReport } from "@/lib/health/checks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await buildHealthReport(parseEnvironment(process.env));
    return NextResponse.json(report, {
      status: report.status === "healthy" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
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
