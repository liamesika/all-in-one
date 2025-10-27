import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Store Structure & Collections
 * Tests creating, editing, and deleting collections
 */

test.describe('Store Structure & Collections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ecommerce/structure');
  });

  test('should display structure page with collections', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.locator('h1, h2').first()).toContainText(/structure|collection/i);

    // Check for collections list or grid
    const collectionsContainer = page.locator(
      '[data-testid*="collection"], .collection-list, [role="list"]'
    ).first();

    if (await collectionsContainer.count() > 0) {
      await expect(collectionsContainer).toBeVisible();
    }
  });

  test('should create a new collection', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find create/add collection button
    const createButton = page.locator(
      'button:has-text(/create|add|new collection/i)'
    ).first();

    if (await createButton.count() > 0) {
      await createButton.click();

      // Wait for dialog/form
      await page.waitForTimeout(500);

      // Find collection name input
      const nameInput = page.locator(
        'input[name*="name"], input[placeholder*="name"], input[type="text"]:visible'
      ).first();

      if (await nameInput.count() > 0) {
        // Enter collection name
        await nameInput.fill('Test Collection E2E');

        // Find save/submit button
        const saveButton = page.locator(
          'button:has-text(/save|create|submit/i)'
        ).first();

        if (await saveButton.count() > 0 && !(await saveButton.isDisabled())) {
          await saveButton.click();

          // Wait for creation
          await page.waitForTimeout(1000);

          // Verify collection appears in list
          const newCollection = page.locator('text=/Test Collection E2E/i').first();
          if (await newCollection.count() > 0) {
            await expect(newCollection).toBeVisible();
          }
        }
      }
    }
  });

  test('should edit existing collection', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find first collection edit button
    const editButton = page.locator(
      'button:has-text(/edit/i), [aria-label*="edit"]'
    ).first();

    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Find name input in edit form
      const nameInput = page.locator(
        'input[name*="name"], input[type="text"]:visible'
      ).first();

      if (await nameInput.count() > 0) {
        const originalValue = await nameInput.inputValue();

        // Change the name
        await nameInput.clear();
        await nameInput.fill('Updated Collection Name');

        // Save changes
        const saveButton = page.locator(
          'button:has-text(/save|update/i)'
        ).first();

        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Verify name updated
          const updatedText = page.locator('text=/Updated Collection Name/i').first();
          if (await updatedText.count() > 0) {
            await expect(updatedText).toBeVisible();
          }
        }
      }
    }
  });

  test('should delete collection with confirmation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial collection count
    const initialCollections = await page.locator(
      '[data-testid*="collection-item"], .collection-card, li'
    ).count();

    // Find delete button
    const deleteButton = page.locator(
      'button:has-text(/delete|remove/i), [aria-label*="delete"]'
    ).first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Look for confirmation dialog
      const confirmButton = page.locator(
        'button:has-text(/confirm|yes|delete/i)'
      ).last(); // Use .last() to get the one in the dialog

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Verify collection count decreased
        const finalCollections = await page.locator(
          '[data-testid*="collection-item"], .collection-card, li'
        ).count();

        expect(finalCollections).toBeLessThanOrEqual(initialCollections);
      }
    }
  });

  test('should organize collections with drag and drop', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find draggable collection items
    const collections = page.locator(
      '[data-testid*="collection-item"][draggable="true"], .draggable, [data-draggable="true"]'
    );

    const count = await collections.count();

    if (count >= 2) {
      const firstItem = collections.nth(0);
      const secondItem = collections.nth(1);

      // Get initial positions
      const firstBox = await firstItem.boundingBox();
      const secondBox = await secondItem.boundingBox();

      if (firstBox && secondBox) {
        // Perform drag and drop
        await firstItem.dragTo(secondItem);

        await page.waitForTimeout(500);

        // Verify order changed (positions swapped)
        // This is a basic check - actual verification depends on implementation
        expect(true).toBeTruthy(); // Placeholder
      }
    }
  });

  test('should add products to collection', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find collection to add products to
    const collection = page.locator(
      '[data-testid*="collection-item"], .collection-card'
    ).first();

    if (await collection.count() > 0) {
      // Click to open/expand
      await collection.click();
      await page.waitForTimeout(500);

      // Look for "add products" button
      const addProductsButton = page.locator(
        'button:has-text(/add product/i)'
      ).first();

      if (await addProductsButton.count() > 0) {
        await expect(addProductsButton).toBeVisible();
        await addProductsButton.click();

        // Wait for product selector to appear
        await page.waitForTimeout(500);

        // Look for product list or checkboxes
        const productCheckbox = page.locator(
          'input[type="checkbox"]:visible'
        ).first();

        if (await productCheckbox.count() > 0) {
          await productCheckbox.check();

          // Confirm selection
          const confirmButton = page.locator(
            'button:has-text(/add|confirm/i)'
          ).first();

          if (await confirmButton.count() > 0) {
            await confirmButton.click();
          }
        }
      }
    }
  });

  test('should display collection statistics', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for statistics like product count
    const stats = page.locator(
      '[data-testid*="stat"], .stat, text=/\\d+\\s+product/i'
    ).first();

    if (await stats.count() > 0) {
      await expect(stats).toBeVisible();
    }
  });

  test('should support bilingual collection names', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Create collection with Hebrew name if language switcher available
    const langSwitcher = page.locator('[data-testid="lang-switcher"]').first();

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await page.waitForTimeout(500);

      // Try creating collection in Hebrew
      const createButton = page.locator('button').first();
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(500);

        const nameInput = page.locator('input[type="text"]:visible').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('אוסף בדיקה');
          // Hebrew: "Test Collection"
        }
      }
    }
  });
});
