import { checkContentModeration } from '@/lib/moderation';

describe('Content Moderation Engine', () => {
  describe('Allowed Content', () => {
    it('allows positive appreciation messages', () => {
      const result = checkContentModeration('Your music inspires me every single day.');
      expect(result.isAllowed).toBe(true);
    });

    it('allows thank-you messages', () => {
      const result = checkContentModeration('Thank you for your hard work and dedication.');
      expect(result.isAllowed).toBe(true);
    });

    it('allows performance praise', () => {
      const result = checkContentModeration('This performance made my day so much better!');
      expect(result.isAllowed).toBe(true);
    });

    it('allows messages about personal growth inspired by members', () => {
      const result = checkContentModeration('Your dance practice video motivated me to start exercising again.');
      expect(result.isAllowed).toBe(true);
    });

    it('allows warm supportive messages', () => {
      const result = checkContentModeration('I love how you always stay true to yourself and your art.');
      expect(result.isAllowed).toBe(true);
    });

    it('allows community building messages', () => {
      const result = checkContentModeration('This community is such a safe and warm space for all of us fans.');
      expect(result.isAllowed).toBe(true);
    });
  });

  describe('Blocked Comparative Content', () => {
    it('blocks "better than" comparisons', () => {
      const result = checkContentModeration('Heeseung is better than Sunoo');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toMatch(/Comparison/i);
    });

    it('blocks "best member" claims', () => {
      const result = checkContentModeration('Who is the best member in the group?');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toMatch(/Ranking/i);
    });

    it('blocks "worst member" claims', () => {
      const result = checkContentModeration('That worst member should just leave already');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "more talented than"', () => {
      const result = checkContentModeration('Jay is more talented than everyone else');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "deserves more than"', () => {
      const result = checkContentModeration('He deserves more than the others get');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "carried the group"', () => {
      const result = checkContentModeration('Jake carried the group in this performance');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "useless member"', () => {
      const result = checkContentModeration('That useless member should be replaced');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "should be replaced"', () => {
      const result = checkContentModeration('They should be replaced with someone better');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "who is better" queries', () => {
      const result = checkContentModeration('Who is better at dancing?');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "underrated compared to"', () => {
      const result = checkContentModeration('Ni-ki is so underrated compared to the others');
      expect(result.isAllowed).toBe(false);
    });
  });

  describe('Blocked Fan War Content', () => {
    it('blocks "go attack" directives', () => {
      const result = checkContentModeration('Everyone go attack the antis on twitter');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "hate train"', () => {
      const result = checkContentModeration('Starting a hate train against the new fans');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "boycott" calls', () => {
      const result = checkContentModeration('We should boycott the company for this decision');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks conditional hate ("if you like X you must hate Y")', () => {
      const result = checkContentModeration('If you love Sunghoon you should hate the other members');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "flop member"', () => {
      const result = checkContentModeration('The flop member is dragging the group down');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks "overrated"', () => {
      const result = checkContentModeration('That overrated member gets too much attention');
      expect(result.isAllowed).toBe(false);
    });
  });

  describe('Privacy Leak Detection', () => {
    it('blocks US phone numbers', () => {
      const result = checkContentModeration('Call me at 555-123-4567');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toMatch(/Phone/i);
    });

    it('blocks phone numbers with country code', () => {
      const result = checkContentModeration('His number is +1-555-123-4567');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks home address references', () => {
      const result = checkContentModeration('I know his home address in Seoul');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toMatch(/Location|Privacy/i);
    });

    it('blocks hotel location leaks', () => {
      const result = checkContentModeration('They are staying at the Grand Hotel location');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks flight schedule leaks', () => {
      const result = checkContentModeration('The flight schedule shows them arriving at 3pm');
      expect(result.isAllowed).toBe(false);
    });

    it('blocks dorm address leaks', () => {
      const result = checkContentModeration('Here is the dorm address for you all');
      expect(result.isAllowed).toBe(false);
    });
  });

  describe('Profanity Detection', () => {
    it('blocks profanity', () => {
      const result = checkContentModeration('That person is a bastard');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toMatch(/Profanity|Language/i);
    });

    it('blocks case-insensitive profanity', () => {
      const result = checkContentModeration('What a BASTARD move');
      expect(result.isAllowed).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('blocks empty content', () => {
      const result = checkContentModeration('');
      expect(result.isAllowed).toBe(false);
      expect(result.flagReason).toBe('Empty Content');
    });

    it('blocks whitespace-only content', () => {
      const result = checkContentModeration('   \n\t  ');
      expect(result.isAllowed).toBe(false);
    });

    it('returns score 0.0 for allowed content', () => {
      const result = checkContentModeration('Your vocals are incredible!');
      expect(result.score).toBe(0.0);
    });

    it('returns high score for blocked content', () => {
      const result = checkContentModeration('Who is better?');
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('returns guidance message for blocked content', () => {
      const result = checkContentModeration('Heeseung is better than Jay');
      expect(result.guidanceMessage).toBeDefined();
      expect(result.guidanceMessage!.length).toBeGreaterThan(10);
    });

    it('returns guidance message for allowed content', () => {
      const result = checkContentModeration('I love your music so much!');
      expect(result.guidanceMessage).toBeDefined();
    });
  });
});
