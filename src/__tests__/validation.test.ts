import {
  registerSchema,
  appreciationSchema,
  postSchema,
  reportSchema,
  letterSchema,
  photoSchema,
  milestoneSchema,
  targetIdSchema,
  likeSchema,
} from '@/lib/validations';

describe('Zod Validation Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: 'Test User',
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        name: 'Test User',
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const result = registerSchema.safeParse({
        email: '',
        name: 'Test User',
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name too short', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: 'A',
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name too long', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: 'A'.repeat(51),
        password: 'SecurePassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: 'Test User',
        password: '1234567',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing fields', () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects role field injection attempt', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: 'Test User',
        password: 'SecurePassword123!',
        role: 'admin',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('role');
      }
    });
  });

  describe('appreciationSchema', () => {
    it('accepts valid appreciation', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: 'Your music inspires me every day! Keep shining!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing memberId', () => {
      const result = appreciationSchema.safeParse({
        content: 'Your music inspires me every day!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content too short', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: 'Hi',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content too long', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: 'A'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it('accepts content at exact boundary (10 chars)', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: '1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('accepts content at max boundary (1000 chars)', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: 'A'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('postSchema', () => {
    it('accepts valid post', () => {
      const result = postSchema.safeParse({
        type: 'Appreciation',
        title: 'Amazing Performance',
        content: 'This was an incredible performance that touched my heart deeply.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing type', () => {
      const result = postSchema.safeParse({
        title: 'Amazing',
        content: 'Great performance!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content too short', () => {
      const result = postSchema.safeParse({
        type: 'Appreciation',
        content: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content too long', () => {
      const result = postSchema.safeParse({
        type: 'Appreciation',
        content: 'A'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('accepts optional memberId', () => {
      const result = postSchema.safeParse({
        type: 'Appreciation',
        content: 'Great performance that deserves recognition from everyone.',
        memberId: 'heeseung',
      });
      expect(result.success).toBe(true);
    });

    it('accepts null memberId', () => {
      const result = postSchema.safeParse({
        type: 'Community',
        content: 'Welcome to our community everyone, we are glad to have you!',
        memberId: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('reportSchema', () => {
    it('accepts valid report', () => {
      const result = reportSchema.safeParse({
        reason: 'This content is harmful and should be reviewed by moderators',
        contentType: 'post',
        contentId: 'some-id-123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects reason too short', () => {
      const result = reportSchema.safeParse({
        reason: 'Bad',
        contentType: 'post',
        contentId: 'some-id',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid contentType', () => {
      const result = reportSchema.safeParse({
        reason: 'This content violates community guidelines and rules',
        contentType: 'invalid-type',
        contentId: 'some-id',
      });
      expect(result.success).toBe(false);
    });

    it('accepts all valid contentTypes', () => {
      const types = ['appreciation', 'post', 'story', 'comment', 'letter', 'photo', 'milestone'];
      for (const contentType of types) {
        const result = reportSchema.safeParse({
          reason: 'This content violates community guidelines',
          contentType,
          contentId: 'some-id',
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects empty contentId', () => {
      const result = reportSchema.safeParse({
        reason: 'This content violates community guidelines',
        contentType: 'post',
        contentId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('letterSchema', () => {
    it('accepts valid letter', () => {
      const result = letterSchema.safeParse({
        title: 'A heartfelt note',
        body: 'Thank you for being such an inspiration to fans around the world.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects title too short', () => {
      const result = letterSchema.safeParse({
        title: 'A',
        body: 'Thank you for being such an inspiration to fans around the world.',
      });
      expect(result.success).toBe(false);
    });

    it('rejects body too short', () => {
      const result = letterSchema.safeParse({
        title: 'A heartfelt note',
        body: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('rejects body too long', () => {
      const result = letterSchema.safeParse({
        title: 'A heartfelt note',
        body: 'A'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('accepts shared visibility', () => {
      const result = letterSchema.safeParse({
        title: 'A note',
        body: 'Thank you for all the joy you bring to our lives every single day.',
        visibility: 'shared',
      });
      expect(result.success).toBe(true);
    });

    it('accepts private visibility', () => {
      const result = letterSchema.safeParse({
        title: 'A private note',
        body: 'This is a private letter with personal thoughts and reflections.',
        visibility: 'private',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid visibility', () => {
      const result = letterSchema.safeParse({
        title: 'A note',
        body: 'Thank you for all the joy you bring to our lives every single day.',
        visibility: 'public',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('photoSchema', () => {
    it('accepts valid photo', () => {
      const result = photoSchema.safeParse({
        memberSlug: 'heeseung',
        url: 'https://images.unsplash.com/photo-123?w=800',
        caption: 'Beautiful stage photo',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing memberSlug', () => {
      const result = photoSchema.safeParse({
        url: 'https://images.unsplash.com/photo-123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid URL', () => {
      const result = photoSchema.safeParse({
        memberSlug: 'heeseung',
        url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects caption too long', () => {
      const result = photoSchema.safeParse({
        memberSlug: 'heeseung',
        url: 'https://images.unsplash.com/photo-123',
        caption: 'A'.repeat(301),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('milestoneSchema', () => {
    it('accepts valid milestone', () => {
      const result = milestoneSchema.safeParse({
        title: 'First Solo Concert',
        description: 'An incredible milestone achievement for the artist community.',
        eventDate: '2026-08-15',
      });
      expect(result.success).toBe(true);
    });

    it('rejects title too short', () => {
      const result = milestoneSchema.safeParse({
        title: 'Hi',
        description: 'An incredible milestone achievement for the artist community.',
        eventDate: '2026-08-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects description too short', () => {
      const result = milestoneSchema.safeParse({
        title: 'First Solo Concert',
        description: 'Short',
        eventDate: '2026-08-15',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('targetIdSchema', () => {
    it('accepts valid target ID', () => {
      const result = targetIdSchema.safeParse({ targetUserId: 'user-123' });
      expect(result.success).toBe(true);
    });

    it('rejects empty target ID', () => {
      const result = targetIdSchema.safeParse({ targetUserId: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing target ID', () => {
      const result = targetIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('likeSchema', () => {
    it('accepts valid like target', () => {
      const result = likeSchema.safeParse({ id: 'resource-123' });
      expect(result.success).toBe(true);
    });

    it('rejects empty ID', () => {
      const result = likeSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing ID', () => {
      const result = likeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Malicious Input Handling', () => {
    it('handles XSS in registration name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.test',
        name: '<script>alert("xss")</script>',
        password: 'SecurePassword123!',
      });
      // Schema accepts it — React escaping handles rendering safety
      expect(result.success).toBe(true);
    });

    it('handles SQL injection in email', () => {
      const result = registerSchema.safeParse({
        email: "'; DROP TABLE users; --",
        name: 'Hacker',
        password: 'SecurePassword123!',
      });
      // Zod rejects invalid email format
      expect(result.success).toBe(false);
    });

    it('handles very long strings gracefully', () => {
      const result = appreciationSchema.safeParse({
        memberId: 'heeseung',
        content: 'A'.repeat(10000),
      });
      expect(result.success).toBe(false);
    });

    it('handles null values', () => {
      const result = postSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('handles array instead of object', () => {
      const result = registerSchema.safeParse([1, 2, 3]);
      expect(result.success).toBe(false);
    });
  });
});
