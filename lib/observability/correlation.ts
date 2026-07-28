export const CORRELATION_HEADER = "x-correlation-id";

const validCorrelationId =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidCorrelationId(value: string | null | undefined): value is string {
  return Boolean(value && validCorrelationId.test(value));
}

export function resolveCorrelationId(value: string | null | undefined): string {
  return isValidCorrelationId(value) ? value : crypto.randomUUID();
}
