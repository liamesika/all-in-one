/**
 * Jest setup file for API tests
 * Configures global test environment settings
 */

import '@testing-library/jest-dom';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_COOKIE_NAME = 'test-session';
process.env.TERMS_VERSION = '1.0';
process.env.BCRYPT_ROUNDS = '4'; // Faster hashing for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Global test timeout
jest.setTimeout(30000);