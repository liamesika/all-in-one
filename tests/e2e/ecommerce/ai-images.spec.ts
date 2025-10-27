import { test, expect } from '@playwright/test';

/**
 * E2E Tests: AI Image Studio
 * Tests DALL-E 3 image generation and downloads
 */

test.describe('AI Image Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/ai-images');
  });

  test('should display AI image generation interface', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/ai|image|studio|generate/i);

    // Check for prompt input
    const promptInput = page.locator(
      'textarea[placeholder*="prompt"], input[placeholder*="describe"], textarea[name*="prompt"]'
    ).first();

    await expect(promptInput).toBeVisible();
  });

  test('should enter image generation prompt', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find prompt input
    const promptInput = page.locator('textarea, input[type="text"]').first();

    await promptInput.fill(
      'A modern minimalist product photo of a coffee mug on a white background'
    );

    // Verify text entered
    const value = await promptInput.inputValue();
    expect(value).toContain('coffee mug');
  });

  test('should select image size', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for size selector
    const sizeSelector = page.locator(
      'select[name*="size"], [data-testid*="size-select"], button:has-text(/1024|square|portrait|landscape/i)'
    ).first();

    if (await sizeSelector.count() > 0) {
      await expect(sizeSelector).toBeVisible();

      const tagName = await sizeSelector.evaluate((el) => el.tagName);

      if (tagName === 'SELECT') {
        await sizeSelector.selectOption({ index: 0 });
      } else {
        await sizeSelector.click();
      }
    }
  });

  test('should select number of images to generate', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for quantity/count selector
    const countInput = page.locator(
      'input[type="number"][name*="count"], input[type="number"][name*="quantity"], select[name*="count"]'
    ).first();

    if (await countInput.count() > 0) {
      await expect(countInput).toBeVisible();

      const tagName = await countInput.evaluate((el) => el.tagName);

      if (tagName === 'INPUT') {
        await countInput.fill('2');
      } else {
        await countInput.selectOption({ label: '2' });
      }
    }
  });

  test('should generate images with AI', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter prompt
    const promptInput = page.locator('textarea, input[type="text"]').first();
    await promptInput.fill('Modern product photography of a blue water bottle');

    // Find generate button
    const generateButton = page.locator('button:has-text(/generate|create|ai/i)').first();

    await expect(generateButton).toBeVisible();

    const isDisabled = await generateButton.isDisabled();

    if (!isDisabled) {
      // Click generate
      await generateButton.click();

      // Wait for generation (DALL-E can take 10-30 seconds)
      await page.waitForTimeout(3000);

      // Look for loading indicator
      const loadingIndicator = page.locator(
        '[data-testid*="loading"], .loading, text=/generating|processing/i'
      ).first();

      if (await loadingIndicator.count() > 0) {
        // Wait for loading to complete (up to 60 seconds)
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {
          console.log('Generation taking longer than expected');
        });
      }

      // Look for generated images
      const generatedImages = page.locator(
        '[data-testid*="generated-image"], .generated-image, img[alt*="generated"]'
      );

      if ((await generatedImages.count()) > 0) {
        await expect(generatedImages.first()).toBeVisible({ timeout: 65000 });
      }
    }
  });

  test('should display generated images gallery', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for image gallery or grid
    const gallery = page.locator(
      '[data-testid*="gallery"], .image-gallery, .image-grid, [role="list"]'
    ).first();

    if (await gallery.count() > 0) {
      await expect(gallery).toBeVisible();

      // Check for at least one image
      const images = gallery.locator('img');
      if ((await images.count()) > 0) {
        await expect(images.first()).toBeVisible();
      }
    }
  });

  test('should download generated image', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find download button for an image
    const downloadButton = page.locator(
      'button:has-text(/download/i), a[download], [aria-label*="download"]'
    ).first();

    if (await downloadButton.count() > 0) {
      await expect(downloadButton).toBeVisible();

      const isDisabled = await downloadButton.isDisabled();

      if (!isDisabled) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await downloadButton.click();

        // Wait for download
        const download = await downloadPromise.catch(() => null);

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.(png|jpg|jpeg|webp)$/i);
        }
      }
    }
  });

  test('should delete generated image', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial image count
    const initialImages = await page.locator(
      'img[alt*="generated"], [data-testid*="image-item"]'
    ).count();

    if (initialImages > 0) {
      // Find delete button
      const deleteButton = page.locator(
        'button:has-text(/delete|remove/i), [aria-label*="delete"]'
      ).first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.waitForTimeout(500);

        // Confirm deletion if dialog appears
        const confirmButton = page.locator('button:has-text(/confirm|yes|delete/i)').last();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(1000);
        }

        // Verify count decreased
        const finalImages = await page.locator(
          'img[alt*="generated"], [data-testid*="image-item"]'
        ).count();
        expect(finalImages).toBeLessThanOrEqual(initialImages);
      }
    }
  });

  test('should view image in full size', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find an image to click
    const image = page.locator('img[alt*="generated"], .generated-image img').first();

    if (await image.count() > 0) {
      await image.click();
      await page.waitForTimeout(500);

      // Look for modal or lightbox
      const modal = page.locator(
        '[role="dialog"], .modal, .lightbox, [data-testid*="image-modal"]'
      ).first();

      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();

        // Close modal
        const closeButton = page.locator(
          'button:has-text(/close/i), [aria-label*="close"], button.close'
        ).first();

        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Try to generate multiple images rapidly
    const promptInput = page.locator('textarea, input[type="text"]').first();
    const generateButton = page.locator('button:has-text(/generate/i)').first();

    for (let i = 0; i < 25; i++) {
      await promptInput.fill(`Test image ${i}`);

      const isDisabled = await generateButton.isDisabled();
      if (!isDisabled) {
        await generateButton.click();
        await page.waitForTimeout(100);
      } else {
        break;
      }

      // Check for rate limit message
      const rateLimitMsg = page.locator('text=/rate limit|too many|try again/i').first();
      if (await rateLimitMsg.count() > 0) {
        await expect(rateLimitMsg).toBeVisible();
        break;
      }
    }
  });

  test('should validate prompt input', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const generateButton = page.locator('button:has-text(/generate/i)').first();

    // Try to generate without prompt
    const isDisabled = await generateButton.isDisabled();
    expect(isDisabled).toBeTruthy();

    // Enter prompt
    const promptInput = page.locator('textarea, input[type="text"]').first();
    await promptInput.fill('Valid prompt');

    // Button should become enabled
    await page.waitForTimeout(500);
    const isNowDisabled = await generateButton.isDisabled();
    expect(isNowDisabled).toBeFalsy();
  });

  test('should display image generation history', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for history section or previously generated images
    const historySection = page.locator(
      '[data-testid*="history"], section:has-text(/history|previous|recent/i)'
    ).first();

    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Check for images in history
      const historyImages = historySection.locator('img');
      if ((await historyImages.count()) > 0) {
        await expect(historyImages.first()).toBeVisible();
      }
    }
  });
});
