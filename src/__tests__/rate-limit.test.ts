import {
  checkRateLimit,
  getHitCount,
  RATE_LIMIT_POLICIES,
  rateLimitResponse,
  checkPayloadSize,
} from '@/lib/rate-limit';

// In-memory store so the DB-backed rate limiter is testable without a database.
const store = new Map<string, { key: string; windowStart: Date; hits: number; updatedAt: Date }>();
const storeKey = (key: string, windowStart: Date) => `${key}:${windowStart.toISOString()}`;

jest.mock('@/lib/prisma', () => ({
  prisma: {
    rateLimit: {
      upsert: jest.fn(({ where, update, create }: any) => {
        const k = storeKey(where.key_windowStart.key, where.key_windowStart.windowStart);
        const existing = store.get(k);
        if (existing) {
          existing.hits += update?.hits?.increment ?? 1;
          existing.updatedAt = new Date();
          return Promise.resolve(existing);
        }
        const record = { key: create.key, windowStart: create.windowStart, hits: create.hits ?? 1, updatedAt: new Date() };
        store.set(k, record);
        return Promise.resolve(record);
      }),
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(store.get(storeKey(where.key_windowStart.key, where.key_windowStart.windowStart)) ?? null)
      ),
      deleteMany: jest.fn(({ where }: any = {}) => {
        const cutoff = where?.updatedAt?.lt;
        for (const k of [...store.keys()]) {
          const rec = store.get(k)!;
          if (where?.key && !k.startsWith(`${where.key}:`)) continue;
          if (cutoff && rec.updatedAt >= cutoff) continue;
          store.delete(k);
        }
        return Promise.resolve({ count: 0 });
      }),
    },
  },
}));

