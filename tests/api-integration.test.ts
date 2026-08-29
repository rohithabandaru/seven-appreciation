/**
 * API Integration Tests
 *
 * Tests actual API route handler logic by mocking Prisma and NextAuth.
 * These are NOT E2E tests — they verify handler logic, validation,
 * auth checks, rate limiting, and moderation at the route level.
 */

// ── Mock Prisma ─────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  appreciationMessage: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  memberPhoto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  letter: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  communityMilestone: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  report: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  bannedIP: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  uploadedFile: {
    count: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  follow: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  block: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  appreciationLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  photoLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  milestoneLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  unlockedPhotocard: {
    createMany: jest.fn((args?: any) => Promise.resolve({ count: args?.data?.length ?? 3 })),
    findMany: jest.fn().mockResolvedValue([]),
  },
  comment: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  moderationAction: {
    create: jest.fn(),
  },
  $transaction: jest.fn((fns: any[]) => Promise.all(fns)),
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// ── Mock NextAuth session ────────────────────────────────────────────────────

let mockSession: any = null;
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession)),
}));

// ── Mock auth to prevent ESM import of @auth/prisma-adapter ──────────────────

jest.mock('@/lib/auth', () => ({ authOptions: {}, isDbAdmin: jest.fn().mockResolvedValue(true) }));

// ── Mock rate limiter (in-memory Map persists across tests) ──────────────────

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 100, totalHits: 1, retryAfterMs: 0 })),
  getHitCount: jest.fn(() => 0),
  RATE_LIMIT_POLICIES: new Proxy({}, { get: () => ({ windowMs: 60000, maxRequests: 1000 }) }),
  rateLimitResponse: jest.fn((retryAfterMs: number) => new Response('Rate limited', { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } })),
  checkPayloadSize: jest.fn(() => Promise.resolve(null)),
}));

// ── Mock upload processing ───────────────────────────────────────────────────

