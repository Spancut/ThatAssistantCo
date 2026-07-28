import { z } from "zod";

const environmentNames = ["local", "test", "preview", "staging", "production"] as const;

const booleanFromString = z.enum(["true", "false"]).transform((value) => value === "true");

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.url().optional());

const rawEnvironmentSchema = z.object({
  APP_ENV: z.enum(environmentNames),
  ENVIRONMENT_ID: z.string().min(1),
  PRODUCTION_ENVIRONMENT_ID: z.literal("thatassistant-production"),
  NEXT_PUBLIC_APP_URL: z.url(),
  SUPABASE_ENABLED: booleanFromString,
  SUPABASE_URL: optionalUrl,
  SUPABASE_DB_URL: optionalUrl,
  SUPABASE_PROJECT_ID: z.string().optional(),
  PRODUCTION_SUPABASE_PROJECT_ID: z.literal("thatassistant-os-production"),
  INNGEST_ENABLED: booleanFromString,
  INNGEST_DEV: booleanFromString,
  INNGEST_BASE_URL: optionalUrl,
});

export type RuntimeEnvironment = z.infer<typeof rawEnvironmentSchema>;

function isLoopback(url: string): boolean {
  return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);
}

function addRequiredIssue(context: z.RefinementCtx, value: unknown, path: string): void {
  if (!value) {
    context.addIssue({
      code: "custom",
      message: `${path} is required when its service is enabled`,
      path: [path],
    });
  }
}

export const environmentSchema = rawEnvironmentSchema.superRefine((environment, context) => {
  const expectedId = `thatassistant-${environment.APP_ENV}`;
  if (environment.ENVIRONMENT_ID !== expectedId) {
    context.addIssue({
      code: "custom",
      message: `ENVIRONMENT_ID must be ${expectedId} for APP_ENV=${environment.APP_ENV}`,
      path: ["ENVIRONMENT_ID"],
    });
  }

  const isProduction = environment.APP_ENV === "production";
  const identifiersMatch = environment.ENVIRONMENT_ID === environment.PRODUCTION_ENVIRONMENT_ID;
  if (isProduction !== identifiersMatch) {
    context.addIssue({
      code: "custom",
      message: isProduction
        ? "production must use the declared production environment identifier"
        : "non-production cannot use the production environment identifier",
      path: ["ENVIRONMENT_ID"],
    });
  }

  if (environment.SUPABASE_ENABLED) {
    addRequiredIssue(context, environment.SUPABASE_URL, "SUPABASE_URL");
    addRequiredIssue(context, environment.SUPABASE_DB_URL, "SUPABASE_DB_URL");
    addRequiredIssue(context, environment.SUPABASE_PROJECT_ID, "SUPABASE_PROJECT_ID");
    const projectMatches =
      environment.SUPABASE_PROJECT_ID === environment.PRODUCTION_SUPABASE_PROJECT_ID;
    if (isProduction !== projectMatches) {
      context.addIssue({
        code: "custom",
        message: isProduction
          ? "production must use the declared production Supabase project"
          : "non-production cannot use the production Supabase project",
        path: ["SUPABASE_PROJECT_ID"],
      });
    }
  }

  if (environment.INNGEST_ENABLED) {
    addRequiredIssue(context, environment.INNGEST_BASE_URL, "INNGEST_BASE_URL");
  }

  const localLike = ["local", "test"].includes(environment.APP_ENV);
  const urls = [
    environment.NEXT_PUBLIC_APP_URL,
    environment.SUPABASE_URL,
    environment.SUPABASE_DB_URL,
    environment.INNGEST_BASE_URL,
  ].filter((url): url is string => Boolean(url));

  if (localLike && urls.some((url) => !isLoopback(url))) {
    context.addIssue({
      code: "custom",
      message: "local and test service URLs must use loopback hosts",
      path: ["APP_ENV"],
    });
  }

  if (!localLike && urls.some((url) => new URL(url).protocol !== "https:")) {
    context.addIssue({
      code: "custom",
      message: "preview, staging, and production service URLs must use HTTPS",
      path: ["APP_ENV"],
    });
  }

  if (environment.INNGEST_DEV !== localLike) {
    context.addIssue({
      code: "custom",
      message: "INNGEST_DEV must be true only for local/test and false elsewhere",
      path: ["INNGEST_DEV"],
    });
  }
});

export class EnvironmentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Environment validation failed:\n- ${issues.join("\n- ")}`);
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

export function parseEnvironment(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
): RuntimeEnvironment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    throw new EnvironmentValidationError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
      ),
    );
  }
  return result.data;
}