describe('Rate Limiter', () => {
  // Use unique keys to avoid cross-test contamination
  let keyCounter = 0;
  function uniqueKey(prefix: string): string {
    keyCounter++;
    return `${prefix}:test-${keyCounter}-${Date.now()}`;
  }

  function loginPolicy(): { windowMs: number; maxRequests: number } {
    return RATE_LIMIT_POLICIES.login;
  }

  describe('checkRateLimit', () => {
    it('allows first request', async () => {
      const key = uniqueKey('unit');
      const policy = { windowMs: 60000, maxRequests: 5 };
      const result = await checkRateLimit(key, policy);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.totalHits).toBe(1);
    });

    it('allows requests under the limit', async () => {
      const key = uniqueKey('unit');
      const policy = { windowMs: 60000, maxRequests: 3 };
      await checkRateLimit(key, policy);
      await checkRateLimit(key, policy);
      const result = await checkRateLimit(key, policy);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('blocks requests at the limit', async () => {
      const key = uniqueKey('unit');
      const policy = { windowMs: 60000, maxRequests: 2 };
      await checkRateLimit(key, policy);
      await checkRateLimit(key, policy);
      const blocked = await checkRateLimit(key, policy);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    });

    it('isolates different keys', async () => {
      const policy = { windowMs: 60000, maxRequests: 1 };
      const keyA = uniqueKey('unit-a');
      const keyB = uniqueKey('unit-b');
      await checkRateLimit(keyA, policy);
      const blockedA = await checkRateLimit(keyA, policy);
      expect(blockedA.allowed).toBe(false);
      const allowedB = await checkRateLimit(keyB, policy);
      expect(allowedB.allowed).toBe(true);
    });

    it('isolates different rate limit types for same user', async () => {
      const loginPolicy = { windowMs: 60000, maxRequests: 1 };
      const postPolicy = { windowMs: 60000, maxRequests: 5 };
      const userId = uniqueKey('user');
      await checkRateLimit(`login:${userId}`, loginPolicy);
      const blockedLogin = await checkRateLimit(`login:${userId}`, loginPolicy);
      expect(blockedLogin.allowed).toBe(false);
      const allowedPost = await checkRateLimit(`post:${userId}`, postPolicy);
      expect(allowedPost.allowed).toBe(true);
    });

    it('decrements remaining correctly', async () => {
      const key = uniqueKey('unit');
      const policy = { windowMs: 60000, maxRequests: 5 };
      expect((await checkRateLimit(key, policy)).remaining).toBe(4);
      expect((await checkRateLimit(key, policy)).remaining).toBe(3);
      expect((await checkRateLimit(key, policy)).remaining).toBe(2);
      expect((await checkRateLimit(key, policy)).remaining).toBe(1);
      expect((await checkRateLimit(key, policy)).remaining).toBe(0);
      expect((await checkRateLimit(key, policy)).allowed).toBe(false);
    });
  });

  describe('getHitCount', () => {
    it('returns 0 for unknown key', async () => {
      const key = uniqueKey('hitcount');
      const policy = { windowMs: 60000, maxRequests: 5 };
      expect(await getHitCount(key, policy)).toBe(0);
    });

    it('returns correct count after requests', async () => {
      const key = uniqueKey('hitcount');
      const policy = { windowMs: 60000, maxRequests: 5 };
      await checkRateLimit(key, policy);
      await checkRateLimit(key, policy);
      expect(await getHitCount(key, policy)).toBe(2);
    });
  });

  describe('Rate Limit Policies', () => {
    it('has login policy with 5 attempts per 15 min', () => {
      expect(loginPolicy().maxRequests).toBe(5);
      expect(loginPolicy().windowMs).toBe(15 * 60 * 1000);
    });

    it('has register policy with 3 per hour', () => {
      expect(RATE_LIMIT_POLICIES.register.maxRequests).toBe(3);
      expect(RATE_LIMIT_POLICIES.register.windowMs).toBe(60 * 60 * 1000);
    });

    it('has appreciation policy with 10 per hour', () => {
      expect(RATE_LIMIT_POLICIES.appreciation.maxRequests).toBe(10);
    });

    it('has post policy with 5 per 15 min', () => {
      expect(RATE_LIMIT_POLICIES.post.maxRequests).toBe(5);
    });

    it('has upload rate limit configured', () => {
      // Upload rate limit is defined inline in the route, but verify the concept
      expect(RATE_LIMIT_POLICIES.photo.maxRequests).toBe(10);
    });

    it('has admin policy with generous limit', () => {
      expect(RATE_LIMIT_POLICIES.admin.maxRequests).toBe(100);
    });

    it('all policies have positive window and max', () => {
      for (const [, policy] of Object.entries(RATE_LIMIT_POLICIES)) {
        expect(policy.windowMs).toBeGreaterThan(0);
        expect(policy.maxRequests).toBeGreaterThan(0);
      }
    });
  });

  describe('rateLimitResponse', () => {
    it('returns 429 status', () => {
      const response = rateLimitResponse(5000);
      expect(response.status).toBe(429);
    });

    it('includes Retry-After header', () => {
      const response = rateLimitResponse(5000);
      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(Number(retryAfter)).toBeGreaterThan(0);
    });

    it('rounds up Retry-After to seconds', () => {
      const response = rateLimitResponse(1500);
      const retryAfter = Number(response.headers.get('Retry-After'));
      expect(retryAfter).toBe(2);
    });
  });

  describe('checkPayloadSize', () => {
    it('allows small payloads', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { 'content-length': '1000' },
      });
      const result = await checkPayloadSize(req);
      expect(result).toBeNull();
    });

    it('rejects oversized payloads', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { 'content-length': String(512 * 1024 + 1) },
      });
      const result = await checkPayloadSize(req);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(413);
    });

    it('allows payloads at exact 512KB boundary', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { 'content-length': String(512 * 1024) },
      });
      const result = await checkPayloadSize(req);
      expect(result).toBeNull();
    });

    it('allows requests without content-length', async () => {
      const req = new Request('http://localhost', { method: 'POST' });
      const result = await checkPayloadSize(req);
      expect(result).toBeNull();
    });
  });

  describe('Abuse Scenarios', () => {
    it('blocks brute-force login after 5 attempts', async () => {
      const policy = RATE_LIMIT_POLICIES.login;
      const ip = uniqueKey('brute-ip');
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await checkRateLimit(`login:${ip}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(5);
    });

    it('blocks registration spam after 3 per hour', async () => {
      const policy = RATE_LIMIT_POLICIES.register;
      const ip = uniqueKey('spam-ip');
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await checkRateLimit(`register:${ip}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(3);
    });

    it('blocks appreciation spam after 10 per hour', async () => {
      const policy = RATE_LIMIT_POLICIES.appreciation;
      const userId = uniqueKey('spam-user');
      const results = [];
      for (let i = 0; i < 15; i++) {
        results.push(await checkRateLimit(`appreciation:${userId}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(10);
    });

    it('blocks post flooding after 5 per 15 min', async () => {
      const policy = RATE_LIMIT_POLICIES.post;
      const userId = uniqueKey('flood-user');
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await checkRateLimit(`post:${userId}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(5);
    });

    it('blocks comment flooding after 10 per 15 min', async () => {
      const policy = RATE_LIMIT_POLICIES.comment;
      const userId = uniqueKey('comment-user');
      const results = [];
      for (let i = 0; i < 15; i++) {
        results.push(await checkRateLimit(`comment:${userId}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(10);
    });

    it('blocks letter spam after 5 per hour', async () => {
      const policy = RATE_LIMIT_POLICIES.letter;
      const userId = uniqueKey('letter-user');
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await checkRateLimit(`letter:${userId}`, policy));
      }
      const allowed = results.filter((r) => r.allowed).length;
      expect(allowed).toBe(5);
    });
  });
});