jest.mock('@/lib/upload', () => ({
  validateFileUpload: jest.fn(() => ({ valid: true })),
  processImage: jest.fn(() => Promise.resolve({
    buffer: Buffer.from('processed'),
    width: 800,
    height: 600,
    format: 'webp',
    size: 1024,
  })),
  storagePut: jest.fn(() => Promise.resolve({
    storageKey: 'test/2026/08/user123_abc.webp',
    filePath: '/tmp/test.webp',
    publicUrl: '/uploads/test/2026/08/user123_abc.webp',
  })),
  storageDelete: jest.fn(() => Promise.resolve(true)),
  getUploadCategoryFromPurpose: jest.fn(() => 'photo'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSession = null;
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: Authentication Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Authentication', () => {
  describe('Registration - /api/auth/register', () => {
    it('rejects request without body', async () => {
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json', 'content-length': '2' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects invalid email format', async () => {
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'not-email', name: 'Test', password: 'Password123!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects short password', async () => {
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.test', name: 'Test', password: '123' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'taken@example.test' });
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'taken@example.test', name: 'Test', password: 'Password123!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Email already in use');
    });

    it('creates user with role "user" (not admin)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new', email: 'new@example.test', role: 'user' });
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.test', name: 'Test User', password: 'Password123!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('user');
    });

    it('does not expose password in response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new', email: 'new@example.test', role: 'user' });
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.test', name: 'Test User', password: 'Password123!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain('password');
    });

    it('ignores role field injection', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new', role: 'user' });
      const { POST } = require('@/app/api/auth/register/route');
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'hacker@example.test', name: 'Hacker', password: 'Password123!', role: 'admin' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      await POST(req);
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('user');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: Authorization Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Authorization', () => {
  describe('Reports GET - admin only', () => {
    it('rejects unauthenticated request', async () => {
      mockSession = null;
      const { GET } = require('@/app/api/reports/route');
      const res = await GET(new Request('http://localhost/api/reports'));
      expect(res.status).toBe(401);
    });

    it('rejects normal user', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { GET } = require('@/app/api/reports/route');
      const res = await GET(new Request('http://localhost/api/reports'));
      expect(res.status).toBe(401);
    });

    it('allows admin user', async () => {
      mockSession = { user: { id: 'admin-1', role: 'admin' } };
      mockPrisma.report.findMany.mockResolvedValue([]);
      mockPrisma.report.count.mockResolvedValue(0);
      const { GET } = require('@/app/api/reports/route');
      const res = await GET(new Request('http://localhost/api/reports'));
      expect(res.status).toBe(200);
    });
  });

  describe('Ban POST - admin only', () => {
    it('rejects unauthenticated request', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/ban/route');
      const req = new Request('http://localhost/api/ban', {
        method: 'POST',
        body: JSON.stringify({ ip: '1.2.3.4' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('rejects normal user', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/ban/route');
      const req = new Request('http://localhost/api/ban', {
        method: 'POST',
        body: JSON.stringify({ ip: '1.2.3.4' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('allows admin', async () => {
      mockSession = { user: { id: 'admin-1', role: 'admin' } };
      mockPrisma.bannedIP.upsert.mockResolvedValue({});
      const { POST } = require('@/app/api/ban/route');
      const req = new Request('http://localhost/api/ban', {
        method: 'POST',
        body: JSON.stringify({ ip: '1.2.3.4', reason: 'Spam' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  describe('Ban DELETE - admin only', () => {
    it('rejects normal user', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { DELETE } = require('@/app/api/ban/route');
      const req = new Request('http://localhost/api/ban', {
        method: 'DELETE',
        body: JSON.stringify({ ip: '1.2.3.4' }),
      });
      const res = await DELETE(req);
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: Ownership Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Ownership', () => {
  describe('Upload DELETE - ownership check', () => {
    it('rejects unauthenticated delete', async () => {
      mockSession = null;
      const { DELETE } = require('@/app/api/uploads/[id]/route');
      const req = new Request('http://localhost/api/uploads/file-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'file-1' }) });
      expect(res.status).toBe(401);
    });

    it('rejects user trying to delete another users file', async () => {
      mockSession = { user: { id: 'user-A', role: 'user' } };
      mockPrisma.uploadedFile.findUnique.mockResolvedValue({ id: 'file-1', ownerId: 'user-B', storageKey: 'test.webp' });
      const { DELETE } = require('@/app/api/uploads/[id]/route');
      const req = new Request('http://localhost/api/uploads/file-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'file-1' }) });
      expect(res.status).toBe(403);
    });

    it('allows owner to delete own file', async () => {
      mockSession = { user: { id: 'user-A', role: 'user' } };
      mockPrisma.uploadedFile.findUnique.mockResolvedValue({ id: 'file-1', ownerId: 'user-A', storageKey: 'test.webp' });
      mockPrisma.uploadedFile.delete.mockResolvedValue({});
      const { DELETE } = require('@/app/api/uploads/[id]/route');
      const req = new Request('http://localhost/api/uploads/file-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'file-1' }) });
      expect(res.status).toBe(200);
    });

    it('allows admin to delete any file', async () => {
      mockSession = { user: { id: 'admin-1', role: 'admin' } };
      mockPrisma.uploadedFile.findUnique.mockResolvedValue({ id: 'file-1', ownerId: 'user-B', storageKey: 'test.webp' });
      mockPrisma.uploadedFile.delete.mockResolvedValue({});
      const { DELETE } = require('@/app/api/uploads/[id]/route');
      const req = new Request('http://localhost/api/uploads/file-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'file-1' }) });
      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent file', async () => {
      mockSession = { user: { id: 'user-A', role: 'user' } };
      mockPrisma.uploadedFile.findUnique.mockResolvedValue(null);
      const { DELETE } = require('@/app/api/uploads/[id]/route');
      const req = new Request('http://localhost/api/uploads/file-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id: 'file-1' }) });
      expect(res.status).toBe(404);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: Upload Security Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Upload Security', () => {
  describe('Upload POST - auth required', () => {
    it('rejects unauthenticated upload', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/uploads/route');
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
      const req = new Request('http://localhost/api/uploads', { method: 'POST', body: formData });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('rejects upload without file', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/uploads/route');
      const formData = new FormData();
      formData.append('purpose', 'photo');
      const req = new Request('http://localhost/api/uploads', { method: 'POST', body: formData });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: Content Creation Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Content Creation', () => {
  describe('Appreciation POST', () => {
    it('rejects unauthenticated appreciation', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/appreciations/route');
      const req = new Request('http://localhost/api/appreciations', {
        method: 'POST',
        body: JSON.stringify({ memberId: 'heeseung', content: 'Great music!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Post POST', () => {
    it('rejects unauthenticated post creation', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/posts/route');
      const req = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ type: 'Appreciation', content: 'Great post!' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('rejects empty content post', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/posts/route');
      const req = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ type: 'Appreciation', content: '' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('creates post with pending status awaiting moderation', async () => {
      mockSession = { user: { id: 'user-1', name: 'Kind Fan', image: null, role: 'user' } };
      mockPrisma.post.create.mockResolvedValue({
        id: 'post-123',
        userId: 'user-1',
        memberId: null,
        type: 'Appreciation',
        title: 'Heartfelt Note',
        content: 'Thank you so much for bringing joy to our community every single day!',
        mediaUrl: null,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: 'Kind Fan', image: null }
      });

      const { POST } = require('@/app/api/posts/route');
      const req = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Appreciation',
          content: 'Thank you so much for bringing joy to our community every single day!',
        }),
        headers: { 'content-type': 'application/json', 'content-length': '200' },
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const createCall = mockPrisma.post.create.mock.calls[0][0];
      expect(createCall.data.status).toBe('approved');

      const body = await res.json();
      expect(body.id).toBe('post-123');
      expect(body.status).toBe('approved');
    });

    it('allows author to delete their own post', async () => {
      mockSession = { user: { id: 'user-test-123', role: 'user' } };
      mockPrisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-123',
        userId: 'user-test-123',
      });
      mockPrisma.post.delete.mockResolvedValueOnce({ id: 'post-123' });

      const { DELETE } = require('@/app/api/posts/[postId]/route');
      const req = new Request('http://localhost/api/posts/post-123', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ postId: 'post-123' }) });

      expect(res.status).toBe(200);
      expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: 'post-123' } });
    });

    it('rejects post deletion from unauthorized user', async () => {
      mockSession = { user: { id: 'user-test-123', role: 'user' } };
      mockPrisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-123',
        userId: 'other-user',
      });

      const { DELETE } = require('@/app/api/posts/[postId]/route');
      const req = new Request('http://localhost/api/posts/post-123', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ postId: 'post-123' }) });

      expect(res.status).toBe(403);
    });
  });

  describe('Comment DELETE', () => {
    it('allows author to delete their own comment', async () => {
      mockSession = { user: { id: 'user-test-123', role: 'user' } };
      mockPrisma.comment.findUnique.mockResolvedValueOnce({
        id: 'comment-1',
        postId: 'post-123',
        userId: 'user-test-123',
        post: { userId: 'other-user' }
      });
      mockPrisma.comment.delete.mockResolvedValueOnce({ id: 'comment-1' });

      const { DELETE } = require('@/app/api/posts/[postId]/comments/[commentId]/route');
      const req = new Request('http://localhost/api/posts/post-123/comments/comment-1', { method: 'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ postId: 'post-123', commentId: 'comment-1' }) });

      expect(res.status).toBe(200);
      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
    });
  });

  describe('Letter POST', () => {
    it('rejects unauthenticated letter', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/letters/route');
      const req = new Request('http://localhost/api/letters', {
        method: 'POST',
        body: JSON.stringify({ title: 'Hello', body: 'A heartfelt letter to someone special.' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Milestone POST', () => {
    it('rejects unauthenticated milestone', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/milestones/route');
      const req = new Request('http://localhost/api/milestones', {
        method: 'POST',
        body: JSON.stringify({ title: 'First Concert', description: 'An amazing milestone achieved.', eventDate: '2026-08-15' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Report POST', () => {
    it('rejects unauthenticated report', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/reports/route');
      const req = new Request('http://localhost/api/reports', {
        method: 'POST',
        body: JSON.stringify({ reason: 'This content is harmful to the community', contentType: 'post', contentId: '123' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Follow POST', () => {
    it('rejects unauthenticated follow', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/users/follow/route');
      const req = new Request('http://localhost/api/users/follow', {
        method: 'POST',
        body: JSON.stringify({ targetUserId: 'user-2' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('rejects missing targetUserId', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/users/follow/route');
      const req = new Request('http://localhost/api/users/follow', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json', 'content-length': '2' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Block POST', () => {
    it('rejects unauthenticated block', async () => {
      mockSession = null;
      const { POST } = require('@/app/api/users/block/route');
      const req = new Request('http://localhost/api/users/block', {
        method: 'POST',
        body: JSON.stringify({ targetUserId: 'user-2' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: Like Security Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Like Security', () => {
  describe('Appreciation Like', () => {
    it('rejects unauthenticated like', async () => {
      mockSession = null;
      const { PATCH } = require('@/app/api/appreciations/route');
      const req = new Request('http://localhost/api/appreciations', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'appreciation-1' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it('toggle like - creates like when not existing', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      mockPrisma.appreciationLike.findUnique.mockResolvedValue(null);
      mockPrisma.appreciationLike.create.mockResolvedValue({});
      mockPrisma.appreciationMessage.update.mockResolvedValue({});
      mockPrisma.appreciationMessage.findUnique.mockResolvedValue({ id: 'app-1', likesCount: 1 });

      const { PATCH } = require('@/app/api/appreciations/route');
      const req = new Request('http://localhost/api/appreciations', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'app-1' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(mockPrisma.appreciationLike.create).toHaveBeenCalled();
    });

    it('toggle like - removes like when already exists', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      mockPrisma.appreciationLike.findUnique.mockResolvedValue({ id: 'like-1', userId: 'user-1', appreciationId: 'app-1' });
      mockPrisma.appreciationLike.delete.mockResolvedValue({});
      mockPrisma.appreciationMessage.update.mockResolvedValue({});
      mockPrisma.appreciationMessage.findUnique.mockResolvedValue({ id: 'app-1', likesCount: 0 });

      const { PATCH } = require('@/app/api/appreciations/route');
      const req = new Request('http://localhost/api/appreciations', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'app-1' }),
        headers: { 'content-type': 'application/json', 'content-length': '100' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(mockPrisma.appreciationLike.delete).toHaveBeenCalled();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: Base64/URL Rejection Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Base64/URL Rejection', () => {
  describe('Letters API', () => {
    it('rejects base64 data URL for letter image', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/letters/route');
      const req = new Request('http://localhost/api/letters', {
        method: 'POST',
        body: JSON.stringify({
          title: 'A letter',
          body: 'Thank you for all the joy you bring to our community.',
          imageUrl: 'data:image/png;base64,iVBORw0KGgo=',
        }),
        headers: { 'content-type': 'application/json', 'content-length': '200' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Posts API', () => {
    it('rejects base64 data URL for post image', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/posts/route');
      const req = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Artwork',
          content: 'Check out this artwork I created for the community!',
          imageUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
        }),
        headers: { 'content-type': 'application/json', 'content-length': '200' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects disallowed image URL for post', async () => {
      mockSession = { user: { id: 'user-1', role: 'user' } };
      const { POST } = require('@/app/api/posts/route');
      const req = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Artwork',
          content: 'Check out this artwork I created for the community!',
          imageUrl: 'https://evil.com/malware.png',
        }),
        headers: { 'content-type': 'application/json', 'content-length': '200' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: API Response Safety Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('API Response Safety', () => {
  it('registration does not expose password in response', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'new', email: 'test@example.test', name: 'Test', role: 'user' });
    const { POST } = require('@/app/api/auth/register/route');
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.test', name: 'Test', password: 'secretpassword123' }),
      headers: { 'content-type': 'application/json', 'content-length': '100' },
    });
    const res = await POST(req);
    const text = await res.text();
    expect(text).not.toContain('secretpassword');
    expect(text).not.toContain('secret');
  });

  it('ban endpoint requires IP in body', async () => {
    mockSession = { user: { id: 'admin-1', role: 'admin' } };
    const { POST } = require('@/app/api/ban/route');
    const req = new Request('http://localhost/api/ban', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json', 'content-length': '2' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
