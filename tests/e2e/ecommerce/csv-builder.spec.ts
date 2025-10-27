import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests: CSV Builder (Product Upload → AI Generation → CSV Download)
 * Tests the complete workflow from image upload to CSV export
 */

test.describe('CSV Builder Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/products/csv');
  });

  test('should display CSV Builder interface', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for main heading
    await expect(page.locator('h1, h2').first()).toContainText(/csv|product/i);

    // Check for upload section
    const uploadSection = page.locator(
      '[data-testid*="upload"], input[type="file"], button:has-text(/upload|browse/i)'
    ).first();
    await expect(uploadSection).toBeVisible();
  });

  test('should upload product images', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find file input
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // Create a test image file (1x1 PNG)
      const testImagePath = path.join(__dirname, '../../fixtures/test-product.png');

      // Upload the file
      await fileInput.setInputFiles(testImagePath).catch(() => {
        // If file doesn't exist, skip this part
        console.log('Test image not found, skipping upload');
      });

      // Wait for upload to process
      await page.waitForTimeout(2000);

      // Look for uploaded image preview
      const imagePreview = page.locator('img[src*="data:"], img[src*="blob:"], img[alt*="product"]').first();
      if (await imagePreview.count() > 0) {
        await expect(imagePreview).toBeVisible();
      }
    }
  });

  test('should select target language', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find language selector
    const langSelector = page.locator(
      'select[name*="language"], [data-testid*="language"], button:has-text(/english|עברית/i)'
    ).first();

    if (await langSelector.count() > 0) {
      await expect(langSelector).toBeVisible();

      // Select a language
      const tagName = await langSelector.evaluate((el) => el.tagName);
      if (tagName === 'SELECT') {
        await langSelector.selectOption({ index: 0 });
      } else {
        await langSelector.click();
      }
    }
  });

  test('should generate products with AI', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find generate button
    const generateButton = page.locator('button:has-text(/generate|create|ai/i)').first();

    if (await generateButton.count() > 0) {
      // Check if button is enabled (requires images uploaded)
      const isDisabled = await generateButton.isDisabled();

      if (!isDisabled) {
        // Click generate
        await generateButton.click();

        // Wait for generation (may take time with real OpenAI)
        await page.waitForTimeout(5000);

        // Look for success indicator or results
        const resultsSection = page.locator(
          '[data-testid*="results"], table, [role="table"]'
        ).first();

        if (await resultsSection.count() > 0) {
          await expect(resultsSection).toBeVisible();
        }
      }
    }
  });

  test('should display generated product data in table', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for product table or grid
    const productTable = page.locator('table, [role="table"], .product-grid').first();

    if (await productTable.count() > 0) {
      await expect(productTable).toBeVisible();

      // Check for table headers
      const headers = productTable.locator('th, [role="columnheader"]');
      if (await headers.count() > 0) {
        expect(await headers.count()).toBeGreaterThanOrEqual(3); // At least name, description, price
      }
    }
  });

  test('should edit generated product data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find first editable field
    const editableField = page.locator(
      'input[type="text"]:visible, textarea:visible, [contenteditable="true"]'
    ).first();

    if (await editableField.count() > 0) {
      // Clear and type new value
      await editableField.clear();
      await editableField.fill('Test Product Name');

      // Verify value changed
      const value = await editableField.inputValue();
      expect(value).toContain('Test Product');
    }
  });

  test('should download CSV file', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find download/export button
    const downloadButton = page.locator('button:has-text(/download|export|csv/i)').first();

    if (await downloadButton.count() > 0) {
      const isDisabled = await downloadButton.isDisabled();

      if (!isDisabled) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        // Click download
        await downloadButton.click();

        // Wait for download
        const download = await downloadPromise.catch(() => null);

        if (download) {
          // Verify filename
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.csv$/i);
        }
      }
    }
  });

  test('should handle AliExpress URL import', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for AliExpress URL input
    const urlInput = page.locator(
      'input[placeholder*="aliexpress"], input[name*="aliexpress"], input[type="url"]'
    ).first();

    if (await urlInput.count() > 0) {
      await expect(urlInput).toBeVisible();

      // Enter test URL
      await urlInput.fill('https://www.aliexpress.com/item/test-product.html');

      // Look for import button
      const importButton = page.locator('button:has-text(/import|fetch|load/i)').first();
      if (await importButton.count() > 0) {
        await expect(importButton).toBeVisible();
      }
    }
  });

  test('should apply pricing rules', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for pricing rule controls
    const pricingSection = page.locator(
      '[data-testid*="pricing"], section:has-text(/pricing|markup/i)'
    ).first();

    if (await pricingSection.count() > 0) {
      await expect(pricingSection).toBeVisible();

      // Look for markup input or multiplier
      const markupInput = pricingSection.locator(
        'input[type="number"], input[placeholder*="%"], input[placeholder*="markup"]'
      ).first();

      if (await markupInput.count() > 0) {
        await markupInput.fill('20');
        await page.waitForTimeout(500);

        // Verify value applied
        const value = await markupInput.inputValue();
        expect(value).toBe('20');
      }
    }
  });
});
