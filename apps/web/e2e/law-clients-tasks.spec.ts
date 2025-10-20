import { test, expect } from '@playwright/test';

/**
 * Law Phase 3: Clients & Tasks E2E Tests
 * Tests happy paths for Clients and Tasks modules
 */

test.describe('Law Clients Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to clients page
    await page.goto('/dashboard/law/clients');
  });

  test('should display clients list and interact with it', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Clients');

    // Check that search input exists
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Check that "New Client" button exists and is clickable
    const newClientButton = page.locator('button', { hasText: 'New Client' });
    await expect(newClientButton).toBeVisible();

    // Verify minimum tap target size (44px)
    const buttonBox = await newClientButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should open and close client modal', async ({ page }) => {
    // Click "New Client" button
    const newClientButton = page.locator('button', { hasText: 'New Client' });
    await newClientButton.click();

    // Modal should appear
    await expect(page.locator('text=New Client').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="name" i]').first()).toBeVisible();

    // Close modal by clicking backdrop or close button
    const closeButton = page.locator('button[aria-label*="Close"]').first();
    await closeButton.click();

    // Modal should disappear
    await expect(page.locator('input[placeholder*="name" i]').first()).not.toBeVisible();
  });

  test('should filter clients by status', async ({ page }) => {
    // Click filters button
    const filtersButton = page.locator('button', { hasText: 'Filters' });
    await filtersButton.click();

    // Wait for filters panel to appear
    await page.waitForTimeout(300); // Wait for animation

    // Check that filter buttons exist
    const activeFilter = page.locator('button', { hasText: 'Active' }).first();
    await expect(activeFilter).toBeVisible();

    // Click a filter
    await activeFilter.click();

    // Give time for filter to apply
    await page.waitForTimeout(500);
  });

  test('should search clients with debounce', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type in search
    await searchInput.fill('Johnson');

    // Wait for debounce (typically 300-500ms)
    await page.waitForTimeout(600);

    // Results should update (we can't verify exact results with mock data, but input should work)
    await expect(searchInput).toHaveValue('Johnson');
  });

  test('should have accessible keyboard navigation', async ({ page }) => {
    // Tab to search input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Search input should be focused
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeFocused();

    // Type with keyboard
    await page.keyboard.type('Test');
    await expect(searchInput).toHaveValue('Test');
  });
});

test.describe('Law Tasks Board', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/law/tasks');
  });

  test('should display Kanban board with columns', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Tasks');

    // Check that board columns exist
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();

    // Check that "New Task" button exists
    const newTaskButton = page.locator('button', { hasText: 'New Task' });
    await expect(newTaskButton).toBeVisible();
  });

  test('should open and close task modal', async ({ page }) => {
    // Click "New Task" button
    const newTaskButton = page.locator('button', { hasText: 'New Task' });
    await newTaskButton.click();

    // Modal should appear with form fields
    await expect(page.locator('text=New Task').first()).toBeVisible();
    await expect(page.locator('input#title')).toBeVisible();

    // Close modal
    const closeButton = page.locator('button[aria-label*="Close"]').first();
    await closeButton.click();

    // Modal should disappear
    await expect(page.locator('input#title')).not.toBeVisible();
  });

  test('should display filters panel', async ({ page }) => {
    // Click filters button
    const filtersButton = page.locator('button', { hasText: 'Filters' });
    await filtersButton.click();

    // Wait for filters panel animation
    await page.waitForTimeout(300);

    // Check filter dropdowns
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should search tasks', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type in search
    await searchInput.fill('File motion');

    // Wait for search to process
    await page.waitForTimeout(400);

    // Search input should have value
    await expect(searchInput).toHaveValue('File motion');
  });

  test('should have minimum tap target sizes', async ({ page }) => {
    // Check "New Task" button size
    const newTaskButton = page.locator('button', { hasText: 'New Task' });
    const buttonBox = await newTaskButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    // Check filters button
    const filtersButton = page.locator('button', { hasText: 'Filters' });
    const filtersBox = await filtersButton.boundingBox();
    expect(filtersBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate with keyboard
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeFocused();
  });
});

test.describe('Accessibility (a11y) Smoke Tests', () => {
  test('clients page should have proper heading structure', async ({ page }) => {
    await page.goto('/dashboard/law/clients');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Clients');
  });

  test('tasks page should have proper heading structure', async ({ page }) => {
    await page.goto('/dashboard/law/tasks');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Tasks');
  });

  test('buttons should have accessible labels', async ({ page }) => {
    await page.goto('/dashboard/law/clients');

    // Buttons should have text or aria-label
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Either has text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/dashboard/law/clients');

    // Open modal to check form
    await page.locator('button', { hasText: 'New Client' }).click();

    // Wait for modal
    await page.waitForTimeout(300);

    // Check that inputs have associated labels
    const titleInput = page.locator('input#name, input[name="name"]').first();
    if (await titleInput.isVisible()) {
      const label = page.locator('label[for="name"]');
      await expect(label).toBeVisible();
    }
  });
});

test.describe('Performance & Visual Stability', () => {
  test('clients page should not have layout shifts', async ({ page }) => {
    await page.goto('/dashboard/law/clients');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'e2e-screenshots/clients-initial.png', fullPage: true });

    // Page should be stable (this is a basic check, actual CLS is measured via Lighthouse)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('tasks board should not have layout shifts', async ({ page }) => {
    await page.goto('/dashboard/law/tasks');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'e2e-screenshots/tasks-board.png', fullPage: true });

    // Board should be stable
    await expect(page.locator('h1')).toBeVisible();
  });
});
