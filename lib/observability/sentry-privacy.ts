import type { ErrorEvent, Exception, StackFrame } from "@sentry/nextjs";

import { CORRELATION_HEADER, isValidCorrelationId } from "@/lib/observability/correlation";

const allowedTags = new Set([
  "correlation_id",
  "route",
  "component",
  "error_code",
  "environment_id",
]);

const safeIntentionalMessage = "T003 intentional staging observability test error";

function scrubFrame(frame: StackFrame): StackFrame {
  return {
    filename: frame.filename,
    function: frame.function,
    module: frame.module,
    lineno: frame.lineno,
    colno: frame.colno,
    in_app: frame.in_app,
  };
}

function scrubException(exception: Exception): Exception {
  return {
    type: exception.type,
    value:
      exception.value === safeIntentionalMessage ? safeIntentionalMessage : "Application error",
    stacktrace: exception.stacktrace
      ? { frames: exception.stacktrace.frames?.map(scrubFrame) }
      : undefined,
  };
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const tags: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.tags ?? {})) {
    if (allowedTags.has(key) && typeof value === "string") {
      tags[key] = value;
    }
  }
  const requestCorrelationId = event.request?.headers?.[CORRELATION_HEADER];
  if (typeof requestCorrelationId === "string" && isValidCorrelationId(requestCorrelationId)) {
    tags.correlation_id = requestCorrelationId;
  }

  return {
    event_id: event.event_id,
    type: undefined,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    environment: event.environment,
    release: event.release,
    server_name: undefined,
    logger: "thatassistant",
    message: event.message === safeIntentionalMessage ? safeIntentionalMessage : undefined,
    exception: event.exception
      ? { values: event.exception.values?.map(scrubException) }
      : undefined,
    fingerprint: event.fingerprint,
    tags,
  };
}

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: () => null,
} as const;
