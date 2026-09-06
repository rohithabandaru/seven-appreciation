/**
 * Centralized IP extraction from request headers.
 *
 * Deployment assumptions:
 * - By default (no TRUSTED_PROXY) the app sits behind a reverse proxy / CDN
 *   (Vercel edge, etc.) that APPENDS the connecting peer to X-Forwarded-For.
 *   A client can prepend arbitrary forged entries, so the RIGHTMOST entry is
 *   the only one we can trust. Example: "1.2.3.4 (forged), 198.51.100.9 (real)".
 * - If deployed behind a trusted reverse proxy that sets X-Real-IP from the
 *   upstream TLS peer, set TRUSTED_PROXY=true to prefer that header.
 *
 * For production behind a reverse proxy, set TRUSTED_PROXY=true in .env.
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

/** Returns the first non-empty entry, or 'unknown'. */
function firstNonEmpty(entries: string[]): string {
  for (const entry of entries) {
    if (entry) return entry.trim();
  }
  return 'unknown';
}

export function getClientIp(request: Request): string {
  const trustedProxy = process.env.TRUSTED_PROXY === 'true';

  if (trustedProxy) {
    const realIp = getHeader(request, 'x-real-ip');
    if (realIp) return firstNonEmpty(realIp.split(','));
  }

  const forwarded = getHeader(request, 'x-forwarded-for');
  if (forwarded) {
    const entries = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    if (entries.length > 0) {
      // Rightmost entry is appended by the nearest trusted network hop and
      // reflects the actual peer. Leading entries are client-controllable.
      return entries[entries.length - 1];
    }
  }

  const realIp = getHeader(request, 'x-real-ip');
  if (realIp) return firstNonEmpty(realIp.split(','));

  return 'unknown';
}