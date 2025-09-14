/**
 * Test module utilities for creating NestJS testing modules
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../lib/prisma.service';
import { DatabaseTestHelper } from './database-helper';

/**
 * Create a basic testing module with PrismaService
 */
export async function createTestingModule(providers: any[] = []): Promise<TestingModule> {
  const moduleBuilder = Test.createTestingModule({
    providers: [
      PrismaService,
      DatabaseTestHelper,
      ...providers,
    ],
  });

  return moduleBuilder.compile();
}

/**
 * Create a testing module with mocked PrismaService
 */
export async function createMockedTestingModule(providers: any[] = [], prismaServiceMock?: any): Promise<TestingModule> {
  const defaultPrismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    membership: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    userProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    realEstateLead: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    ecommerceLead: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn((fn) => fn(prismaServiceMock || defaultPrismaMock))
  };

  const moduleBuilder = Test.createTestingModule({
    providers: [
      {
        provide: PrismaService,
        useValue: prismaServiceMock || defaultPrismaMock,
      },
      ...providers,
    ],
  });

  return moduleBuilder.compile();
}

/**
 * Mock authentication context for testing protected endpoints
 */
export const mockAuthUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  fullName: 'Test User',
  organizationId: 'test-org-id'
};

/**
 * Mock request object with authenticated user
 */
export const mockAuthRequest = {
  user: mockAuthUser,
  cookies: {
    'test-session': 'mock-jwt-token'
  }
};

/**
 * Helper to generate mock JWT tokens for testing
 */
export function generateMockJWT(payload: any = mockAuthUser): string {
  // For testing purposes, return a simple mock token
  // In real tests, you might want to use the actual JWT library
  return `mock.jwt.token.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}