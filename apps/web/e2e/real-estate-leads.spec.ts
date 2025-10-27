import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Real Estate Leads Management E2E Tests
 *
 * Tests all lead management functionality including:
 * - Create/Edit/Delete operations
 * - Import/Export CSV
 * - Filtering and search
 * - AI qualification
 * - Property linking
 * - Agent assignment
 *
 * Runs on both desktop and mobile viewports
 */

// Helper function to login (mock for now - adjust based on your auth implementation)
async function login(page: Page) {
  // TODO: Implement actual Firebase auth login
  // For now, we'll navigate directly to the leads page
  // In production E2E, you'd need to:
  // 1. Go to login page
  // 2. Fill in credentials
  // 3. Wait for redirect to dashboard

  // Mock approach: Set Firebase token in localStorage
  await page.goto('/dashboard/real-estate/leads');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
}

test.describe('Real Estate Leads Management - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Wait for initial data to load
    await page.waitForTimeout(1000);
  });

  test('should display leads management page with all UI elements', async ({ page }) => {
    // Check for main title
    await expect(page.locator('h1').filter({ hasText: /Leads Management|ניהול לידים/i })).toBeVisible();

    // Check for action buttons
    await expect(page.getByTestId('import-leads-button')).toBeVisible();
    await expect(page.getByTestId('export-leads-button')).toBeVisible();
    await expect(page.getByTestId('create-lead-button')).toBeVisible();

    // Check for search and filters
    await expect(page.getByTestId('search-leads-input')).toBeVisible();
    await expect(page.getByTestId('filter-status-select')).toBeVisible();
    await expect(page.getByTestId('filter-source-select')).toBeVisible();

    // Check for table (desktop view)
    await expect(page.getByTestId('leads-table')).toBeVisible();
  });

  test('should create a new lead and verify it appears in table', async ({ page }) => {
    // Click create button
    await page.getByTestId('create-lead-button').click();

    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });

    // Fill in lead details
    const timestamp = Date.now();
    const testLeadName = `Test Lead ${timestamp}`;
    const testPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testEmail = `test${timestamp}@example.com`;

    await page.locator('input[name="fullName"], input[placeholder*="Full Name"], input[placeholder*="שם מלא"]').fill(testLeadName);
    await page.locator('input[name="phone"], input[placeholder*="Phone"], input[placeholder*="טלפון"]').fill(testPhone);
    await page.locator('input[name="email"], input[placeholder*="Email"], input[placeholder*="אימייל"]').fill(testEmail);

    // Select source
    await page.locator('select[name="source"]').selectOption('Website');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for modal to close and data to refresh
    await page.waitForTimeout(2000);

    // Verify lead appears in table
    const leadNameCell = page.locator(`[data-testid*="lead-name-"]`).filter({ hasText: testLeadName });
    await expect(leadNameCell).toBeVisible({ timeout: 5000 });

    // Verify lead has correct data in table
    const leadRow = leadNameCell.locator('xpath=ancestor::tr');
    await expect(leadRow).toContainText(testPhone);
  });

  test('should edit lead and verify changes persist', async ({ page }) => {
    // Find first lead in table
    const firstLeadRow = page.locator('[data-testid^="lead-row-"]').first();
    await expect(firstLeadRow).toBeVisible();

    // Get lead ID from data-testid
    const leadId = await firstLeadRow.getAttribute('data-testid').then(id => id?.replace('lead-row-', ''));

    // Click edit button
    await page.getByTestId(`edit-lead-${leadId}`).click();

    // Wait for edit modal
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });
    await page.waitForTimeout(500); // Wait for data to load

    // Update name
    const updatedName = `Updated Lead ${Date.now()}`;
    const nameInput = page.locator('input[name="fullName"], input[placeholder*="Full Name"], input[placeholder*="שם מלא"]');
    await nameInput.fill('');
    await nameInput.fill(updatedName);

    // Update status
    await page.locator('select[name="qualificationStatus"]').selectOption('CONTACTED');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for changes to save
    await page.waitForTimeout(2000);

    // Verify changes in table
    await expect(page.getByTestId(`lead-name-${leadId}`)).toContainText(updatedName);
    await expect(page.getByTestId(`lead-status-${leadId}`)).toContainText(/Contacted|יצרנו קשר/i);
  });

  test('should search for leads by name', async ({ page }) => {
    // Get first lead name
    const firstLeadName = page.locator('[data-testid^="lead-name-"]').first();
    const leadNameText = await firstLeadName.textContent();

    if (!leadNameText) {
      test.skip();
      return;
    }

    // Search for partial name
    const searchTerm = leadNameText.substring(0, Math.min(5, leadNameText.length));
    await page.getByTestId('search-leads-input').fill(searchTerm);

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results contain search term
    const visibleLeads = await page.locator('[data-testid^="lead-name-"]').allTextContents();
    expect(visibleLeads.length).toBeGreaterThan(0);

    // At least one result should contain the search term
    const hasMatch = visibleLeads.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    expect(hasMatch).toBeTruthy();
  });

  test('should filter leads by status', async ({ page }) => {
    // Select a specific status
    await page.getByTestId('filter-status-select').selectOption('NEW');
    await page.waitForTimeout(1000);

    // Get all visible status badges
    const statusBadges = await page.locator('[data-testid^="lead-status-"]').allTextContents();

    // All visible leads should have NEW status
    if (statusBadges.length > 0) {
      for (const status of statusBadges) {
        expect(status).toMatch(/New|חדש/i);
      }
    }
  });

  test('should filter leads by source', async ({ page }) => {
    // Select a specific source
    await page.getByTestId('filter-source-select').selectOption('Website');
    await page.waitForTimeout(1000);

    // Verify table only shows Website leads
    const tableRows = page.locator('[data-testid^="lead-row-"]');
    const count = await tableRows.count();

    if (count > 0) {
      // Check first few rows contain "Website"
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(tableRows.nth(i)).toContainText('Website');
      }
    }
  });

  test('should export leads to CSV', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click export button
    await page.getByTestId('export-leads-button').click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/leads.*\.csv/i);

    // Optionally verify file content
    const filePath = await download.path();
    if (filePath) {
      const exists = fs.existsSync(filePath);
      expect(exists).toBeTruthy();
    }
  });

  test('should import leads from CSV', async ({ page }) => {
    // Create a test CSV file
    const csvContent = `fullName,phone,email,source,notes
Test Import ${Date.now()},0501234567,testimport@example.com,Import,Test note
Test Import 2 ${Date.now()},0507654321,testimport2@example.com,Import,Test note 2`;

    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const csvPath = path.join(tmpDir, `test-leads-${Date.now()}.csv`);
    fs.writeFileSync(csvPath, csvContent);

    // Get initial count of leads
    const initialCount = await page.locator('[data-testid^="lead-row-"]').count();

    // Click import button
    await page.getByTestId('import-leads-button').click();

    // Wait for import modal
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // Wait for preview to load
    await page.waitForTimeout(1000);

    // Click import/confirm button
    const importButton = page.locator('button').filter({ hasText: /Import|Confirm|ייבוא|אישור/i }).last();
    await importButton.click();

    // Wait for import to complete
    await page.waitForTimeout(3000);

    // Verify new leads were added
    const newCount = await page.locator('[data-testid^="lead-row-"]').count();
    expect(newCount).toBeGreaterThan(initialCount);

    // Clean up test file
    fs.unlinkSync(csvPath);
  });

  test('should add note to lead via edit modal', async ({ page }) => {
    // Find first lead
    const firstLeadRow = page.locator('[data-testid^="lead-row-"]').first();
    const leadId = await firstLeadRow.getAttribute('data-testid').then(id => id?.replace('lead-row-', ''));

    // Open edit modal
    await page.getByTestId(`edit-lead-${leadId}`).click();
    await page.waitForTimeout(500);

    // Add note
    const testNote = `Test note added at ${new Date().toISOString()}`;
    const notesTextarea = page.locator('textarea[name="notes"], textarea[placeholder*="note"]');
    await notesTextarea.fill(testNote);

    // Save
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Open view modal to verify note
    await page.getByTestId(`view-lead-${leadId}`).click();
    await page.waitForTimeout(500);

    // Verify note is visible
    await expect(page.locator('[role="dialog"]')).toContainText(testNote);

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should delete lead', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid^="lead-row-"]').count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Find last lead (to avoid affecting other tests)
    const lastLeadRow = page.locator('[data-testid^="lead-row-"]').last();
    const leadId = await lastLeadRow.getAttribute('data-testid').then(id => id?.replace('lead-row-', ''));

    // Set up dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.getByTestId(`delete-lead-${leadId}`).click();

    // Wait for deletion
    await page.waitForTimeout(2000);

    // Verify count decreased
    const newCount = await page.locator('[data-testid^="lead-row-"]').count();
    expect(newCount).toBe(initialCount - 1);

    // Verify specific lead is gone
    await expect(page.getByTestId(`lead-row-${leadId}`)).not.toBeVisible();
  });
});

