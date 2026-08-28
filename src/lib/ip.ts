/**
 * Centralized IP extraction from request headers.
 *
 * Deployment: single-server (next start), no trusted reverse proxy by default.
 * If deployed behind a trusted CDN/proxy that sets X-Real-IP, prioritize that.
 *
 * For production behind a reverse proxy, set TRUSTED_PROXY=true in .env
 * to prefer X-Real-IP over X-Forwarded-For (which can be spoofed).
 */

function getHeader(request: Request, name: string): string | null {
  const headers: unknown = (request as { headers?: unknown }).headers;
  if (!headers) return null;
  // Web Headers instance (API route handlers)
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name);
  }
  // Plain object / Node-style headers (NextAuth credentials authorize callback)
  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name] ?? record[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function getClientIp(request: Request): string {
  const trustedProxy = process.env.TRUSTED_PROXY === 'true';

  if (trustedProxy) {
    const realIp = getHeader(request, 'x-real-ip');
    if (realIp) return realIp.split(',')[0].trim();
  }

  const forwarded = getHeader(request, 'x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = getHeader(request, 'x-real-ip');
  if (realIp) return realIp.split(',')[0].trim();

  return 'unknown';
}
