import { EnvironmentValidationError, parseEnvironment } from "../lib/env/schema.ts";

try {
  const environment = parseEnvironment(process.env);
  console.log(`Environment valid: ${environment.APP_ENV} (${environment.ENVIRONMENT_ID})`);
} catch (error) {
  if (error instanceof EnvironmentValidationError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
