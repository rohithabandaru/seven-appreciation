import { reportError } from '@/lib/error-monitor';

/**
 * Server-side error capture for App Router render/route/action/proxy errors.
 * Forwards scrubbed errors to the configured webhook (see @/lib/error-monitor).
 * Request headers (cookie/authorization/set-cookie) are redacted by the
 * scrubbing reporter before leaving the process.
 */
export const onRequestError = async (
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[]>;
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
    revalidateReason: string | undefined;
    renderType: string;
  }
): Promise<void> => {
  await reportError({
    error,
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
    extra: { headers: request.headers },
  });
};
