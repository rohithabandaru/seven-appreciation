/**
 * Lightweight, dependency-free production error monitoring.
 *
 * Errors are forwarded to a configurable webhook (Sentry-compatible digest or
 * any generic receiver) only when an environment variable is set:
 *
 *   - Server runtime:  ERROR_MONITORING_WEBHOOK_URL
 *   - Client runtime:  NEXT_PUBLIC_ERROR_MONITORING_WEBHOOK_URL
 *
 * When no endpoint is configured the reporter is a no-op. All payloads are
 * scrubbed for personally identifiable information and secrets before leaving
 * the process. No SDK install is required; the reporter speaks plain JSON.
 */

const REPORT_WEBHOOK_URL: string | undefined =
  typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env.ERROR_MONITORING_WEBHOOK_URL ??
      process.env.NEXT_PUBLIC_ERROR_MONITORING_WEBHOOK_URL
    : undefined;

const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 50;
const MAX_STRING_LENGTH = 2000;

const SENSITIVE_KEY =
  /(password|passwd|secret|token|authorization|auth|cookie|set-cookie|api[_-]?key|apikey|access[_-]?key|refresh[_-]?token|ssn|credit.?card|cvv|phone|email|bearer)/i;

export function isErrorMonitoringEnabled(): boolean {
  return Boolean(REPORT_WEBHOOK_URL);
}

function scrub(key: string, value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (SENSITIVE_KEY.test(key)) return '[REDACTED]';
    if (value.length > MAX_STRING_LENGTH) {
      return `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`;
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item, index) =>
      scrub(String(index), item, depth + 1)
    );
  }

  if (typeof value === 'object') {
    if (depth > MAX_DEPTH) return '[maxDepth]';
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>)) {
      out[k] = scrub(k, (value as Record<string, unknown>)[k], depth + 1);
    }
    return out;
  }

  return String(value);
}

function errorToRecord(error: unknown): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  if (error instanceof Error) {
    record.message = error.message;
    record.name = error.name;
    if (error.stack) record.stack = error.stack;
    const digest = (error as Error & { digest?: string }).digest;
    if (digest) record.digest = digest;
  } else if (typeof error === 'string') {
    record.message = error;
  } else if (error && typeof error === 'object') {
    record.message = 'Non-Error thrown';
    record.data = error;
  } else {
    record.message = String(error);
  }
  return record;
}

export interface ReportPayload {
  error?: unknown;
  path?: string;
  method?: string;
  routeType?: string;
  renderSource?: string;
  revalidateReason?: string;
  extra?: Record<string, unknown>;
}

/** Report a caught error to the configured webhook. Returns after send. */
export async function reportError(payload: ReportPayload): Promise<void> {
  if (!REPORT_WEBHOOK_URL) return;

  const body = scrub('root', {
    timestamp: new Date().toISOString(),
    runtime: typeof window === 'undefined' ? 'server' : 'client',
    ...(payload.error !== undefined
      ? { error: errorToRecord(payload.error) }
      : {}),
    path: payload.path,
    method: payload.method,
    routeType: payload.routeType,
    renderSource: payload.renderSource,
    revalidateReason: payload.revalidateReason,
    extra: payload.extra,
  }, 0);

  try {
    await fetch(REPORT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Reporting must never crash the application.
  }
}

/** Best-effort (fire-and-forget) variant for use inside event handlers. */
export function reportErrorBestEffort(payload: ReportPayload): void {
  reportError(payload).catch(() => {
    /* swallow */
  });
}
