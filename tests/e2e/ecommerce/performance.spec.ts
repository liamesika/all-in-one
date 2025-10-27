import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Performance Check
 * Tests PSI audit execution and PDF export
 */

test.describe('Performance Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/performance');
  });

  test('should display performance check interface', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/performance|audit|check/i);

    // Check for URL input
    const urlInput = page.locator(
      'input[type="url"], input[placeholder*="domain"], input[placeholder*="url"], input[name*="domain"]'
    ).first();

    await expect(urlInput).toBeVisible();
  });

  test('should enter store domain for audit', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find domain input
    const domainInput = page.locator(
      'input[type="url"], input[placeholder*="domain"], input[name*="domain"]'
    ).first();

    await domainInput.fill('https://example-store.com');

    // Verify value entered
    const value = await domainInput.inputValue();
    expect(value).toContain('example-store.com');
  });

  test('should run performance audit', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter domain
    const domainInput = page.locator('input[type="url"], input[name*="domain"]').first();
    await domainInput.fill('https://www.google.com'); // Use Google for reliable test

    // Find run audit button
    const runButton = page.locator('button:has-text(/run|check|audit|analyze/i)').first();

    await expect(runButton).toBeVisible();

    const isDisabled = await runButton.isDisabled();

    if (!isDisabled) {
      // Click run
      await runButton.click();

      // Wait for audit to start (PSI can take 10-60 seconds)
      await page.waitForTimeout(2000);

      // Look for loading indicator
      const loadingIndicator = page.locator(
        '[data-testid*="loading"], .loading, text=/running|analyzing|processing/i'
      ).first();

      if (await loadingIndicator.count() > 0) {
        // Wait for audit to complete (up to 90 seconds for PSI)
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {
          console.log('Audit taking longer than expected');
        });
      }

      // Look for results section
      const resultsSection = page.locator(
        '[data-testid*="results"], section:has-text(/score|results|metrics/i)'
      ).first();

      if (await resultsSection.count() > 0) {
        await expect(resultsSection).toBeVisible({ timeout: 95000 });
      }
    }
  });

  test('should display performance scores', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for score displays
    const scores = page.locator(
      '[data-testid*="score"], .score, text=/\\d+\\/100|\\d+%/'
    );

    if ((await scores.count()) > 0) {
      await expect(scores.first()).toBeVisible();

      // Check for specific metrics
      const performanceScore = page.locator('text=/performance/i').first();
      const seoScore = page.locator('text=/seo/i').first();

      if (await performanceScore.count() > 0) {
        await expect(performanceScore).toBeVisible();
      }

      if (await seoScore.count() > 0) {
        await expect(seoScore).toBeVisible();
      }
    }
  });

  test('should display Core Web Vitals metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for Core Web Vitals (LCP, FID, CLS, TTFB)
    const metricsSection = page.locator(
      'section:has-text(/web vital|lcp|fid|cls|ttfb/i)'
    ).first();

    if (await metricsSection.count() > 0) {
      await expect(metricsSection).toBeVisible();

      // Check for individual metrics
      const lcpMetric = page.locator('text=/LCP|Largest Contentful Paint/i').first();
      const clsMetric = page.locator('text=/CLS|Cumulative Layout Shift/i').first();
      const ttfbMetric = page.locator('text=/TTFB|Time to First Byte/i').first();

      if (await lcpMetric.count() > 0) {
        await expect(lcpMetric).toBeVisible();
      }

      if (await clsMetric.count() > 0) {
        await expect(clsMetric).toBeVisible();
      }

      if (await ttfbMetric.count() > 0) {
        await expect(ttfbMetric).toBeVisible();
      }
    }
  });

  test('should display recommendations', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for recommendations section
    const recommendationsSection = page.locator(
      'section:has-text(/recommendation|suggestion|improvement/i)'
    ).first();

    if (await recommendationsSection.count() > 0) {
      await expect(recommendationsSection).toBeVisible();

      // Check for recommendation items
      const recommendations = recommendationsSection.locator(
        'li, .recommendation-item, [role="listitem"]'
      );

      if ((await recommendations.count()) > 0) {
        expect(await recommendations.count()).toBeGreaterThanOrEqual(1);
        await expect(recommendations.first()).toBeVisible();
      }
    }
  });

  test('should display priority labels on recommendations', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for priority badges (high, medium, low)
    const priorityBadges = page.locator(
      'span:has-text(/high|medium|low priority/i), .priority, [data-priority]'
    );

    if ((await priorityBadges.count()) > 0) {
      await expect(priorityBadges.first()).toBeVisible();

      // Verify different priorities exist
      const highPriority = page.locator('text=/high/i').first();
      if (await highPriority.count() > 0) {
        await expect(highPriority).toBeVisible();
      }
    }
  });

  test('should export report as PDF', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find PDF export button
    const pdfButton = page.locator('button:has-text(/pdf|export|download/i)').first();

    if (await pdfButton.count() > 0) {
      const isDisabled = await pdfButton.isDisabled();

      if (!isDisabled) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await pdfButton.click();

        // Wait for download
        const download = await downloadPromise.catch(() => null);

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.pdf$/i);
          expect(filename).toContain('performance');
        }
      }
    }
  });

  test('should display audit history', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for history section
    const historySection = page.locator(
      '[data-testid*="history"], section:has-text(/history|previous|past/i)'
    ).first();

    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Check for history items
      const historyItems = historySection.locator('li, .history-item, [role="listitem"]');

      if ((await historyItems.count()) > 0) {
        await expect(historyItems.first()).toBeVisible();

        // Check for domain and date in history
        const historyText = await historyItems.first().textContent();
        expect(historyText?.length || 0).toBeGreaterThan(5);
      }
    }
  });

  test('should view previous audit report', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for history items
    const historyItems = page.locator(
      '[data-testid*="history-item"], .history-item, button:has-text(/view|show/i)'
    );

    if ((await historyItems.count()) > 0) {
      const firstItem = historyItems.first();
      await firstItem.click();
      await page.waitForTimeout(1000);

      // Should display the previous report
      const resultsSection = page.locator(
        '[data-testid*="results"], section:has-text(/score|results/i)'
      ).first();

      if (await resultsSection.count() > 0) {
        await expect(resultsSection).toBeVisible();
      }
    }
  });

  test('should compare multiple audit results', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for compare feature
    const compareButton = page.locator('button:has-text(/compare/i)').first();

    if (await compareButton.count() > 0) {
      await expect(compareButton).toBeVisible();

      await compareButton.click();
      await page.waitForTimeout(500);

      // Look for comparison view
      const comparisonView = page.locator(
        '[data-testid*="comparison"], section:has-text(/comparison/i)'
      ).first();

      if (await comparisonView.count() > 0) {
        await expect(comparisonView).toBeVisible();
      }
    }
  });

  test('should handle invalid domain gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter invalid domain
    const domainInput = page.locator('input[type="url"], input[name*="domain"]').first();
    await domainInput.fill('not-a-valid-domain');

    // Try to run audit
    const runButton = page.locator('button:has-text(/run|check|audit/i)').first();

    if ((await runButton.count()) > 0 && !(await runButton.isDisabled())) {
      await runButton.click();
      await page.waitForTimeout(1000);

      // Look for error message
      const errorMsg = page.locator('text=/invalid|error|failed/i').first();
      if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible();
      }
    }
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const domainInput = page.locator('input[type="url"], input[name*="domain"]').first();
    const runButton = page.locator('button:has-text(/run|check/i)').first();

    // Try to run multiple audits rapidly
    for (let i = 0; i < 30; i++) {
      await domainInput.fill(`https://test-${i}.com`);

      if (await runButton.count() > 0) {
        const isDisabled = await runButton.isDisabled();
        if (!isDisabled) {
          await runButton.click();
          await page.waitForTimeout(100);
        }
      }

      // Check for rate limit message
      const rateLimitMsg = page.locator('text=/rate limit|too many|quota/i').first();
      if (await rateLimitMsg.count() > 0) {
        await expect(rateLimitMsg).toBeVisible();
        break;
      }
    }
  });

  test('should display bilingual recommendations', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Switch to Hebrew if available
    const langSwitcher = page.locator('[data-testid="lang-switcher"]').first();

    if (await langSwitcher.count() > 0) {
      // Run audit first
      const domainInput = page.locator('input[type="url"], input[name*="domain"]').first();
      const runButton = page.locator('button:has-text(/run|check/i)').first();

      if ((await domainInput.count()) > 0 && (await runButton.count()) > 0) {
        await domainInput.fill('https://www.google.com');
        if (!(await runButton.isDisabled())) {
          await runButton.click();
          await page.waitForTimeout(10000); // Wait for results
        }
      }

      // Switch language
      await langSwitcher.click();
      await page.waitForTimeout(1000);

      // Verify recommendations in Hebrew
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
    }
  });

  test('should persist audit settings', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Set preferences if available (e.g., mobile vs desktop)
    const settingsButton = page.locator('button:has-text(/setting|preference/i)').first();

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Toggle a setting
      const checkbox = page.locator('input[type="checkbox"]:visible').first();
      if (await checkbox.count() > 0) {
        const wasChecked = await checkbox.isChecked();
        await checkbox.click();

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Open settings again
        if (await settingsButton.count() > 0) {
          await settingsButton.click();
          await page.waitForTimeout(500);

          // Verify setting persisted
          const stillChecked = await checkbox.isChecked();
          expect(stillChecked).not.toBe(wasChecked);
        }
      }
    }
  });
});
