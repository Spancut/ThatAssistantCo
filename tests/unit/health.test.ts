import { describe, expect, it, vi } from "vitest";

import { parseEnvironment } from "@/lib/env/schema";
import { buildHealthReport } from "@/lib/health/checks";

const environment = parseEnvironment({
  APP_ENV: "local",
  ENVIRONMENT_ID: "thatassistant-local",
  PRODUCTION_ENVIRONMENT_ID: "thatassistant-production",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  SUPABASE_ENABLED: "true",
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  SUPABASE_PROJECT_ID: "thatassistant-os-local",
  PRODUCTION_SUPABASE_PROJECT_ID: "thatassistant-os-production",
  INNGEST_ENABLED: "true",
  INNGEST_DEV: "true",
  INNGEST_BASE_URL: "http://127.0.0.1:8288",
  SENTRY_ENABLED: "false",
  SENTRY_DSN: "",
  NEXT_PUBLIC_SENTRY_DSN: "",
  OBSERVABILITY_TEST_ENABLED: "false",
  OBSERVABILITY_TEST_TOKEN: "",
});

describe("health report", () => {
  it("reports service readiness without exposing connection details", async () => {
    const report = await buildHealthReport(environment, {
      fetch: vi.fn().mockResolvedValue({ ok: true }),
      checkTcp: vi.fn().mockResolvedValue(true),
    });
    expect(report.status).toBe("healthy");
    expect(JSON.stringify(report)).not.toContain("54322");
    expect(JSON.stringify(report)).not.toContain("postgres");
  });

  it("degrades safely when a dependency is unavailable", async () => {
    const report = await buildHealthReport(environment, {
      fetch: vi.fn().mockRejectedValue(new Error("sensitive detail")),
      checkTcp: vi.fn().mockResolvedValue(false),
    });
    expect(report.status).toBe("degraded");
    expect(JSON.stringify(report)).not.toContain("sensitive detail");
  });
});
