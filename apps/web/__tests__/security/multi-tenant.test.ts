import { checkMultiTenantScope, rateLimit, sanitizeInput } from '../../lib/security/rateLimit';

describe('Multi-Tenant Security', () => {
  describe('checkMultiTenantScope', () => {
    test('allows access when ownerUid matches requestingUid', () => {
      const result = checkMultiTenantScope('user-123', 'user-123');
      expect(result).toBe(true);
    });

    test('denies access when ownerUid does not match requestingUid', () => {
      const result = checkMultiTenantScope('user-123', 'user-456');
      expect(result).toBe(false);
    });

    test('denies access with empty ownerUid', () => {
      const result = checkMultiTenantScope('', 'user-123');
      expect(result).toBe(false);
    });

    test('denies access with empty requestingUid', () => {
      const result = checkMultiTenantScope('user-123', '');
      expect(result).toBe(false);
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit map between tests
      jest.clearAllMocks();
    });

    test('allows requests under limit', () => {
      const identifier = 'test-user-1';
      const result = rateLimit(identifier, 5, 60000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    test('blocks requests over limit', () => {
      const identifier = 'test-user-2';

      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        rateLimit(identifier, 5, 60000);
      }

      // 6th request should be blocked
      const result = rateLimit(identifier, 5, 60000);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('resets after time window', () => {
      const identifier = 'test-user-3';

      // First request
      const first = rateLimit(identifier, 5, 100); // 100ms window
      expect(first.success).toBe(true);

      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const second = rateLimit(identifier, 5, 100);
          expect(second.success).toBe(true);
          expect(second.remaining).toBe(4); // Should reset
          resolve(undefined);
        }, 150);
      });
    }, 10000);
  });

  describe('sanitizeInput', () => {
    test('removes XSS script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      const clean = sanitizeInput(malicious);
      expect(clean).toBe('scriptalert("xss")/scriptHello');
      expect(clean).not.toContain('<script>');
    });

    test('removes dangerous characters', () => {
      const malicious = 'Hello<>World';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });

    test('truncates to max length', () => {
      const longString = 'a'.repeat(2000);
      const clean = sanitizeInput(longString);
      expect(clean.length).toBeLessThanOrEqual(1000);
    });

    test('allows safe input unchanged', () => {
      const safe = 'Hello World 123';
      const clean = sanitizeInput(safe);
      expect(clean).toBe(safe);
    });
  });
});
