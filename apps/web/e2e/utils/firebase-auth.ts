/**
 * Firebase Authentication Helper for E2E Tests
 *
 * Uses Firebase REST API to obtain ID tokens without browser UI
 * Persists storage state for Playwright to reuse across tests
 */

import * as fs from 'fs';
import * as path from 'path';

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

/**
 * Sign in to Firebase using REST API
 * @param email - Test user email
 * @param password - Test user password
 * @returns Firebase auth response with ID token
 */
export async function signInWithFirebase(
  email: string,
  password: string
): Promise<FirebaseAuthResponse> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Firebase auth failed: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    idToken: data.idToken,
    email: data.email,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    localId: data.localId,
  };
}

/**
 * Create Playwright storage state with Firebase auth
 * @param authData - Firebase authentication response
 * @returns Storage state object
 */
export function createStorageState(authData: FirebaseAuthResponse) {
  // Firebase stores auth data in localStorage with specific keys
  // The exact structure depends on your Firebase SDK version
  const firebaseAuthKey = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`;

  return {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3001',
        localStorage: [
          {
            name: firebaseAuthKey,
            value: JSON.stringify({
              uid: authData.localId,
              email: authData.email,
              emailVerified: true,
              isAnonymous: false,
              providerData: [
                {
                  providerId: 'password',
                  uid: authData.email,
                  displayName: null,
                  email: authData.email,
                  phoneNumber: null,
                  photoURL: null,
                },
              ],
              stsTokenManager: {
                refreshToken: authData.refreshToken,
                accessToken: authData.idToken,
                expirationTime: Date.now() + parseInt(authData.expiresIn) * 1000,
              },
              createdAt: Date.now().toString(),
              lastLoginAt: Date.now().toString(),
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              appName: '[DEFAULT]',
            }),
          },
          // Also store the raw ID token for direct API calls
          {
            name: 'firebase:idToken',
            value: authData.idToken,
          },
        ],
      },
    ],
  };
}

/**
 * Save storage state to file
 * @param storageState - Storage state object
 * @param filePath - Path to save the file
 */
export function saveStorageState(storageState: any, filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(storageState, null, 2));
}

/**
 * Complete authentication flow for E2E tests
 * @param email - Test user email
 * @param password - Test user password
 * @param storageStatePath - Path to save storage state
 */
export async function setupAuth(
  email: string,
  password: string,
  storageStatePath: string
): Promise<void> {
  console.log('Setting up Firebase authentication for E2E tests...');

  // Sign in via REST API
  const authData = await signInWithFirebase(email, password);
  console.log(`✓ Signed in as ${authData.email}`);

  // Create storage state
  const storageState = createStorageState(authData);

  // Save to file
  saveStorageState(storageState, storageStatePath);
  console.log(`✓ Storage state saved to ${storageStatePath}`);
}

/**
 * Get test credentials from environment
 */
export function getTestCredentials() {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD environment variables are required. ' +
      'Add them to .env.local:\n' +
      'E2E_TEST_USER_EMAIL=test@example.com\n' +
      'E2E_TEST_USER_PASSWORD=your-password'
    );
  }

  return { email, password };
}
