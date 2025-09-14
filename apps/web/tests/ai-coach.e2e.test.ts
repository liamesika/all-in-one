/**
 * AI Coach E2E Test Suite
 *
 * Tests the complete AI Coach user flow:
 * 1. Login triggers proactive welcome message
 * 2. Chat widget interaction
 * 3. Quick actions execution
 * 4. Multi-language support (HE/EN)
 * 5. Tool execution and UI updates
 */

import { test, expect, type Page } from '@playwright/test';

const TEST_USER_EMAIL = 'test+ai-coach@effinity.ai';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('AI Coach E2E Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    // Mock authentication
    await page.goto('http://localhost:3001/login');
    await page.fill('[data-testid=email-input]', TEST_USER_EMAIL);
    await page.fill('[data-testid=password-input]', TEST_USER_PASSWORD);
    await page.click('[data-testid=login-button]');

    // Wait for successful login redirect
    await page.waitForURL('**/e-commerce/dashboard');
  });

  test.describe('Proactive Welcome Messages', () => {
    test('should show welcome message on first login', async () => {
      // Clear localStorage to simulate first-time user
      await page.evaluate(() => {
        localStorage.clear();
      });

      // Mock user data for proactive insights
      await page.route('**/api/ai-coach/data-snapshot', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            leads: {
              staleList: [
                { id: 'lead-1', fullName: 'John Doe', lastContactAt: '2025-09-10T10:00:00Z' },
                { id: 'lead-2', fullName: 'Jane Smith', lastContactAt: '2025-09-09T15:30:00Z' },
              ],
              totalStale: 2
            },
            campaigns: {
              underperforming: [
                { id: 'campaign-1', name: 'Q4 Campaign', ctr: 0.5, targetCtr: 2.0 },
              ],
              totalUnderperforming: 1
            }
          })
        });
      });

      // Mock welcome message API
      await page.route('**/api/ai-coach/welcome', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Welcome back! I noticed you have 2 stale leads and 1 underperforming campaign. Would you like me to help?',
            sessionId: 'session-123',
            quickActions: [
              {
                id: 'update-stale-leads',
                label: 'Update Stale Leads',
                type: 'update_lead_status',
                destructive: false,
                data: { leadIds: ['lead-1', 'lead-2'], status: 'contacted' }
              },
              {
                id: 'analyze-campaign',
                label: 'Analyze Campaign Performance',
                type: 'analyze_campaign',
                destructive: false,
                data: { campaignId: 'campaign-1' }
              }
            ]
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Should display proactive welcome message
      await expect(page.locator('[data-testid="proactive-welcome"]')).toBeVisible();
      await expect(page.locator('text=Welcome back!')).toBeVisible();
      await expect(page.locator('text=2 stale leads')).toBeVisible();
      await expect(page.locator('text=1 underperforming campaign')).toBeVisible();

      // Should display quick actions
      await expect(page.locator('text=Update Stale Leads')).toBeVisible();
      await expect(page.locator('text=Analyze Campaign Performance')).toBeVisible();
    });

    test('should execute quick action from welcome message', async () => {
      // Mock tool execution
      await page.route('**/api/ai-coach/tools/update_lead_status/execute', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Successfully updated 2 leads to contacted status',
            affectedCount: 2
          })
        });
      });

      // Set up welcome message with quick action
      await page.evaluate(() => {
        localStorage.clear();
      });

      await page.route('**/api/ai-coach/welcome', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'I found some stale leads that need attention.',
            quickActions: [
              {
                id: 'update-stale-leads',
                label: 'Update Stale Leads',
                type: 'update_lead_status',
                destructive: false,
                data: { leadIds: ['lead-1', 'lead-2'], status: 'contacted' }
              }
            ]
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Click quick action
      await page.click('text=Update Stale Leads');

      // Should show success message
      await expect(page.locator('text=Successfully updated 2 leads')).toBeVisible();
    });

    test('should dismiss welcome message', async () => {
      await page.evaluate(() => {
        localStorage.clear();
      });

      await page.route('**/api/ai-coach/welcome', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Welcome! How can I help today?',
            quickActions: []
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      await expect(page.locator('[data-testid="proactive-welcome"]')).toBeVisible();

      // Close welcome message
      await page.click('[data-testid="dismiss-welcome"]');

      // Should hide welcome message
      await expect(page.locator('[data-testid="proactive-welcome"]')).not.toBeVisible();
    });

    test('should not show welcome message twice in cooldown period', async () => {
      // Set localStorage to simulate recent dismissal
      await page.evaluate(() => {
        const now = Date.now();
        const data = {
          lastShown: now - 1000,
          dismissedAt: now - 1000,
        };
        localStorage.setItem('ai-coach-welcome_test-user', JSON.stringify(data));
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Should not display welcome message
      await expect(page.locator('[data-testid="proactive-welcome"]')).not.toBeVisible();
    });
  });

  test.describe('Chat Widget Functionality', () => {
    test('should open and close chat widget', async () => {
      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Should show chat toggle button
      await expect(page.locator('[data-testid="ai-chat-toggle"]')).toBeVisible();

      // Open chat
      await page.click('[data-testid="ai-chat-toggle"]');

      // Should show chat widget
      await expect(page.locator('[data-testid="ai-chat-widget"]')).toBeVisible();
      await expect(page.locator('text=AI Coach')).toBeVisible();

      // Close chat
      await page.click('[data-testid="close-chat"]');

      // Should hide chat widget
      await expect(page.locator('[data-testid="ai-chat-widget"]')).not.toBeVisible();
    });

    test('should send and receive chat messages', async () => {
      // Mock chat API response
      await page.route('**/api/ai-coach/chat', async route => {
        const body = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: `I received your message: "${body.message}". How can I help?`,
            sessionId: 'session-123',
            quickActions: []
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Open chat
      await page.click('[data-testid="ai-chat-toggle"]');

      // Type message
      await page.fill('[data-testid="chat-input"]', 'Hello AI Coach');

      // Send message
      await page.click('[data-testid="send-message"]');

      // Should display user message
      await expect(page.locator('text=Hello AI Coach')).toBeVisible();

      // Should display AI response
      await expect(page.locator('text=I received your message')).toBeVisible();

      // Input should be cleared
      await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('');
    });

    test('should show typing indicator', async () => {
      // Mock delayed response
      await page.route('**/api/ai-coach/chat', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Response after delay',
            sessionId: 'session-123',
            quickActions: []
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      await page.fill('[data-testid="chat-input"]', 'Test message');
      await page.click('[data-testid="send-message"]');

      // Should show typing indicator
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

      // Typing indicator should disappear after response
      await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
      await expect(page.locator('text=Response after delay')).toBeVisible();
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      await page.route('**/api/ai-coach/chat', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      await page.fill('[data-testid="chat-input"]', 'Test message');
      await page.click('[data-testid="send-message"]');

      // Should show error message
      await expect(page.locator('text=Sorry, there was an error')).toBeVisible();
    });
  });

  test.describe('Quick Actions and Tool Execution', () => {
    test('should execute non-destructive actions immediately', async () => {
      // Mock chat response with quick actions
      await page.route('**/api/ai-coach/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'I found some actions you can take:',
            sessionId: 'session-123',
            quickActions: [
              {
                id: 'update-lead',
                label: 'Update Lead Status',
                type: 'update_lead_status',
                destructive: false,
                data: { leadId: 'lead-123', status: 'contacted' }
              }
            ]
          })
        });
      });

      // Mock tool execution
      await page.route('**/api/ai-coach/tools/update_lead_status/execute', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Lead status updated successfully'
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      await page.fill('[data-testid="chat-input"]', 'Show me available actions');
      await page.click('[data-testid="send-message"]');

      // Wait for quick actions to appear
      await expect(page.locator('text=Update Lead Status')).toBeVisible();

      // Click quick action
      await page.click('text=Update Lead Status');

      // Should show success message
      await expect(page.locator('text=Lead status updated successfully')).toBeVisible();
    });

    test('should show confirmation for destructive actions', async () => {
      // Mock destructive action
      await page.route('**/api/ai-coach/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'I can help with this destructive action:',
            sessionId: 'session-123',
            quickActions: [
              {
                id: 'delete-campaign',
                label: 'Delete Campaign',
                type: 'delete_campaign',
                destructive: true,
                data: { campaignId: 'campaign-123' }
              }
            ]
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      await page.fill('[data-testid="chat-input"]', 'Show destructive action');
      await page.click('[data-testid="send-message"]');

      await expect(page.locator('text=Delete Campaign')).toBeVisible();

      // Click destructive action
      await page.click('text=Delete Campaign');

      // Should show confirmation modal
      await expect(page.locator('[data-testid="confirm-modal"]')).toBeVisible();
      await expect(page.locator('text=Are you sure')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-action"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-action"]')).toBeVisible();
    });

    test('should cancel destructive action', async () => {
      await page.route('**/api/ai-coach/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Destructive action available:',
            quickActions: [
              {
                id: 'delete-campaign',
                label: 'Delete Campaign',
                type: 'delete_campaign',
                destructive: true,
                data: { campaignId: 'campaign-123' }
              }
            ]
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');
      await page.fill('[data-testid="chat-input"]', 'Show destructive action');
      await page.click('[data-testid="send-message"]');

      await page.click('text=Delete Campaign');

      // Cancel action
      await page.click('[data-testid="cancel-action"]');

      // Modal should close
      await expect(page.locator('[data-testid="confirm-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Multi-Language Support', () => {
    test('should work in Hebrew with RTL layout', async () => {
      // Set Hebrew language
      await page.evaluate(() => {
        localStorage.setItem('language', 'he');
      });

      await page.route('**/api/ai-coach/chat', async route => {
        const body = await route.request().postDataJSON();
        expect(body.language).toBe('he');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'שלום! איך אני יכול לעזור לך היום?',
            sessionId: 'session-123',
            quickActions: []
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Chat widget should have RTL class
      await page.click('[data-testid="ai-chat-toggle"]');
      const chatWidget = page.locator('[data-testid="ai-chat-widget"]');
      await expect(chatWidget).toHaveClass(/rtl/);

      await page.fill('[data-testid="chat-input"]', 'שלום');
      await page.click('[data-testid="send-message"]');

      // Should display Hebrew response
      await expect(page.locator('text=שלום! איך אני יכול לעזור לך היום?')).toBeVisible();
    });

    test('should switch between languages', async () => {
      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      // Start in English
      await expect(page.locator('[data-testid="ai-chat-widget"]')).not.toHaveClass(/rtl/);

      // Switch to Hebrew via language toggle
      await page.click('[data-testid="language-toggle"]');

      // Should update to RTL layout
      await expect(page.locator('[data-testid="ai-chat-widget"]')).toHaveClass(/rtl/);
    });
  });

  test.describe('Integration with E-commerce Pages', () => {
    test('should be available on all E-commerce pages', async () => {
      const pages = [
        '/e-commerce/dashboard',
        '/e-commerce/leads',
        '/e-commerce/campaigns',
        '/connections'
      ];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3001${pagePath}`);

        // Should have AI chat toggle button
        await expect(page.locator('[data-testid="ai-chat-toggle"]')).toBeVisible();

        console.log(`✅ AI Coach verified on ${pagePath}`);
      }
    });

    test('should maintain session across page navigation', async () => {
      // Mock chat to establish session
      await page.route('**/api/ai-coach/chat', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Session established',
            sessionId: 'persistent-session-123',
            quickActions: []
          })
        });
      });

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');
      await page.fill('[data-testid="chat-input"]', 'Start session');
      await page.click('[data-testid="send-message"]');

      // Navigate to different page
      await page.goto('http://localhost:3001/e-commerce/leads');

      // Chat should remember the session
      await page.click('[data-testid="ai-chat-toggle"]');

      // Should show previous messages
      await expect(page.locator('text=Start session')).toBeVisible();
      await expect(page.locator('text=Session established')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load without blocking page render', async () => {
      const startTime = Date.now();

      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Page should load quickly
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test('should be keyboard accessible', async () => {
      await page.goto('http://localhost:3001/e-commerce/dashboard');

      // Tab to chat toggle button
      await page.keyboard.press('Tab');

      // Should focus the chat toggle
      await expect(page.locator('[data-testid="ai-chat-toggle"]')).toBeFocused();

      // Open chat with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="ai-chat-widget"]')).toBeVisible();

      // Tab to input field
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();
    });

    test('should handle offline state gracefully', async () => {
      // Simulate offline condition
      await page.setOfflineMode(true);

      await page.goto('http://localhost:3001/e-commerce/dashboard');
      await page.click('[data-testid="ai-chat-toggle"]');

      // Should show offline indicator
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('offline');

      // Restore online
      await page.setOfflineMode(false);

      // Should restore online status
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('online');
    });
  });
});