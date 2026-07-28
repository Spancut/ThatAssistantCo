import * as Sentry from "@sentry/nextjs";

import { sentryPrivacyOptions } from "@/lib/observability/sentry-privacy";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.SENTRY_ENABLED === "true" && Boolean(process.env.SENTRY_DSN),
  environment: process.env.APP_ENV,
  ...sentryPrivacyOptions,
});
