import { connect } from "node:net";

import type { RuntimeEnvironment } from "@/lib/env/schema";

export type ServiceHealth = "healthy" | "degraded" | "disabled";

export interface HealthDependencies {
  fetch: typeof fetch;
  checkTcp: (url: string) => Promise<boolean>;
}

export interface HealthReport {
  status: "healthy" | "degraded";
  environment: string;
  services: {
    app: ServiceHealth;
    database: ServiceHealth;
    supabase: ServiceHealth;
    inngest: ServiceHealth;
  };
}

export async function checkTcp(url: string): Promise<boolean> {
  const target = new URL(url);
  const port = Number(target.port || "5432");
  return new Promise((resolve) => {
    const socket = connect({ host: target.hostname, port });
    const finish = (value: boolean) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(1_500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function checkHttp(url: string, fetchImplementation: typeof fetch): Promise<boolean> {
  try {
    const response = await fetchImplementation(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(1_500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function buildHealthReport(
  environment: RuntimeEnvironment,
  dependencies: HealthDependencies = { fetch, checkTcp },
): Promise<HealthReport> {
  const database = environment.SUPABASE_ENABLED
    ? await dependencies.checkTcp(environment.SUPABASE_DB_URL!)
    : undefined;
  const supabase = environment.SUPABASE_ENABLED
    ? await checkHttp(
        `${environment.SUPABASE_URL!.replace(/\/$/, "")}/auth/v1/health`,
        dependencies.fetch,
      )
    : undefined;
  const inngest = environment.INNGEST_ENABLED
    ? await checkHttp(environment.INNGEST_BASE_URL!, dependencies.fetch)
    : undefined;

  const services: HealthReport["services"] = {
    app: "healthy",
    database: database === undefined ? "disabled" : database ? "healthy" : "degraded",
    supabase: supabase === undefined ? "disabled" : supabase ? "healthy" : "degraded",
    inngest: inngest === undefined ? "disabled" : inngest ? "healthy" : "degraded",
  };

  return {
    status: Object.values(services).includes("degraded") ? "degraded" : "healthy",
    environment: environment.APP_ENV,
    services,
  };
}