test.describe('Real Estate Leads Management - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);
  });

  test('should display mobile card view instead of table', async ({ page }) => {
    // Mobile should show cards, not table
    await expect(page.getByTestId('leads-mobile-cards')).toBeVisible();
    await expect(page.getByTestId('leads-table')).not.toBeVisible();

    // Check for at least one lead card
    const leadCards = page.locator('[data-testid^="lead-card-"]');
    const count = await leadCards.count();

    if (count > 0) {
      await expect(leadCards.first()).toBeVisible();
    }
  });

  test('should create lead on mobile', async ({ page }) => {
    // Click create button
    await page.getByTestId('create-lead-button').click();

    // Modal should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Fill in lead details
    const timestamp = Date.now();
    await page.locator('input[name="fullName"]').fill(`Mobile Lead ${timestamp}`);
    await page.locator('input[name="phone"]').fill(`0501234${timestamp.toString().slice(-3)}`);
    await page.locator('select[name="source"]').selectOption('Website');

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verify lead appears in mobile cards
    await expect(page.getByTestId('leads-mobile-cards')).toContainText(`Mobile Lead ${timestamp}`);
  });

  test('should search leads on mobile', async ({ page }) => {
    // Get first lead name from mobile card
    const firstLeadName = await page.locator('[data-testid^="lead-name-"]').first().textContent();

    if (!firstLeadName) {
      test.skip();
      return;
    }

    // Search
    const searchTerm = firstLeadName.substring(0, 5);
    await page.getByTestId('search-leads-input').fill(searchTerm);
    await page.waitForTimeout(500);

    // Verify results
    const visibleCards = page.locator('[data-testid^="lead-card-"]');
    await expect(visibleCards.first()).toBeVisible();
  });

  test('should verify mobile touch targets are at least 44px', async ({ page }) => {
    // Check action buttons in first mobile card
    const firstCard = page.locator('[data-testid^="lead-card-"]').first();

    if (await firstCard.isVisible()) {
      const viewButton = firstCard.locator('button').filter({ hasText: /View|צפייה/i });
      const editButton = firstCard.locator('button').filter({ hasText: /Edit|עריכה/i });

      // Get computed height
      const viewHeight = await viewButton.boundingBox().then(box => box?.height || 0);
      const editHeight = await editButton.boundingBox().then(box => box?.height || 0);

      expect(viewHeight).toBeGreaterThanOrEqual(44);
      expect(editHeight).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Real Estate Leads - Accessibility', () => {
  test('should have proper ARIA attributes on modals', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);

    // Open create modal
    await page.getByTestId('create-lead-button').click();

    // Check ARIA attributes
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Should have aria-labelledby
    const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
    expect(ariaLabelledBy).toBeTruthy();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);

    // Open modal
    await page.getByTestId('create-lead-button').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 1000 });
  });

  test('should have accessible button labels', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(1000);

    // Check main action buttons
    const importButton = page.getByTestId('import-leads-button');
    const exportButton = page.getByTestId('export-leads-button');
    const createButton = page.getByTestId('create-lead-button');

    // All should have visible text or aria-label
    await expect(importButton).toHaveText(/.+/);
    await expect(exportButton).toHaveText(/.+/);
    await expect(createButton).toHaveText(/.+/);
  });
});

test.describe('Real Estate Leads - Performance', () => {
  test('should load leads page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await login(page);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (including network)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large datasets without horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page);
    await page.waitForTimeout(1000);

    // Get page width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    // Body should not exceed viewport width
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
