import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Law Cases CRUD
 * Tests: Create → Edit → Delete flow
 * Also tests: Filters, Sort, Search, Keyboard Navigation, Accessibility
 */

test.describe('Law Cases CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cases page before each test
    await page.goto('/dashboard/law/cases');
    await expect(page).toHaveTitle(/Cases/i);
  });

  test('should display cases list page with correct elements', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('Cases');

    // Check action buttons
    await expect(page.getByRole('button', { name: /new case/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();

    // Check search input
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: /title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /priority/i })).toBeVisible();
  });

  test('should create a new case successfully', async ({ page }) => {
    // Click "New Case" button
    await page.getByRole('button', { name: /new case/i }).click();

    // Modal should open
    await expect(page.getByRole('heading', { name: /create case/i })).toBeVisible();

    // Fill in required fields
    await page.getByLabel(/title/i).fill('Test Case - E2E Automation');
    await page.getByLabel(/case type/i).selectOption('litigation');
    await page.getByLabel(/client name/i).fill('John Doe');
    await page.getByLabel(/client email/i).fill('john.doe@test.com');
    await page.getByLabel(/assigned attorney/i).selectOption({ index: 1 });
    await page.getByLabel(/filing date/i).fill('2024-01-25');

    // Submit form
    await page.getByRole('button', { name: /create case/i }).click();

    // Wait for success and modal close
    await expect(page.getByRole('heading', { name: /create case/i })).not.toBeVisible({
      timeout: 3000,
    });

    // Verify case appears in list
    await expect(page.getByText('Test Case - E2E Automation')).toBeVisible();
  });

  test('should edit an existing case', async ({ page }) => {
    // Assuming there's at least one case in the list
    // Click the first edit button
    const editButton = page.locator('button[aria-label*="edit"]').first();
    await editButton.click();

    // Modal should open in edit mode
    await expect(page.getByRole('heading', { name: /edit case/i })).toBeVisible();

    // Update title
    const titleInput = page.getByLabel(/title/i);
    await titleInput.clear();
    await titleInput.fill('Updated Case Title - E2E');

    // Update priority
    await page.getByLabel(/priority/i).selectOption('high');

    // Submit
    await page.getByRole('button', { name: /update case/i }).click();

    // Wait for modal close
    await expect(page.getByRole('heading', { name: /edit case/i })).not.toBeVisible({
      timeout: 3000,
    });

    // Verify updated title appears
    await expect(page.getByText('Updated Case Title - E2E')).toBeVisible();
  });

  test('should delete a case with confirmation', async ({ page }) => {
    // Count initial cases
    const initialCount = await page.locator('tbody tr').count();

    // Click delete button on first case
    const deleteButton = page.locator('button[aria-label*="delete"]').first();
    await deleteButton.click();

    // Confirmation modal should appear
    await expect(page.getByRole('heading', { name: /delete case/i })).toBeVisible();
    await expect(page.getByText(/this action cannot be undone/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /delete case/i }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify case count decreased
    const newCount = await page.locator('tbody tr').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should filter cases by status', async ({ page }) => {
    // Open filters
    await page.getByRole('button', { name: /filters/i }).click();

    // Select "Active" status filter
    await page.locator('select[name="status"]').selectOption('active');

    // Apply filters (if there's an apply button, otherwise it's automatic)
    await page.waitForTimeout(500);

    // Verify only active cases are shown
    const statusBadges = page.locator('[data-testid="case-status-badge"]');
    const count = await statusBadges.count();
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText(/active/i);
    }
  });

  test('should search cases by title', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Smith');

    // Wait for search debounce
    await page.waitForTimeout(600);

    // Verify only matching cases are shown
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).textContent();
        expect(text?.toLowerCase()).toContain('smith');
      }
    }
  });

  test('should sort cases by title ascending and descending', async ({ page }) => {
    // Click title column header to sort ascending
    await page.getByRole('columnheader', { name: /title/i }).click();

    // Wait for sort
    await page.waitForTimeout(300);

    // Get all titles
    const titles = await page.locator('tbody tr td:first-child').allTextContents();

    // Verify ascending order
    const sortedAsc = [...titles].sort();
    expect(titles).toEqual(sortedAsc);

    // Click again to sort descending
    await page.getByRole('columnheader', { name: /title/i }).click();
    await page.waitForTimeout(300);

    // Get titles again
    const titlesDesc = await page.locator('tbody tr td:first-child').allTextContents();

    // Verify descending order
    const sortedDesc = [...titlesDesc].sort().reverse();
    expect(titlesDesc).toEqual(sortedDesc);
  });

  test('should navigate to case detail page', async ({ page }) => {
    // Click on first case title (or view button)
    const viewButton = page.locator('button[aria-label*="view"]').first();
    await viewButton.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/dashboard\/law\/cases\/[^/]+$/);

    // Check detail page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();

    // Check tabs
    await expect(page.getByRole('button', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /documents/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tasks/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /notes/i })).toBeVisible();
  });

  test('should switch tabs on case detail page', async ({ page }) => {
    // Navigate to a case detail page
    await page.goto('/dashboard/law/cases/1');

    // Click Documents tab
    await page.getByRole('button', { name: /documents/i }).click();
    await expect(page.getByRole('heading', { name: /case documents/i })).toBeVisible();

    // Click Tasks tab
    await page.getByRole('button', { name: /tasks/i }).click();
    await expect(page.getByRole('heading', { name: /case tasks/i })).toBeVisible();

    // Click Notes tab
    await page.getByRole('button', { name: /notes/i }).click();
    await expect(page.getByRole('heading', { name: /case notes/i })).toBeVisible();

    // Click back to Overview
    await page.getByRole('button', { name: /overview/i }).click();
    await expect(page.getByRole('heading', { name: /case information/i })).toBeVisible();
  });

  test('should support keyboard navigation in modal', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /new case/i }).click();

    // Tab through form fields
    await page.keyboard.press('Tab'); // Focus first field
    await page.keyboard.type('Keyboard Test Case');

    await page.keyboard.press('Tab'); // Next field
    await page.keyboard.press('Tab'); // Next field

    // ESC should close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: /create case/i })).not.toBeVisible();
  });

  test('should be accessible (basic a11y checks)', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    // Check all buttons have accessible names
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }

    // Check form inputs have labels (when modal is open)
    await page.getByRole('button', { name: /new case/i }).click();
    const inputs = await page.locator('input[type="text"], input[type="email"], select').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  });

  test('should display empty state when no cases exist', async ({ page }) => {
    // This test assumes ability to clear all cases or navigate to empty state
    // For mock API, we might need to intercept and return empty array
    await page.route('**/api/law/cases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cases: [], total: 0 }),
      });
    });

    await page.reload();

    // Check for empty state
    await expect(page.getByText(/no cases/i)).toBeVisible();
    await expect(page.getByText(/create your first case/i)).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/law/cases', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      } else {
        await route.continue();
      }
    });

    // Try to create a case
    await page.getByRole('button', { name: /new case/i }).click();
    await page.getByLabel(/title/i).fill('Error Test Case');
    await page.getByRole('button', { name: /create case/i }).click();

    // Should show error message (toast or inline)
    // Adjust selector based on your error display method
    await expect(page.getByText(/failed/i).or(page.getByText(/error/i))).toBeVisible({
      timeout: 3000,
    });
  });

  test('complete CRUD flow: create → edit → delete', async ({ page }) => {
    // Step 1: Create
    await page.getByRole('button', { name: /new case/i }).click();
    await page.getByLabel(/title/i).fill('Complete CRUD Flow Test');
    await page.getByLabel(/client name/i).fill('Test Client');
    await page.getByRole('button', { name: /create case/i }).click();

    await expect(page.getByText('Complete CRUD Flow Test')).toBeVisible({ timeout: 3000 });

    // Step 2: Edit
    const editBtn = page.locator('button[aria-label*="edit"]', {
      has: page.locator(':text("Complete CRUD Flow Test")'),
    });
    await editBtn.click();

    await page.getByLabel(/title/i).clear();
    await page.getByLabel(/title/i).fill('Complete CRUD Flow Test - Updated');
    await page.getByRole('button', { name: /update case/i }).click();

    await expect(page.getByText('Complete CRUD Flow Test - Updated')).toBeVisible({
      timeout: 3000,
    });

    // Step 3: Delete
    const deleteBtn = page.locator('button[aria-label*="delete"]', {
      has: page.locator(':text("Complete CRUD Flow Test - Updated")'),
    });
    await deleteBtn.click();

    await page.getByRole('button', { name: /delete case/i }).click();

    await expect(page.getByText('Complete CRUD Flow Test - Updated')).not.toBeVisible({
      timeout: 3000,
    });
  });
});
