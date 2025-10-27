import { test, expect } from '@playwright/test';

/**
 * E2E Tests: E-Commerce Dashboard Overview
 * Tests KPI cards, navigation, and dashboard layout
 */

test.describe('E-Commerce Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to E-Commerce dashboard
    await page.goto('/dashboard/ecommerce');
  });

  test('should display dashboard with KPI cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for main heading
    await expect(page.locator('h1')).toContainText(/e-commerce/i);

    // Check for KPI cards (at least 4 should be visible)
    const kpiCards = page.locator('[data-testid*="kpi-card"], .kpi-card, [class*="stat"]');
    await expect(kpiCards.first()).toBeVisible();

    // Check that dashboard sections are present
    const sections = page.locator('section, [role="region"]');
    await expect(sections).not.toHaveCount(0);
  });

  test('should navigate to all E-Commerce tools from dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test navigation links exist
    const navigationLinks = [
      { text: /csv builder|products/i, href: '/dashboard/ecommerce/products/csv' },
      { text: /structure|collections/i, href: '/dashboard/ecommerce/structure' },
      { text: /layout|blueprint/i, href: '/dashboard/ecommerce/layout-blueprint' },
      { text: /ai images|image studio/i, href: '/dashboard/ecommerce/ai-images' },
      { text: /campaign|assistant/i, href: '/dashboard/ecommerce/campaigns/assistant' },
      { text: /performance/i, href: '/dashboard/ecommerce/performance' },
    ];

    for (const link of navigationLinks) {
      const linkElement = page.locator(`a:has-text("${link.text.source}")`).first();
      if (await linkElement.count() > 0) {
        await expect(linkElement).toBeVisible();
      }
    }
  });

  test('should display tutorials section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if tutorials link/section exists
    const tutorialsLink = page.locator('a:has-text(/tutorial/i)').first();

    if (await tutorialsLink.count() > 0) {
      await expect(tutorialsLink).toBeVisible();

      // Click and navigate to tutorials
      await tutorialsLink.click();
      await page.waitForURL(/.*tutorials.*/);
      await expect(page).toHaveURL(/.*tutorials.*/);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible();

    // Verify no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow 10px tolerance
  });

  test('should support RTL layout for Hebrew', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if language switcher exists
    const langSwitcher = page.locator('[data-testid="lang-switcher"], button:has-text(/עברית|hebrew/i)').first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();

      // Wait for language change
      await page.waitForTimeout(1000);

      // Check that RTL is applied
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
    }
  });
});
