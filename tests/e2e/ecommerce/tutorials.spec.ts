import { test, expect } from '@playwright/test';

/**
 * E2E Tests: E-Commerce Tutorials Page
 * Tests tutorial steps, progress tracking, and persistence
 */

test.describe('E-Commerce Tutorials', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/tutorials');
  });

  test('should display tutorial steps', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/tutorial/i);

    // Check for tutorial steps (at least 3 should be visible)
    const steps = page.locator('[data-testid*="tutorial-step"], .tutorial-step, li').filter({
      hasText: /step|tutorial/i,
    });

    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThanOrEqual(3);
  });

  test('should mark tutorial step as completed', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find first uncompleted step with checkbox or button
    const firstStep = page
      .locator(
        '[data-testid*="tutorial-step"], .tutorial-step, [role="listitem"]'
      )
      .first();

    // Look for completion button/checkbox
    const completeButton = firstStep.locator(
      'button:has-text(/complete|done|mark/i), input[type="checkbox"], [role="checkbox"]'
    ).first();

    if (await completeButton.count() > 0) {
      // Click to mark as complete
      await completeButton.click();

      // Wait for state change
      await page.waitForTimeout(500);

      // Verify step is marked as complete (check for visual indicator)
      const isChecked = await completeButton.isChecked().catch(() => false);
      const isDisabled = await completeButton.isDisabled().catch(() => false);

      // At least one indicator should be true
      expect(isChecked || isDisabled).toBeTruthy();
    }
  });

  test('should persist tutorial progress on page reload', async ({ page, context }) => {
    await page.waitForLoadState('networkidle');

    // Mark first step as complete
    const completeButton = page
      .locator(
        'button:has-text(/complete|done|mark/i), input[type="checkbox"], [role="checkbox"]'
      )
      .first();

    if (await completeButton.count() > 0) {
      const wasChecked = await completeButton.isChecked().catch(() => false);

      if (!wasChecked) {
        await completeButton.click();
        await page.waitForTimeout(1000); // Wait for save
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if progress persisted
      const afterReload = page
        .locator(
          'button:has-text(/complete|done|mark/i), input[type="checkbox"], [role="checkbox"]'
        )
        .first();

      const isStillChecked = await afterReload.isChecked().catch(() => false);
      expect(isStillChecked).toBeTruthy();
    }
  });

  test('should display progress indicator', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for progress bar or percentage
    const progressIndicator = page.locator(
      '[data-testid*="progress"], .progress, [role="progressbar"]'
    ).first();

    if (await progressIndicator.count() > 0) {
      await expect(progressIndicator).toBeVisible();
    }

    // Or look for "X of Y completed" text
    const progressText = page.locator('text=/\\d+\\s*\\/\\s*\\d+|\\d+%/').first();
    if (await progressText.count() > 0) {
      await expect(progressText).toBeVisible();
    }
  });

  test('should navigate to tool from tutorial link', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find a tutorial step with an action link
    const actionLink = page
      .locator('a:has-text(/start|go to|open|try it/i)')
      .first();

    if (await actionLink.count() > 0) {
      await expect(actionLink).toBeVisible();

      // Click and verify navigation
      const href = await actionLink.getAttribute('href');
      await actionLink.click();

      await page.waitForLoadState('networkidle');

      // Verify we navigated somewhere (not on tutorials page anymore)
      if (href && !href.includes('tutorials')) {
        await expect(page).toHaveURL(new RegExp(href.replace(/^\//, '')));
      }
    }
  });

  test('should support both English and Hebrew content', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for language switcher
    const langSwitcher = page.locator('[data-testid="lang-switcher"], button:has-text(/עברית|english/i)').first();

    if (await langSwitcher.count() > 0) {
      // Get initial language
      const initialText = await page.locator('h1, h2').first().textContent();

      // Switch language
      await langSwitcher.click();
      await page.waitForTimeout(1000);

      // Get text after switch
      const afterSwitchText = await page.locator('h1, h2').first().textContent();

      // Text should be different
      expect(initialText).not.toBe(afterSwitchText);
    }
  });
});
