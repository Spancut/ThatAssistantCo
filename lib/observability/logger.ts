type LogLevel = "info" | "warn" | "error";

export interface SafeLogFields {
  correlationId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  component?: string;
  outcome?: string;
}

export interface SafeLogRecord {
  timestamp: string;
  level: LogLevel;
  event: string;
  correlation_id?: string;
  route?: string;
  status?: number;
  duration_ms?: number;
  component?: string;
  outcome?: string;
}

const safeEventName = /^[a-z0-9][a-z0-9._-]{2,79}$/;
const safeLabel = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/;

function safeLabelOrUndefined(value: string | undefined): string | undefined {
  return value && safeLabel.test(value) ? value : undefined;
}

export function createSafeLogRecord(
  level: LogLevel,
  event: string,
  fields: SafeLogFields = {},
  now = new Date(),
): SafeLogRecord {
  if (!safeEventName.test(event)) {
    throw new Error("Log event names must use the approved machine-safe format");
  }

  return {
    timestamp: now.toISOString(),
    level,
    event,
    correlation_id: safeLabelOrUndefined(fields.correlationId),
    route: safeLabelOrUndefined(fields.route),
    status:
      Number.isInteger(fields.status) && fields.status! >= 100 && fields.status! <= 599
        ? fields.status
        : undefined,
    duration_ms:
      typeof fields.durationMs === "number" && fields.durationMs >= 0
        ? Math.round(fields.durationMs)
        : undefined,
    component: safeLabelOrUndefined(fields.component),
    outcome: safeLabelOrUndefined(fields.outcome),
  };
}

export function writeSafeLog(level: LogLevel, event: string, fields: SafeLogFields = {}): void {
  const line = JSON.stringify(createSafeLogRecord(level, event, fields));
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  writer(line);
}
