/**
 * Platform Integrations E2E Test Suite
 *
 * Tests the complete user flow:
 * 1. Connect advertising accounts (Meta, Google, TikTok, LinkedIn)
 * 2. Sync ad accounts
 * 3. Create external campaigns
 * 4. Pause/Resume campaigns
 * 5. View insights dashboard
 * 6. Export reports
 * 7. Disconnect accounts
 */

import { test, expect, type Page } from '@playwright/test';

const TEST_USER_EMAIL = 'test+integration@effinity.ai';
const TEST_USER_PASSWORD = 'TestPassword123!';

// Mock provider credentials for testing
const MOCK_PROVIDERS = {
  meta: {
    clientId: 'test_meta_client_id',
    clientSecret: 'test_meta_secret',
    mockAccountId: 'act_123456789',
    mockAccountName: 'Test Meta Ad Account',
  },
  google: {
    clientId: 'test_google_client_id.googleusercontent.com',
    clientSecret: 'test_google_secret',
    mockAccountId: '987-654-3210',
    mockAccountName: 'Test Google Ads Account',
  },
  tiktok: {
    clientId: 'test_tiktok_client_id',
    clientSecret: 'test_tiktok_secret',
    mockAccountId: '1234567890123456789',
    mockAccountName: 'Test TikTok Ads Account',
  },
  linkedin: {
    clientId: 'test_linkedin_client_id',
    clientSecret: 'test_linkedin_secret',
    mockAccountId: '123456789',
    mockAccountName: 'Test LinkedIn Ads Account',
  },
};

