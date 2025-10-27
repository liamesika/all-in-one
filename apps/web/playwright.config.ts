import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const STORAGE_STATE_PATH = path.join(__dirname, 'e2e', '.auth', 'storage-state.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Global setup for Firebase authentication
  globalSetup: require.resolve('./e2e/global-setup.ts'),

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        storageState: STORAGE_STATE_PATH,
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 12'],
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],

  webServer: {
    command: 'pnpm --filter web dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
