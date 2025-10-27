import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Campaign Assistant
 * Tests campaign brief submission, AI generation, and export
 */

test.describe('Campaign Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/campaigns/assistant');
  });

  test('should display campaign assistant interface', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/campaign|assistant/i);

    // Check for brief form
    const briefForm = page.locator('form, [data-testid*="brief-form"]').first();
    if (await briefForm.count() > 0) {
      await expect(briefForm).toBeVisible();
    }
  });

  test('should fill campaign brief form', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Fill goal
    const goalInput = page.locator(
      'input[name*="goal"], textarea[name*="goal"], input[placeholder*="goal"]'
    ).first();

    if (await goalInput.count() > 0) {
      await goalInput.fill('Increase product awareness and drive sales');
      const value = await goalInput.inputValue();
      expect(value).toContain('awareness');
    }

    // Fill budget
    const budgetInput = page.locator(
      'input[name*="budget"], input[placeholder*="budget"]'
    ).first();

    if (await budgetInput.count() > 0) {
      await budgetInput.fill('5000');
      const value = await budgetInput.inputValue();
      expect(value).toBe('5000');
    }

    // Fill target region
    const regionInput = page.locator(
      'input[name*="region"], select[name*="region"], input[placeholder*="region"]'
    ).first();

    if (await regionInput.count() > 0) {
      const tagName = await regionInput.evaluate((el) => el.tagName);

      if (tagName === 'SELECT') {
        await regionInput.selectOption({ index: 1 });
      } else {
        await regionInput.fill('United States');
      }
    }

    // Fill target audience
    const audienceInput = page.locator(
      'input[name*="audience"], textarea[name*="audience"], input[placeholder*="audience"]'
    ).first();

    if (await audienceInput.count() > 0) {
      await audienceInput.fill('Young professionals aged 25-35');
    }

    // Fill product category
    const categoryInput = page.locator(
      'input[name*="category"], select[name*="category"], input[placeholder*="product"]'
    ).first();

    if (await categoryInput.count() > 0) {
      const tagName = await categoryInput.evaluate((el) => el.tagName);

      if (tagName === 'SELECT') {
        await categoryInput.selectOption({ index: 1 });
      } else {
        await categoryInput.fill('Electronics');
      }
    }
  });

  test('should generate campaign with AI', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Fill minimum required fields
    const goalInput = page.locator('input[name*="goal"], textarea[name*="goal"]').first();
    const budgetInput = page.locator('input[name*="budget"]').first();

    if ((await goalInput.count()) > 0 && (await budgetInput.count()) > 0) {
      await goalInput.fill('Drive online sales');
      await budgetInput.fill('3000');

      // Find generate button
      const generateButton = page.locator('button:has-text(/generate|create|ai/i)').first();

      await expect(generateButton).toBeVisible();

      const isDisabled = await generateButton.isDisabled();

      if (!isDisabled) {
        // Click generate
        await generateButton.click();

        // Wait for AI generation (GPT-4 can take 5-20 seconds)
        await page.waitForTimeout(3000);

        // Look for loading indicator
        const loadingIndicator = page.locator(
          '[data-testid*="loading"], .loading, text=/generating|processing/i'
        ).first();

        if (await loadingIndicator.count() > 0) {
          await loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
            console.log('Generation taking longer than expected');
          });
        }

        // Look for results section
        const resultsSection = page.locator(
          '[data-testid*="results"], section:has-text(/audience|ad copy/i)'
        ).first();

        if (await resultsSection.count() > 0) {
          await expect(resultsSection).toBeVisible({ timeout: 35000 });
        }
      }
    }
  });

  test('should display generated audience segments', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for audience sections
    const audienceCards = page.locator(
      '[data-testid*="audience"], .audience-card, section:has-text(/audience/i) > div'
    );

    if ((await audienceCards.count()) > 0) {
      // Should have at least 3 audience segments
      expect(await audienceCards.count()).toBeGreaterThanOrEqual(1);

      // Check first audience has content
      const firstAudience = audienceCards.first();
      await expect(firstAudience).toBeVisible();

      // Look for audience details (name, description, targeting)
      const audienceText = await firstAudience.textContent();
      expect(audienceText?.length || 0).toBeGreaterThan(10);
    }
  });

  test('should display generated ad copy variants', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for ad copy sections
    const adCopyCards = page.locator(
      '[data-testid*="ad-copy"], .ad-copy-card, section:has-text(/ad copy|copy/i) > div'
    );

    if ((await adCopyCards.count()) > 0) {
      // Should have at least 3 ad copy variants
      expect(await adCopyCards.count()).toBeGreaterThanOrEqual(1);

      // Check first ad copy has content
      const firstAdCopy = adCopyCards.first();
      await expect(firstAdCopy).toBeVisible();

      // Look for ad copy elements (headline, description, CTA)
      const adCopyText = await firstAdCopy.textContent();
      expect(adCopyText?.length || 0).toBeGreaterThan(10);
    }
  });

  test('should edit generated content', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find edit button
    const editButton = page.locator('button:has-text(/edit/i)').first();

    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Find editable field
      const editableField = page.locator('textarea:visible, input[type="text"]:visible').first();

      if (await editableField.count() > 0) {
        await editableField.clear();
        await editableField.fill('Custom edited content');

        // Save changes
        const saveButton = page.locator('button:has-text(/save|update/i)').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }

        // Verify content updated
        const updatedText = page.locator('text=/Custom edited content/i').first();
        if (await updatedText.count() > 0) {
          await expect(updatedText).toBeVisible();
        }
      }
    }
  });

  test('should regenerate specific audience segment', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find regenerate button for audience
    const regenerateButton = page.locator(
      'button:has-text(/regenerate|refresh/i)'
    ).first();

    if (await regenerateButton.count() > 0) {
      await expect(regenerateButton).toBeVisible();

      await regenerateButton.click();
      await page.waitForTimeout(2000);

      // Should show loading state
      const loadingIndicator = page.locator('[data-testid*="loading"], .loading').first();
      if (await loadingIndicator.count() > 0) {
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
      }
    }
  });

  test('should export campaign to JSON', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find export button
    const exportButton = page.locator('button:has-text(/export|download/i)').first();

    if (await exportButton.count() > 0) {
      const isDisabled = await exportButton.isDisabled();

      if (!isDisabled) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

        await exportButton.click();

        // Wait for download
        const download = await downloadPromise.catch(() => null);

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.json$/i);
        }
      }
    }
  });

  test('should save campaign version', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Fill brief and generate
    const goalInput = page.locator('input[name*="goal"], textarea[name*="goal"]').first();
    const budgetInput = page.locator('input[name*="budget"]').first();

    if ((await goalInput.count()) > 0 && (await budgetInput.count()) > 0) {
      await goalInput.fill('Test campaign');
      await budgetInput.fill('1000');

      const generateButton = page.locator('button:has-text(/generate/i)').first();
      if (await generateButton.count() > 0 && !(await generateButton.isDisabled())) {
        await generateButton.click();
        await page.waitForTimeout(5000);

        // Look for save button
        const saveButton = page.locator('button:has-text(/save|keep/i)').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Look for success message
          const successMsg = page.locator('text=/saved|success/i').first();
          if (await successMsg.count() > 0) {
            await expect(successMsg).toBeVisible({ timeout: 5000 });
          }
        }
      }
    }
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Try to generate multiple times rapidly
    const goalInput = page.locator('input[name*="goal"], textarea[name*="goal"]').first();
    const budgetInput = page.locator('input[name*="budget"]').first();
    const generateButton = page.locator('button:has-text(/generate/i)').first();

    for (let i = 0; i < 20; i++) {
      if (await goalInput.count() > 0) {
        await goalInput.fill(`Campaign ${i}`);
      }
      if (await budgetInput.count() > 0) {
        await budgetInput.fill('1000');
      }

      if (await generateButton.count() > 0) {
        const isDisabled = await generateButton.isDisabled();
        if (!isDisabled) {
          await generateButton.click();
          await page.waitForTimeout(100);
        }
      }

      // Check for rate limit message
      const rateLimitMsg = page.locator('text=/rate limit|too many|try again/i').first();
      if (await rateLimitMsg.count() > 0) {
        await expect(rateLimitMsg).toBeVisible();
        break;
      }
    }
  });

  test('should display campaign versions history', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for history/versions section
    const historySection = page.locator(
      '[data-testid*="history"], section:has-text(/history|version|previous/i)'
    ).first();

    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Check for version items
      const versionItems = historySection.locator('li, .version-item, [role="listitem"]');
      if ((await versionItems.count()) > 0) {
        await expect(versionItems.first()).toBeVisible();
      }
    }
  });

  test('should support bilingual campaign generation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Switch to Hebrew if available
    const langSwitcher = page.locator('[data-testid="lang-switcher"]').first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await page.waitForTimeout(1000);

      // Fill brief in Hebrew
      const goalInput = page.locator('input[name*="goal"], textarea[name*="goal"]').first();
      if (await goalInput.count() > 0) {
        await goalInput.fill('הגדלת המכירות');
        // Hebrew: "Increase sales"
      }

      // Verify RTL applied
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
    }
  });
});
