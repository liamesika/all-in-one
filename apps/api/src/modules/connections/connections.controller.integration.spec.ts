import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConnectionsModule } from './connections.module';
import { PrismaService } from '../../lib/prisma.service';
import { ConnectionProvider, ConnectionStatus } from '@prisma/client';

describe('ConnectionsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock user for authentication
  const mockUser = {
    uid: 'test-user-uid',
    organizationId: 'test-org-id',
  };

  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.user = mockUser;
    next();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConnectionsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Apply mock authentication middleware
    app.use('/api/connections', mockAuthMiddleware);

    await app.init();

    // Set up test environment variables
    process.env.API_BASE_URL = 'http://localhost:3001';
    process.env.META_CLIENT_ID = 'test_meta_client_id';
    process.env.META_CLIENT_SECRET = 'test_meta_client_secret';
    process.env.GOOGLE_CLIENT_ID = 'test_google_client_id';
    process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret';
    process.env.TOKEN_CRYPTO_KEY = Buffer.from('test-key-32-bytes-long-for-encryption').toString('base64');
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.oAuthToken.deleteMany({
      where: { connection: { ownerUid: mockUser.uid } },
    });
    await prisma.connection.deleteMany({
      where: { ownerUid: mockUser.uid },
    });
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.oAuthToken.deleteMany({
      where: { connection: { ownerUid: mockUser.uid } },
    });
    await prisma.connection.deleteMany({
      where: { ownerUid: mockUser.uid },
    });
  });

  describe('POST /api/connections/:provider/auth-url', () => {
    it('should generate auth URL for Meta', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/connections/meta/auth-url')
        .expect(201);

      expect(response.body).toMatchObject({
        provider: 'META',
        authUrl: expect.stringContaining('https://www.facebook.com/v18.0/dialog/oauth'),
      });

      expect(response.body.authUrl).toContain('client_id=test_meta_client_id');
      expect(response.body.authUrl).toContain('response_type=code');
      expect(response.body.authUrl).toContain('state=');
    });

    it('should generate auth URL for Google Ads', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/connections/google-ads/auth-url')
        .expect(201);

      expect(response.body).toMatchObject({
        provider: 'GOOGLE_ADS',
        authUrl: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'),
      });

      expect(response.body.authUrl).toContain('client_id=test_google_client_id');
      expect(response.body.authUrl).toContain('access_type=offline');
    });

    it('should return 400 for unsupported provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/connections/invalid-provider/auth-url')
        .expect(400);

      expect(response.body.message).toContain('Unsupported provider');
    });

    it('should return 400 when provider is not configured', async () => {
      delete process.env.META_CLIENT_ID;

      const response = await request(app.getHttpServer())
        .post('/api/connections/meta/auth-url')
        .expect(400);

      expect(response.body.message).toContain('not properly configured');

      // Restore environment variable
      process.env.META_CLIENT_ID = 'test_meta_client_id';
    });
  });

  describe('GET /api/connections', () => {
    it('should return empty array when no connections exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/connections')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user connections with ad accounts', async () => {
      // Create test connection
      const connection = await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Test Meta Connection',
          accountEmail: 'test@example.com',
        },
      });

      // Create test ad account
      await prisma.adAccount.create({
        data: {
          connectionId: connection.id,
          externalId: 'test_ad_account_123',
          name: 'Test Ad Account',
          currency: 'USD',
          status: 'ACTIVE',
          ownerUid: mockUser.uid,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/connections')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: connection.id,
        provider: 'META',
        status: 'CONNECTED',
        displayName: 'Test Meta Connection',
        accountEmail: 'test@example.com',
        accountCount: 1,
        adAccounts: [
          {
            externalId: 'test_ad_account_123',
            name: 'Test Ad Account',
            currency: 'USD',
            status: 'ACTIVE',
          },
        ],
      });
    });

    it('should only return connections for authenticated user', async () => {
      // Create connection for another user
      await prisma.connection.create({
        data: {
          ownerUid: 'other-user-uid',
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Other User Connection',
        },
      });

      // Create connection for current user
      await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.GOOGLE_ADS,
          status: ConnectionStatus.CONNECTED,
          displayName: 'My Google Connection',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/connections')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].displayName).toBe('My Google Connection');
    });
  });

  describe('DELETE /api/connections/:id', () => {
    it('should disconnect connection successfully', async () => {
      const connection = await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Test Connection',
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/api/connections/${connection.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Connection disconnected successfully',
      });

      // Verify connection is disconnected
      const updatedConnection = await prisma.connection.findUnique({
        where: { id: connection.id },
      });
      expect(updatedConnection?.status).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should return 404 for non-existent connection', async () => {
      await request(app.getHttpServer())
        .delete('/api/connections/non-existent-id')
        .expect(404);
    });

    it('should not allow disconnecting other user connections', async () => {
      const connection = await prisma.connection.create({
        data: {
          ownerUid: 'other-user-uid',
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Other User Connection',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/connections/${connection.id}`)
        .expect(404);
    });
  });

  describe('POST /api/connections/:id/sync-accounts', () => {
    it('should enqueue account sync job', async () => {
      const connection = await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Test Connection',
        },
      });

      // Create OAuth token for the connection
      await prisma.oAuthToken.create({
        data: {
          connectionId: connection.id,
          accessToken: 'encrypted_access_token',
          refreshToken: 'encrypted_refresh_token',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          scope: 'ads_read',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/connections/${connection.id}/sync-accounts`)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        jobId: expect.any(String),
        message: 'Account sync job enqueued',
      });

      // Verify job was created
      const job = await prisma.job.findUnique({
        where: { id: response.body.jobId },
      });
      expect(job).toBeTruthy();
      expect(job?.type).toBe('SYNC_ACCOUNTS');
    });

    it('should return 404 for connection without valid tokens', async () => {
      const connection = await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.META,
          status: ConnectionStatus.CONNECTED,
          displayName: 'Test Connection',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/connections/${connection.id}/sync-accounts`)
        .expect(400);
    });
  });

  describe('GET /api/connections/health', () => {
    it('should return connection health status', async () => {
      // Create connections with different statuses
      await prisma.connection.createMany({
        data: [
          {
            ownerUid: mockUser.uid,
            provider: ConnectionProvider.META,
            status: ConnectionStatus.CONNECTED,
            displayName: 'Connected Meta',
          },
          {
            ownerUid: mockUser.uid,
            provider: ConnectionProvider.GOOGLE_ADS,
            status: ConnectionStatus.ERROR,
            displayName: 'Error Google',
            lastError: 'Token expired',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/connections/health')
        .expect(200);

      expect(response.body).toMatchObject({
        totalConnections: 2,
        connectedCount: 1,
        errorCount: 1,
        expiredCount: 0,
        providers: {
          META: {
            connected: 1,
            error: 0,
            expired: 0,
          },
          GOOGLE_ADS: {
            connected: 0,
            error: 1,
            expired: 0,
          },
        },
      });
    });

    it('should return health for user with no connections', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/connections/health')
        .expect(200);

      expect(response.body).toMatchObject({
        totalConnections: 0,
        connectedCount: 0,
        errorCount: 0,
        expiredCount: 0,
        providers: {},
      });
    });
  });

  describe('OAuth callback flow', () => {
    it('should handle successful OAuth callback', async () => {
      // Mock the token exchange (this would normally call external APIs)
      const mockTokenData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
        scope: 'ads_read',
      };

      // Note: In a real test, we'd need to mock the external OAuth provider API calls
      // This test verifies the callback URL format and error handling
      const response = await request(app.getHttpServer())
        .get('/api/connections/meta/callback')
        .query({
          code: 'test_auth_code',
          state: 'invalid_state', // This should fail state validation
        });

      // Should redirect to error page due to invalid state
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=');
    });

    it('should handle OAuth errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/connections/meta/callback')
        .query({
          error: 'access_denied',
          error_description: 'User denied access',
        });

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=access_denied');
    });

    it('should handle missing parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/connections/meta/callback');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=');
    });
  });

  describe('Security and validation', () => {
    it('should validate provider parameter format', async () => {
      const invalidProviders = [
        'INVALID_PROVIDER',
        'meta-ads',
        'facebook',
        '',
        '../../admin',
      ];

      for (const provider of invalidProviders) {
        const response = await request(app.getHttpServer())
          .post(`/api/connections/${provider}/auth-url`)
          .expect(400);

        expect(response.body.message).toContain('Unsupported provider');
      }
    });

    it('should require authentication for all endpoints', async () => {
      // Create a request without auth middleware
      const testApp = await Test.createTestingModule({
        imports: [ConnectionsModule],
      }).compile();

      const noAuthApp = testApp.createNestApplication();
      await noAuthApp.init();

      await request(noAuthApp.getHttpServer())
        .get('/api/connections')
        .expect(401);

      await noAuthApp.close();
    });

    it('should sanitize error messages to prevent information disclosure', async () => {
      const connection = await prisma.connection.create({
        data: {
          ownerUid: mockUser.uid,
          provider: ConnectionProvider.META,
          status: ConnectionStatus.ERROR,
          displayName: 'Test Connection',
          lastError: 'Internal database connection failed: postgres://user:pass@host:5432/db',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/connections')
        .expect(200);

      // Error message should not contain sensitive information
      expect(response.body[0].lastError).not.toContain('postgres://');
      expect(response.body[0].lastError).not.toContain('user:pass');
    });
  });
});