/**
 * Jest setup file for API tests
 * Configures global test environment settings
 */

import '@testing-library/jest-dom';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-long-for-security';
process.env.SESSION_COOKIE_NAME = 'test-session';
process.env.TERMS_VERSION = '1.0';
process.env.BCRYPT_ROUNDS = '4'; // Faster hashing for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Additional required environment variables
process.env.API_BASE_URL = 'http://localhost:4000';
process.env.TOKEN_CRYPTO_KEY = 'test-token-crypto-key-32-chars-min';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-for-testing';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Global test timeout
jest.setTimeout(30000);