test.describe('Platform Integrations E2E', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Set up test environment variables
    await page.addInitScript(() => {
      window.process = { env: {} as any };
      window.process.env.META_CLIENT_ID = 'test_meta_client_id';
      window.process.env.GOOGLE_CLIENT_ID = 'test_google_client_id';
      window.process.env.TIKTOK_CLIENT_ID = 'test_tiktok_client_id';
      window.process.env.LINKEDIN_CLIENT_ID = 'test_linkedin_client_id';
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    // Mock authentication
    await page.goto('http://localhost:3003/login');
    await page.fill('[data-testid=email-input]', TEST_USER_EMAIL);
    await page.fill('[data-testid=password-input]', TEST_USER_PASSWORD);
    await page.click('[data-testid=login-button]');

    // Wait for successful login redirect
    await page.waitForURL('**/e-commerce/dashboard');
  });

  test.describe('Connections Flow', () => {
    test('should display connections page with all providers', async () => {
      await page.goto('http://localhost:3003/connections');

      // Check that all provider cards are displayed
      await expect(page.locator('text=Meta (Facebook & Instagram)')).toBeVisible();
      await expect(page.locator('text=Google Ads')).toBeVisible();
      await expect(page.locator('text=TikTok Ads')).toBeVisible();
      await expect(page.locator('text=LinkedIn Ads')).toBeVisible();

      // Verify initial state shows "Not connected"
      const notConnectedElements = page.locator('text=Not connected');
      await expect(notConnectedElements).toHaveCount(4);
    });

    test('should initiate OAuth flow for Meta connection', async () => {
      await page.goto('http://localhost:3003/connections');

      // Mock the OAuth redirect to avoid actual provider calls
      await page.route('**/api/connections/meta/auth-url', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            provider: 'META',
            authUrl: 'https://www.facebook.com/v18.0/dialog/oauth?client_id=test&response_type=code&state=mock_state&redirect_uri=http://localhost:3001/api/connections/meta/callback'
          })
        });
      });

      // Click connect button for Meta
      const connectButton = page.locator('[data-testid=connect-meta]');
      await expect(connectButton).toBeVisible();
      await connectButton.click();

      // Should redirect to OAuth URL (we'll mock the callback)
      await page.waitForURL('**/dialog/oauth**');
    });

    test('should handle successful OAuth callback', async () => {
      await page.goto('http://localhost:3003/connections');

      // Mock successful OAuth callback
      await page.route('**/api/connections/meta/callback**', async route => {
        const url = new URL(route.request().url());
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (code && state) {
          // Redirect to success page
          await route.fulfill({
            status: 302,
            headers: {
              'Location': '/connections?success=1&provider=meta&connectionId=test-connection-id'
            }
          });
        }
      });

      // Mock the connections API to return connected state
      await page.route('**/api/connections', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'test-connection-id',
                provider: 'META',
                status: 'CONNECTED',
                displayName: 'Meta Connection',
                accountEmail: 'test@business.com',
                accountCount: 1,
                adAccounts: [
                  {
                    id: 'test-ad-account-id',
                    externalId: MOCK_PROVIDERS.meta.mockAccountId,
                    name: MOCK_PROVIDERS.meta.mockAccountName,
                    currency: 'USD',
                    status: 'ACTIVE'
                  }
                ],
                lastSyncAt: new Date().toISOString()
              }
            ])
          });
        }
      });

      // Simulate successful callback
      await page.goto('http://localhost:3003/connections?success=1&provider=meta&connectionId=test-connection-id');

      // Verify connection is now shown as connected
      await expect(page.locator('text=CONNECTED')).toBeVisible();
      await expect(page.locator('text=test@business.com')).toBeVisible();
      await expect(page.locator('text=1 account')).toBeVisible();

      // Verify ad accounts are displayed
      await expect(page.locator(`text=${MOCK_PROVIDERS.meta.mockAccountName}`)).toBeVisible();
      await expect(page.locator(`text=${MOCK_PROVIDERS.meta.mockAccountId}`)).toBeVisible();
    });

    test('should handle OAuth errors gracefully', async () => {
      await page.goto('http://localhost:3003/connections?error=access_denied&provider=meta');

      // Should display error message
      await expect(page.locator('text=Connection failed')).toBeVisible();
      await expect(page.locator('text=access_denied')).toBeVisible();
    });

    test('should sync ad accounts successfully', async () => {
      // Set up connected state
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-connection-id',
              provider: 'META',
              status: 'CONNECTED',
              displayName: 'Meta Connection',
              accountCount: 1,
              adAccounts: [
                {
                  id: 'test-ad-account-id',
                  externalId: MOCK_PROVIDERS.meta.mockAccountId,
                  name: MOCK_PROVIDERS.meta.mockAccountName,
                  status: 'ACTIVE'
                }
              ]
            }
          ])
        });
      });

      // Mock sync accounts API
      await page.route('**/api/connections/*/sync-accounts', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            jobId: 'sync-job-123',
            message: 'Account sync job enqueued'
          })
        });
      });

      await page.goto('http://localhost:3003/connections');

      // Click sync accounts button
      const syncButton = page.locator('[data-testid=sync-accounts]');
      await expect(syncButton).toBeVisible();
      await syncButton.click();

      // Verify success message
      await expect(page.locator('text=Account sync job started')).toBeVisible();
    });

    test('should disconnect account successfully', async () => {
      // Set up connected state
      await page.route('**/api/connections', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'test-connection-id',
                provider: 'META',
                status: 'CONNECTED',
                displayName: 'Meta Connection',
                accountCount: 1
              }
            ])
          });
        }
      });

      // Mock disconnect API
      await page.route('**/api/connections/test-connection-id', async route => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Connection disconnected successfully'
            })
          });
        }
      });

      await page.goto('http://localhost:3003/connections');

      // Click disconnect button
      const disconnectButton = page.locator('[data-testid=disconnect-connection]');
      await expect(disconnectButton).toBeVisible();
      await disconnectButton.click();

      // Confirm disconnection
      await page.click('text=Yes, disconnect');

      // Verify success message
      await expect(page.locator('text=Account disconnected successfully')).toBeVisible();
    });
  });

  test.describe('Campaign Management', () => {
    test.beforeEach(async () => {
      // Mock connected accounts for campaign tests
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-connection-id',
              provider: 'META',
              status: 'CONNECTED',
              adAccounts: [
                {
                  id: 'test-ad-account-id',
                  externalId: MOCK_PROVIDERS.meta.mockAccountId,
                  name: MOCK_PROVIDERS.meta.mockAccountName
                }
              ]
            }
          ])
        });
      });
    });

    test('should require connected account to create campaign', async () => {
      // Mock no connections
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('http://localhost:3003/external-campaigns');

      // Should show empty state with CTA to connect accounts
      await expect(page.locator('text=No connections found')).toBeVisible();
      await expect(page.locator('text=Connect your advertising accounts')).toBeVisible();

      // Create campaign button should be disabled
      const createButton = page.locator('[data-testid=create-campaign]');
      await expect(createButton).toBeDisabled();
    });

    test('should create external campaign successfully', async () => {
      await page.route('**/api/campaigns/external', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              campaigns: []
            })
          });
        }
      });

      // Mock campaign creation
      await page.route('**/api/campaigns/external/create', async route => {
        const body = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'campaign-123',
            externalId: 'ext-campaign-456',
            name: body.name,
            status: 'PAUSED',
            provider: 'META'
          })
        });
      });

      await page.goto('http://localhost:3003/external-campaigns');

      // Click create campaign button
      await page.click('[data-testid=create-campaign]');

      // Fill campaign form
      await page.selectOption('[data-testid=provider-select]', 'META');
      await page.selectOption('[data-testid=account-select]', MOCK_PROVIDERS.meta.mockAccountId);
      await page.fill('[data-testid=campaign-name]', 'Test E2E Campaign');
      await page.selectOption('[data-testid=campaign-objective]', 'CONVERSIONS');
      await page.fill('[data-testid=daily-budget]', '100');

      // Submit form
      await page.click('[data-testid=create-campaign-submit]');

      // Verify success message
      await expect(page.locator('text=Campaign created successfully')).toBeVisible();
    });

    test('should pause and resume campaigns', async () => {
      // Mock campaigns list
      await page.route('**/api/campaigns/external', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            campaigns: [
              {
                id: 'campaign-123',
                externalId: 'ext-campaign-456',
                name: 'Test Campaign',
                status: 'ACTIVE',
                connection: { provider: 'META' },
                adAccount: {
                  name: MOCK_PROVIDERS.meta.mockAccountName,
                  externalId: MOCK_PROVIDERS.meta.mockAccountId
                }
              }
            ]
          })
        });
      });

      // Mock campaign actions
      await page.route('**/api/campaigns/external/*/pause', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.route('**/api/campaigns/external/*/resume', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.goto('http://localhost:3003/external-campaigns');

      // Pause campaign
      await page.click('[data-testid=pause-campaign-campaign-123]');
      await expect(page.locator('text=Campaign paused successfully')).toBeVisible();

      // Resume campaign
      await page.click('[data-testid=resume-campaign-campaign-123]');
      await expect(page.locator('text=Campaign resumed successfully')).toBeVisible();
    });
  });

  test.describe('Insights Dashboard', () => {
    test.beforeEach(async () => {
      // Mock insights data
      await page.route('**/api/insights/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            insights: [
              {
                date: '2025-09-14',
                spend: 150.75,
                impressions: 10000,
                clicks: 250,
                cpc: 0.60,
                ctr: 2.5,
                conversions: 15,
                conversionValue: 750.00
              },
              {
                date: '2025-09-13',
                spend: 125.50,
                impressions: 8500,
                clicks: 200,
                cpc: 0.63,
                ctr: 2.35,
                conversions: 12,
                conversionValue: 600.00
              }
            ]
          })
        });
      });

      // Mock connected accounts
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-connection-id',
              provider: 'META',
              status: 'CONNECTED',
              adAccounts: [
                {
                  externalId: MOCK_PROVIDERS.meta.mockAccountId,
                  name: MOCK_PROVIDERS.meta.mockAccountName
                }
              ]
            }
          ])
        });
      });
    });

    test('should display insights dashboard with metrics', async () => {
      await page.goto('http://localhost:3003/e-commerce/dashboard');

      // Should display platform insights component
      await expect(page.locator('text=Platform Insights')).toBeVisible();

      // Should display summary metrics
      await expect(page.locator('text=$276.25')).toBeVisible(); // Total spend
      await expect(page.locator('text=18,500')).toBeVisible();   // Total impressions
      await expect(page.locator('text=450')).toBeVisible();      // Total clicks
      await expect(page.locator('text=27')).toBeVisible();       // Total conversions

      // Should display chart
      await expect(page.locator('[data-testid=insights-chart]')).toBeVisible();
    });

    test('should filter insights by provider and date range', async () => {
      await page.goto('http://localhost:3003/e-commerce/dashboard');

      // Change date range
      await page.click('text=30 days');

      // Change provider (if multiple available)
      await page.selectOption('[data-testid=provider-select]', 'META');

      // Should update chart and metrics
      await expect(page.locator('[data-testid=insights-chart]')).toBeVisible();
    });

    test('should handle empty state when no connections exist', async () => {
      // Mock no connections
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('http://localhost:3003/e-commerce/dashboard');

      // Should display empty state
      await expect(page.locator('text=No Insights Available')).toBeVisible();
      await expect(page.locator('text=Connect your advertising accounts')).toBeVisible();
    });

    test('should refresh insights data', async () => {
      // Mock insights refresh
      await page.route('**/api/insights/refresh', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      await page.goto('http://localhost:3003/e-commerce/dashboard');

      // Click refresh button
      await page.click('[data-testid=refresh-insights]');

      // Should show refreshing state
      await expect(page.locator('text=Refreshing...')).toBeVisible();
    });
  });

  test.describe('Leads Attribution', () => {
    test('should display leads with provider attribution', async () => {
      // Mock leads with campaign attribution
      await page.route('**/api/leads**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            leads: [
              {
                id: 'lead-123',
                fullName: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                source: 'FACEBOOK',
                status: 'NEW',
                score: 'HOT',
                campaign: {
                  id: 'campaign-123',
                  name: 'Meta Lead Gen Campaign',
                  platform: 'META',
                  status: 'ACTIVE'
                },
                utmSource: 'facebook',
                utmMedium: 'cpc',
                utmCampaign: 'lead-gen-q4',
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      });

      await page.goto('http://localhost:3003/e-commerce/leads');

      // Should display lead with attribution
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=FACEBOOK')).toBeVisible();
      await expect(page.locator('text=Meta Lead Gen Campaign')).toBeVisible();
      await expect(page.locator('text=facebook/cpc')).toBeVisible();
    });
  });

  test.describe('End-to-End User Flow', () => {
    test('should complete full integration workflow', async () => {
      // Step 1: Connect Meta account
      await page.goto('http://localhost:3003/connections');

      // Mock OAuth flow
      await page.route('**/api/connections/meta/auth-url', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            provider: 'META',
            authUrl: '/connections?success=1&provider=meta&connectionId=test-connection-id'
          })
        });
      });

      // Connect Meta
      await page.click('[data-testid=connect-meta]');

      // Step 2: Sync accounts
      await page.route('**/api/connections/test-connection-id/sync-accounts', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            jobId: 'sync-job-123'
          })
        });
      });

      await page.click('[data-testid=sync-accounts]');
      await expect(page.locator('text=Account sync job started')).toBeVisible();

      // Step 3: Create campaign
      await page.goto('http://localhost:3003/external-campaigns');

      await page.route('**/api/campaigns/external/create', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'campaign-123',
            name: 'E2E Test Campaign',
            status: 'PAUSED'
          })
        });
      });

      await page.click('[data-testid=create-campaign]');
      await page.fill('[data-testid=campaign-name]', 'E2E Test Campaign');
      await page.click('[data-testid=create-campaign-submit]');
      await expect(page.locator('text=Campaign created successfully')).toBeVisible();

      // Step 4: View insights
      await page.goto('http://localhost:3003/e-commerce/dashboard');
      await expect(page.locator('text=Platform Insights')).toBeVisible();

      // Step 5: Check leads attribution
      await page.goto('http://localhost:3003/e-commerce/leads');
      await expect(page.locator('[data-testid=leads-table]')).toBeVisible();

      // Test completed successfully
      console.log('✅ Full E2E integration workflow completed successfully');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API errors
      await page.route('**/api/connections', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('http://localhost:3003/connections');

      // Should display error message
      await expect(page.locator('text=Failed to load connections')).toBeVisible();
    });

    test('should handle network timeouts', async () => {
      // Mock slow/timeout requests
      await page.route('**/api/connections', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        await route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Request timeout' })
        });
      });

      await page.goto('http://localhost:3003/connections');

      // Should show loading state and then error
      await expect(page.locator('[data-testid=loading-spinner]')).toBeVisible();
      await expect(page.locator('text=Request failed')).toBeVisible();
    });

    test('should validate form inputs', async () => {
      await page.goto('http://localhost:3003/external-campaigns');
      await page.click('[data-testid=create-campaign]');

      // Try to submit empty form
      await page.click('[data-testid=create-campaign-submit]');

      // Should display validation errors
      await expect(page.locator('text=Campaign name is required')).toBeVisible();
      await expect(page.locator('text=Please select an account')).toBeVisible();
    });
  });

  test.describe('Multi-Tenancy and Security', () => {
    test('should only show data for authenticated user', async () => {
      // This test would require multiple user accounts
      // Mock response to ensure data isolation
      await page.route('**/api/connections', async route => {
        const authHeader = route.request().headers()['authorization'];
        if (!authHeader) {
          await route.fulfill({ status: 401 });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) // Only return current user's connections
        });
      });

      await page.goto('http://localhost:3003/connections');
      await expect(page.locator('[data-testid=connections-list]')).toBeVisible();
    });

    test('should handle authentication expiry', async () => {
      // Mock 401 response
      await page.route('**/api/**', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      });

      await page.goto('http://localhost:3003/connections');

      // Should redirect to login
      await page.waitForURL('**/login');
    });
  });
});