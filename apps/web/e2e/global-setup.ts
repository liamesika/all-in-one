/**
 * Playwright Global Setup
 *
 * Runs once before all tests to set up Firebase authentication
 */

import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import { setupAuth, getTestCredentials } from './utils/firebase-auth';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storage-state.json');

export default async function globalSetup(config: FullConfig) {
  console.log('\n🔧 Running global setup...\n');

  try {
    // Get test credentials from environment
    const { email, password } = getTestCredentials();

    // Set up authentication and save storage state
    await setupAuth(email, password, STORAGE_STATE_PATH);

    console.log('\n✅ Global setup complete!\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:', error);
    console.error('\nMake sure you have set up environment variables:');
    console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
    console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.error('- E2E_TEST_USER_EMAIL');
    console.error('- E2E_TEST_USER_PASSWORD\n');
    throw error;
  }
}
