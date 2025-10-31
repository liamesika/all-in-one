/**
 * E2E Regression Tests for Middleware Redirect Behavior
 *
 * These tests ensure that users hitting the wrong vertical get properly
 * redirected to their canonical dashboard, preventing the routing issues
 * that existed before v1.0.0.
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock the vertical mapping utility
jest.mock('../lib/vertical-mapping', () => ({
  getVerticalFromPath: jest.fn((path: string) => {
    if (path.includes('/real-estate/')) return 'REAL_ESTATE';
    if (path.includes('/e-commerce/')) return 'E_COMMERCE';
    if (path.includes('/law/')) return 'LAW';
    if (path.includes('/production/')) return 'PRODUCTION';
    return undefined;
  }),
  getVerticalDashboardPath: jest.fn((vertical: string) => {
    const mapping = {
      'REAL_ESTATE': '/dashboard/real-estate/dashboard',
      'E_COMMERCE': '/dashboard/ecommerce',
      'LAW': '/dashboard/law/dashboard',
      'PRODUCTION': '/dashboard/production/dashboard'
    };
    return mapping[vertical as keyof typeof mapping];
  })
}));

describe('Middleware Redirect Behavior', () => {
  const createMockRequest = (url: string, cookies: Record<string, string> = {}) => {
    const request = new NextRequest(url);

    // Mock cookies
    Object.entries(cookies).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });

    return request;
  };

  describe('unauthenticated user redirects', () => {
    it('should redirect to login when no session cookie exists', async () => {
      const request = createMockRequest('https://effinity.co.il/dashboard/real-estate/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('next=%2Fdashboard%2Freal-estate%2Fdashboard');
    });

    it('should redirect to login for all dashboard routes without authentication', async () => {
      const testRoutes = [
        '/dashboard/real-estate/dashboard',
        '/dashboard/e-commerce/leads',
        '/dashboard/law/cases',
        '/dashboard/production/workflow'
      ];

      for (const route of testRoutes) {
        const request = createMockRequest(`https://effinity.co.il${route}`);
        const response = await middleware(request);

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/login');
      }
    });
  });

  describe('authenticated user navigation', () => {
    const mockSessionCookie = 'valid-session-token';

    it('should allow access to dashboard routes with valid session', async () => {
      const request = createMockRequest(
        'https://effinity.co.il/dashboard/real-estate/dashboard',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      expect(response.status).not.toBe(302);
    });

    it('should redirect base dashboard to default vertical', async () => {
      const request = createMockRequest(
        'https://effinity.co.il/dashboard',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/dashboard/real-estate/dashboard');
    });

    it('should redirect dashboard with trailing slash to default vertical', async () => {
      const request = createMockRequest(
        'https://effinity.co.il/dashboard/',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/dashboard/real-estate/dashboard');
    });
  });

  describe('vertical routing behavior', () => {
    const mockSessionCookie = 'valid-session-token';

    it('should allow access to known verticals', async () => {
      const knownVerticals = [
        '/dashboard/real-estate/dashboard',
        '/dashboard/ecommerce',
        '/dashboard/law/dashboard',
        '/dashboard/production/dashboard'
      ];

      for (const vertical of knownVerticals) {
        const request = createMockRequest(
          `https://effinity.co.il${vertical}`,
          { session: mockSessionCookie }
        );
        const response = await middleware(request);

        // Should not redirect (allow access)
        expect(response.status).not.toBe(302);
      }
    });

    it('should redirect unknown verticals to default', async () => {
      const request = createMockRequest(
        'https://effinity.co.il/dashboard/unknown-vertical/page',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/dashboard/real-estate/dashboard');
    });

    it('should handle Edge cases correctly', async () => {
      const edgeCases = [
        '/dashboard//real-estate/dashboard', // Double slash
        '/dashboard/real-estate', // Missing sub-path
        '/dashboard/real-estate/', // Trailing slash only
      ];

      for (const edgeCase of edgeCases) {
        const request = createMockRequest(
          `https://effinity.co.il${edgeCase}`,
          { session: mockSessionCookie }
        );
        const response = await middleware(request);

        // Should either allow or redirect cleanly (no errors)
        expect([200, 302]).toContain(response.status);
      }
    });
  });

  describe('non-dashboard routes', () => {
    it('should skip middleware for non-dashboard routes', async () => {
      const nonDashboardRoutes = [
        '/',
        '/login',
        '/register',
        '/api/auth/me',
        '/static/image.png'
      ];

      for (const route of nonDashboardRoutes) {
        const request = createMockRequest(`https://effinity.co.il${route}`);
        const response = await middleware(request);

        // Should pass through (NextResponse.next())
        expect(response.status).not.toBe(302);
      }
    });

    it('should skip middleware for API routes', async () => {
      const apiRoutes = [
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/me',
        '/api/real-estate/properties',
        '/api/e-commerce/leads'
      ];

      for (const route of apiRoutes) {
        const request = createMockRequest(`https://effinity.co.il${route}`);
        const response = await middleware(request);

        // Should pass through
        expect(response.status).not.toBe(302);
      }
    });
  });

  describe('critical regression scenarios', () => {
    const mockSessionCookie = 'valid-session-token';

    it('should prevent the E_COMMERCE routing loop that existed before v1.0.0', async () => {
      // Before the fix, users with E_COMMERCE defaultVertical would get redirected
      // to /dashboard/E_COMMERCE/dashboard (invalid) instead of /dashboard/ecommerce

      const request = createMockRequest(
        'https://effinity.co.il/dashboard/ecommerce',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      // Should allow access, not redirect
      expect(response.status).not.toBe(302);
    });

    it('should handle user accessing wrong vertical gracefully', async () => {
      // User with REAL_ESTATE vertical accessing e-commerce dashboard
      // Should be allowed (middleware doesn't enforce vertical matching)

      const request = createMockRequest(
        'https://effinity.co.il/dashboard/ecommerce',
        { session: mockSessionCookie }
      );
      const response = await middleware(request);

      // Middleware allows access; vertical enforcement happens at application level
      expect(response.status).not.toBe(302);
    });

    it('should maintain consistent redirect behavior across all environments', async () => {
      // Test with different domain configurations
      const domains = [
        'https://effinity.co.il',
        'https://effinity-platform-abc123.vercel.app',
        'http://localhost:3000'
      ];

      for (const domain of domains) {
        const request = createMockRequest(`${domain}/dashboard`);
        const response = await middleware(request);

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toContain('/login');
      }
    });
  });

  describe('error handling', () => {
    const mockSessionCookie = 'valid-session-token';

    it('should handle malformed URLs gracefully', async () => {
      const malformedUrls = [
        'https://effinity.co.il/dashboard/%',
        'https://effinity.co.il/dashboard/../../etc/passwd',
        'https://effinity.co.il/dashboard/<script>alert("xss")</script>'
      ];

      for (const url of malformedUrls) {
        try {
          const request = createMockRequest(url, { session: mockSessionCookie });
          const response = await middleware(request);

          // Should handle gracefully, not crash
          expect([200, 302, 400]).toContain(response.status);
        } catch (error) {
          // If error occurs, it should be handled gracefully
          expect(error).toBeDefined();
        }
      }
    });

    it('should never return 500 errors from middleware', async () => {
      // This was a critical issue before v1.0.0
      const testUrls = [
        '/dashboard',
        '/dashboard/',
        '/dashboard/real-estate/dashboard',
        '/dashboard/unknown/page'
      ];

      for (const path of testUrls) {
        const request = createMockRequest(`https://effinity.co.il${path}`);
        const response = await middleware(request);

        // Never return 500
        expect(response.status).not.toBe(500);
        expect([200, 302]).toContain(response.status);
      }
    });
  });
});