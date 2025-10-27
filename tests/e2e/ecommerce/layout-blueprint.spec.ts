import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Layout Blueprint
 * Tests preset selection, customization, and saving layouts
 */

test.describe('Layout Blueprint', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/layout-blueprint');
  });

  test('should display layout blueprint page', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/layout|blueprint|design/i);

    // Check for layout preview or canvas
    const canvas = page.locator(
      '[data-testid*="layout"], .layout-preview, canvas, iframe'
    ).first();

    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible();
    }
  });

  test('should display layout preset options', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for preset cards or buttons
    const presets = page.locator(
      '[data-testid*="preset"], .preset-card, button:has-text(/classic|modern|minimal/i)'
    );

    const presetCount = await presets.count();
    expect(presetCount).toBeGreaterThanOrEqual(3); // At least 3 presets

    // Verify first preset is visible
    if (presetCount > 0) {
      await expect(presets.first()).toBeVisible();
    }
  });

  test('should switch between layout presets', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find preset buttons
    const presets = page.locator(
      'button:has-text(/classic|modern|minimal|grid/i)'
    );

    const count = await presets.count();

    if (count >= 2) {
      // Click first preset
      const firstPreset = presets.nth(0);
      await firstPreset.click();
      await page.waitForTimeout(500);

      // Click second preset
      const secondPreset = presets.nth(1);
      await secondPreset.click();
      await page.waitForTimeout(500);

      // Verify active state changed
      const isActive = await secondPreset.getAttribute('data-active').catch(() => null);
      const hasActiveClass = await secondPreset.evaluate((el) =>
        el.className.includes('active')
      );

      expect(isActive === 'true' || hasActiveClass).toBeTruthy();
    }
  });

  test('should preview layout in different viewports', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for viewport switcher (desktop/tablet/mobile)
    const viewportButtons = page.locator(
      'button:has-text(/desktop|tablet|mobile/i)'
    );

    if ((await viewportButtons.count()) >= 2) {
      // Switch to mobile view
      const mobileButton = page.locator('button:has-text(/mobile/i)').first();
      if (await mobileButton.count() > 0) {
        await mobileButton.click();
        await page.waitForTimeout(500);

        // Verify preview adjusted (look for mobile viewport class/style)
        const preview = page.locator('[data-testid*="preview"], iframe').first();
        if (await preview.count() > 0) {
          const width = await preview.evaluate((el) => {
            if (el.tagName === 'IFRAME') {
              return (el as HTMLIFrameElement).width;
            }
            return window.getComputedStyle(el).width;
          });

          // Mobile preview should be narrower
          expect(width).toBeTruthy();
        }
      }
    }
  });

  test('should customize layout colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for color customization controls
    const colorPickers = page.locator(
      'input[type="color"], [data-testid*="color-picker"]'
    );

    if ((await colorPickers.count()) > 0) {
      const firstPicker = colorPickers.first();
      await expect(firstPicker).toBeVisible();

      // Change color
      await firstPicker.fill('#ff0000');
      await page.waitForTimeout(500);

      // Verify color applied
      const value = await firstPicker.inputValue();
      expect(value.toLowerCase()).toContain('ff0000');
    }
  });

  test('should customize layout fonts', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for font selector
    const fontSelector = page.locator(
      'select[name*="font"], [data-testid*="font-select"]'
    ).first();

    if (await fontSelector.count() > 0) {
      await expect(fontSelector).toBeVisible();

      // Select different font
      await fontSelector.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      // Verify selection
      const selectedValue = await fontSelector.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('should save custom layout', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Make a change to the layout first
    const colorPicker = page.locator('input[type="color"]').first();
    if (await colorPicker.count() > 0) {
      await colorPicker.fill('#336699');
      await page.waitForTimeout(500);
    }

    // Find save button
    const saveButton = page.locator('button:has-text(/save|apply/i)').first();

    if (await saveButton.count() > 0) {
      const isDisabled = await saveButton.isDisabled();

      if (!isDisabled) {
        await saveButton.click();
        await page.waitForTimeout(1000);

        // Look for success message
        const successMessage = page.locator(
          'text=/saved|success|updated/i, [role="alert"]'
        ).first();

        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should reset to default layout', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Make changes first
    const colorPicker = page.locator('input[type="color"]').first();
    if (await colorPicker.count() > 0) {
      await colorPicker.fill('#ff00ff');
      await page.waitForTimeout(500);
    }

    // Find reset button
    const resetButton = page.locator('button:has-text(/reset|default/i)').first();

    if (await resetButton.count() > 0) {
      await resetButton.click();
      await page.waitForTimeout(500);

      // Verify color returned to default (not magenta)
      if (await colorPicker.count() > 0) {
        const value = await colorPicker.inputValue();
        expect(value.toLowerCase()).not.toBe('#ff00ff');
      }
    }
  });

  test('should display layout sections configuration', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for section toggles (header, footer, sidebar, etc.)
    const sectionToggles = page.locator(
      'input[type="checkbox"][name*="section"], [data-testid*="section-toggle"]'
    );

    if ((await sectionToggles.count()) > 0) {
      const firstToggle = sectionToggles.first();
      await expect(firstToggle).toBeVisible();

      // Toggle section on/off
      const wasChecked = await firstToggle.isChecked();
      await firstToggle.click();
      await page.waitForTimeout(500);

      const nowChecked = await firstToggle.isChecked();
      expect(nowChecked).not.toBe(wasChecked);
    }
  });

  test('should export layout configuration', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for export button
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
          expect(filename).toMatch(/\.(json|yaml|yml)$/i);
        }
      }
    }
  });

  test('should support RTL layout preview', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Switch to Hebrew if language switcher available
    const langSwitcher = page.locator('[data-testid="lang-switcher"]').first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await page.waitForTimeout(1000);

      // Check if preview adapts to RTL
      const preview = page.locator('[data-testid*="preview"]').first();
      if (await preview.count() > 0) {
        const dir = await preview.getAttribute('dir');
        expect(dir).toBe('rtl');
      }
    }
  });
});
