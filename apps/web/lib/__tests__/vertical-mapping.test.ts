/**
 * Regression Tests for Vertical Mapping
 *
 * These tests prevent future breaks of the critical vertical enum/slug mapping
 * that was fixed in v1.0.0 to resolve routing mismatches.
 */

import {
  enumToSlug,
  slugToEnum,
  getVerticalFromPath,
  getVerticalDashboardPath,
  type VerticalEnum,
  type VerticalSlug
} from '../vertical-mapping';

describe('Vertical Mapping', () => {
  describe('enumToSlug mapping', () => {
    it('should correctly map all vertical enums to slugs', () => {
      expect(enumToSlug.E_COMMERCE).toBe('e-commerce');
      expect(enumToSlug.REAL_ESTATE).toBe('real-estate');
      expect(enumToSlug.LAW).toBe('law');
      expect(enumToSlug.PRODUCTION).toBe('production');
    });

    it('should be consistent with database enum values', () => {
      // These enum names must match the Prisma schema exactly
      const expectedEnums: VerticalEnum[] = ['E_COMMERCE', 'REAL_ESTATE', 'LAW', 'PRODUCTION'];
      const actualEnums = Object.keys(enumToSlug) as VerticalEnum[];

      expect(actualEnums.sort()).toEqual(expectedEnums.sort());
    });
  });

  describe('slugToEnum mapping', () => {
    it('should correctly map all slugs to vertical enums', () => {
      expect(slugToEnum['e-commerce']).toBe('E_COMMERCE');
      expect(slugToEnum['real-estate']).toBe('REAL_ESTATE');
      expect(slugToEnum['law']).toBe('LAW');
      expect(slugToEnum['production']).toBe('PRODUCTION');
    });

    it('should be consistent with URL slug format', () => {
      // These slugs must match the dashboard route structure
      const expectedSlugs: VerticalSlug[] = ['e-commerce', 'real-estate', 'law', 'production'];
      const actualSlugs = Object.keys(slugToEnum) as VerticalSlug[];

      expect(actualSlugs.sort()).toEqual(expectedSlugs.sort());
    });
  });

  describe('bidirectional mapping consistency', () => {
    it('should be perfectly bidirectional for all verticals', () => {
      // Forward mapping: enum -> slug -> enum
      Object.entries(enumToSlug).forEach(([enumValue, slug]) => {
        expect(slugToEnum[slug]).toBe(enumValue);
      });

      // Reverse mapping: slug -> enum -> slug
      Object.entries(slugToEnum).forEach(([slug, enumValue]) => {
        expect(enumToSlug[enumValue]).toBe(slug);
      });
    });

    it('should have equal number of enum and slug mappings', () => {
      expect(Object.keys(enumToSlug)).toHaveLength(Object.keys(slugToEnum).length);
    });
  });

  describe('getVerticalFromPath', () => {
    it('should extract correct vertical from dashboard paths', () => {
      expect(getVerticalFromPath('/dashboard/real-estate/dashboard')).toBe('REAL_ESTATE');
      expect(getVerticalFromPath('/dashboard/e-commerce/leads')).toBe('E_COMMERCE');
      expect(getVerticalFromPath('/dashboard/law/cases')).toBe('LAW');
      expect(getVerticalFromPath('/dashboard/production/workflow')).toBe('PRODUCTION');
    });

    it('should return undefined for non-dashboard paths', () => {
      expect(getVerticalFromPath('/')).toBeUndefined();
      expect(getVerticalFromPath('/login')).toBeUndefined();
      expect(getVerticalFromPath('/api/auth/me')).toBeUndefined();
    });

    it('should return undefined for dashboard paths without vertical', () => {
      expect(getVerticalFromPath('/dashboard')).toBeUndefined();
      expect(getVerticalFromPath('/dashboard/')).toBeUndefined();
    });

    it('should return undefined for unknown verticals', () => {
      expect(getVerticalFromPath('/dashboard/unknown-vertical/page')).toBeUndefined();
      expect(getVerticalFromPath('/dashboard/invalid/dashboard')).toBeUndefined();
    });

    it('should handle trailing slashes correctly', () => {
      expect(getVerticalFromPath('/dashboard/real-estate/')).toBe('REAL_ESTATE');
      expect(getVerticalFromPath('/dashboard/e-commerce/dashboard/')).toBe('E_COMMERCE');
    });
  });

  describe('getVerticalDashboardPath', () => {
    it('should generate correct dashboard paths for all verticals', () => {
      expect(getVerticalDashboardPath('REAL_ESTATE')).toBe('/dashboard/real-estate/dashboard');
      expect(getVerticalDashboardPath('E_COMMERCE')).toBe('/dashboard/ecommerce');
      expect(getVerticalDashboardPath('LAW')).toBe('/dashboard/law/dashboard');
      expect(getVerticalDashboardPath('PRODUCTION')).toBe('/dashboard/production/dashboard');
    });

    it('should throw for invalid vertical enums', () => {
      expect(() => getVerticalDashboardPath('INVALID' as VerticalEnum)).toThrow();
    });
  });

  describe('critical routing scenarios (regression prevention)', () => {
    it('should correctly handle the E_COMMERCE -> ecommerce mismatch that was fixed', () => {
      // This was the specific bug fixed in v1.0.0
      const userWithECommerceVertical = 'E_COMMERCE' as VerticalEnum;
      const expectedDashboardPath = '/dashboard/ecommerce';

      // User's defaultVertical from database should map to correct URL slug
      const dashboardPath = getVerticalDashboardPath(userWithECommerceVertical);
      expect(dashboardPath).toBe(expectedDashboardPath);

      // URL path should map back to correct enum for API calls
      const extractedVertical = getVerticalFromPath(dashboardPath);
      expect(extractedVertical).toBe(userWithECommerceVertical);
    });

    it('should prevent misrouting between API and frontend', () => {
      // Simulate the user flow that was broken before v1.0.0
      const apiResponse = { defaultVertical: 'E_COMMERCE' as VerticalEnum };
      const dashboardRedirectPath = getVerticalDashboardPath(apiResponse.defaultVertical);
      const extractedFromUrl = getVerticalFromPath(dashboardRedirectPath);

      // These should match exactly (they didn't before the fix)
      expect(extractedFromUrl).toBe(apiResponse.defaultVertical);
    });

    it('should handle all vertical routing round-trips correctly', () => {
      const testCases: Array<{ enum: VerticalEnum; expectedPath: string }> = [
        { enum: 'E_COMMERCE', expectedPath: '/dashboard/ecommerce' },
        { enum: 'REAL_ESTATE', expectedPath: '/dashboard/real-estate/dashboard' },
        { enum: 'LAW', expectedPath: '/dashboard/law/dashboard' },
        { enum: 'PRODUCTION', expectedPath: '/dashboard/production/dashboard' }
      ];

      testCases.forEach(({ enum: vertical, expectedPath }) => {
        // 1. Database enum -> Dashboard URL
        const dashboardPath = getVerticalDashboardPath(vertical);
        expect(dashboardPath).toBe(expectedPath);

        // 2. Dashboard URL -> Extract enum
        const extractedVertical = getVerticalFromPath(dashboardPath);
        expect(extractedVertical).toBe(vertical);

        // 3. Round-trip should be perfect
        expect(extractedVertical).toBe(vertical);
      });
    });
  });

  describe('type safety', () => {
    it('should have correct TypeScript types', () => {
      // These tests ensure TypeScript compilation catches type mismatches
      const enumValue: VerticalEnum = 'REAL_ESTATE';
      const slugValue: VerticalSlug = 'real-estate';

      // Should compile without errors
      expect(enumToSlug[enumValue]).toBe(slugValue);
      expect(slugToEnum[slugValue]).toBe(enumValue);
    });
  });
});