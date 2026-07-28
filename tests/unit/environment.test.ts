import { describe, expect, it } from "vitest";

import { EnvironmentValidationError, parseEnvironment } from "@/lib/env/schema";

const localEnvironment = {
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
};

describe("environment validation", () => {
  it("accepts the isolated local environment", () => {
    expect(parseEnvironment(localEnvironment).APP_ENV).toBe("local");
  });

  it("reports missing enabled service variables clearly", () => {
    expect(() => parseEnvironment({ ...localEnvironment, SUPABASE_URL: undefined })).toThrow(
      EnvironmentValidationError,
    );
  });

  it("rejects a production project identifier outside production", () => {
    expect(() =>
      parseEnvironment({
        ...localEnvironment,
        SUPABASE_PROJECT_ID: "thatassistant-os-production",
      }),
    ).toThrow(/non-production cannot use the production Supabase project/);
  });

  it("rejects hosted URLs in local mode", () => {
    expect(() =>
      parseEnvironment({
        ...localEnvironment,
        INNGEST_BASE_URL: "https://example.invalid",
      }),
    ).toThrow(/loopback/);
  });

  it("accepts isolated HTTPS staging and rejects its production project", () => {
    const staging = {
      ...localEnvironment,
      APP_ENV: "staging",
      ENVIRONMENT_ID: "thatassistant-staging",
      NEXT_PUBLIC_APP_URL: "https://staging.example.invalid",
      SUPABASE_URL: "https://staging-supabase.example.invalid",
      SUPABASE_DB_URL: "https://staging-database.example.invalid",
      SUPABASE_PROJECT_ID: "thatassistant-os-staging",
      INNGEST_DEV: "false",
      INNGEST_BASE_URL: "https://staging-inngest.example.invalid",
    };
    expect(parseEnvironment(staging).APP_ENV).toBe("staging");
    expect(() =>
      parseEnvironment({
        ...staging,
        SUPABASE_PROJECT_ID: "thatassistant-os-production",
      }),
    ).toThrow(/non-production cannot use the production Supabase project/);
  });
});
