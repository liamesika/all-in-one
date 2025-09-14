import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { CryptoService } from '../../lib/crypto.service';
import { ProviderClientService } from '../../lib/provider-client.service';
import { ConnectionProvider } from '@prisma/client';

describe('OAuthService', () => {
  let service: OAuthService;
  let cryptoService: jest.Mocked<CryptoService>;
  let providerClient: jest.Mocked<ProviderClientService>;

  const mockCryptoService = {
    generateSecureRandom: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  const mockProviderClient = {
    requestOAuthToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: ProviderClientService,
          useValue: mockProviderClient,
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    cryptoService = module.get(CryptoService);
    providerClient = module.get(ProviderClientService);

    // Mock environment variables
    process.env.API_BASE_URL = 'http://localhost:3001';
    process.env.META_CLIENT_ID = 'meta_client_id';
    process.env.META_CLIENT_SECRET = 'meta_client_secret';
    process.env.GOOGLE_CLIENT_ID = 'google_client_id';
    process.env.GOOGLE_CLIENT_SECRET = 'google_client_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthUrl', () => {
    it('should generate valid auth URL for Meta', () => {
      const ownerUid = 'test-user-id';
      mockCryptoService.generateSecureRandom.mockReturnValue('random-state');

      const authUrl = service.generateAuthUrl(ConnectionProvider.META, ownerUid);

      expect(authUrl).toContain('https://www.facebook.com/v18.0/dialog/oauth');
      expect(authUrl).toContain('client_id=meta_client_id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state=random-state');
      expect(authUrl).toContain('scope=ads_management%2Cads_read%2Cbusiness_management%2Cread_insights');
      expect(cryptoService.generateSecureRandom).toHaveBeenCalledWith(32);
    });

    it('should generate valid auth URL for Google Ads', () => {
      const ownerUid = 'test-user-id';
      mockCryptoService.generateSecureRandom.mockReturnValue('random-state');

      const authUrl = service.generateAuthUrl(ConnectionProvider.GOOGLE_ADS, ownerUid);

      expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(authUrl).toContain('client_id=google_client_id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state=random-state');
      expect(authUrl).toContain('access_type=offline');
    });

    it('should include proper redirect URI', () => {
      const ownerUid = 'test-user-id';
      mockCryptoService.generateSecureRandom.mockReturnValue('random-state');

      const authUrl = service.generateAuthUrl(ConnectionProvider.META, ownerUid);

      expect(authUrl).toContain('redirect_uri=http%3A//localhost%3A3001/api/connections/meta/callback');
    });
  });

  describe('exchangeCodeForTokens', () => {
    const mockTokenResponse = {
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'ads_read ads_management',
    };

    beforeEach(() => {
      mockProviderClient.requestOAuthToken.mockResolvedValue({
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        requestId: 'test-request-id',
      });

      // Mock state validation
      const mockState = 'encrypted-state-value';
      mockCryptoService.decrypt.mockReturnValue(JSON.stringify({
        ownerUid: 'test-user-id',
        provider: 'META',
        timestamp: Date.now(),
      }));
    });

    it('should exchange code for tokens successfully', async () => {
      const result = await service.exchangeCodeForTokens(
        ConnectionProvider.META,
        'test-auth-code',
        'encrypted-state-value'
      );

      expect(result).toEqual({
        ...mockTokenResponse,
        ownerUid: 'test-user-id',
      });

      expect(mockProviderClient.requestOAuthToken).toHaveBeenCalledWith(
        'META',
        'https://graph.facebook.com/v18.0/oauth/access_token',
        expect.objectContaining({
          client_id: 'meta_client_id',
          client_secret: 'meta_client_secret',
          code: 'test-auth-code',
          grant_type: 'authorization_code',
        })
      );
    });

    it('should validate state parameter', async () => {
      mockCryptoService.decrypt.mockImplementation(() => {
        throw new Error('Invalid state');
      });

      await expect(
        service.exchangeCodeForTokens(
          ConnectionProvider.META,
          'test-auth-code',
          'invalid-state'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate state timestamp (prevent replay attacks)', async () => {
      const expiredTimestamp = Date.now() - (11 * 60 * 1000); // 11 minutes ago
      mockCryptoService.decrypt.mockReturnValue(JSON.stringify({
        ownerUid: 'test-user-id',
        provider: 'META',
        timestamp: expiredTimestamp,
      }));

      await expect(
        service.exchangeCodeForTokens(
          ConnectionProvider.META,
          'test-auth-code',
          'expired-state'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle token exchange errors', async () => {
      mockProviderClient.requestOAuthToken.mockRejectedValue(
        new Error('Token exchange failed')
      );

      await expect(
        service.exchangeCodeForTokens(
          ConnectionProvider.META,
          'test-auth-code',
          'valid-state'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshResponse = {
      access_token: 'new_access_token',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    beforeEach(() => {
      mockProviderClient.requestOAuthToken.mockResolvedValue({
        data: mockRefreshResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        requestId: 'test-request-id',
      });
    });

    it('should refresh access token successfully', async () => {
      const result = await service.refreshAccessToken(
        ConnectionProvider.META,
        'test_refresh_token'
      );

      expect(result).toEqual(mockRefreshResponse);

      expect(mockProviderClient.requestOAuthToken).toHaveBeenCalledWith(
        'META',
        'https://graph.facebook.com/v18.0/oauth/access_token',
        expect.objectContaining({
          client_id: 'meta_client_id',
          client_secret: 'meta_client_secret',
          refresh_token: 'test_refresh_token',
          grant_type: 'refresh_token',
        })
      );
    });

    it('should handle refresh token errors', async () => {
      mockProviderClient.requestOAuthToken.mockRejectedValue(
        new Error('Invalid refresh token')
      );

      await expect(
        service.refreshAccessToken(
          ConnectionProvider.META,
          'invalid_refresh_token'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('revokeTokens', () => {
    it('should revoke tokens successfully for Meta', async () => {
      mockProviderClient.requestOAuthToken.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        requestId: 'test-request-id',
      });

      await expect(
        service.revokeTokens(ConnectionProvider.META, 'test_access_token')
      ).resolves.not.toThrow();
    });

    it('should handle revocation errors gracefully', async () => {
      mockProviderClient.requestOAuthToken.mockRejectedValue(
        new Error('Token revocation failed')
      );

      // Should not throw, just log the error
      await expect(
        service.revokeTokens(ConnectionProvider.META, 'test_access_token')
      ).resolves.not.toThrow();
    });
  });

  describe('validateState', () => {
    it('should validate and decrypt state correctly', () => {
      const stateData = {
        ownerUid: 'test-user-id',
        provider: 'META',
        timestamp: Date.now(),
      };

      mockCryptoService.decrypt.mockReturnValue(JSON.stringify(stateData));

      const result = (service as any).validateState('encrypted-state', ConnectionProvider.META);

      expect(result).toEqual({ ownerUid: 'test-user-id' });
      expect(cryptoService.decrypt).toHaveBeenCalledWith('encrypted-state');
    });

    it('should throw for mismatched provider', () => {
      const stateData = {
        ownerUid: 'test-user-id',
        provider: 'GOOGLE_ADS',
        timestamp: Date.now(),
      };

      mockCryptoService.decrypt.mockReturnValue(JSON.stringify(stateData));

      expect(() => {
        (service as any).validateState('encrypted-state', ConnectionProvider.META);
      }).toThrow(BadRequestException);
    });
  });

  describe('configuration validation', () => {
    it('should detect properly configured providers', () => {
      expect((service as any).isProviderConfigured(ConnectionProvider.META)).toBe(true);
      expect((service as any).isProviderConfigured(ConnectionProvider.GOOGLE_ADS)).toBe(true);
    });

    it('should detect missing configuration', () => {
      delete process.env.META_CLIENT_ID;

      expect((service as any).isProviderConfigured(ConnectionProvider.META)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should provide helpful error messages for missing environment variables', () => {
      delete process.env.META_CLIENT_ID;
      delete process.env.META_CLIENT_SECRET;

      const requiredVars = (service as any).getRequiredEnvVars(ConnectionProvider.META);

      expect(requiredVars).toEqual([
        'META_CLIENT_ID',
        'META_CLIENT_SECRET',
        'API_BASE_URL'
      ]);
    });

    it('should handle network timeouts gracefully', async () => {
      mockProviderClient.requestOAuthToken.mockRejectedValue({
        code: 'TIMEOUT',
        message: 'Request timed out'
      });

      await expect(
        service.exchangeCodeForTokens(
          ConnectionProvider.META,
          'test-code',
          'valid-state'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('security measures', () => {
    it('should never log sensitive data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      service.generateAuthUrl(ConnectionProvider.META, 'test-user-id');

      const allLogs = [...consoleSpy.mock.calls, ...consoleErrorSpy.mock.calls]
        .flat()
        .join(' ');

      expect(allLogs).not.toContain('meta_client_id');
      expect(allLogs).not.toContain('meta_client_secret');

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should generate cryptographically secure state values', () => {
      mockCryptoService.generateSecureRandom.mockReturnValue('crypto-secure-random');

      service.generateAuthUrl(ConnectionProvider.META, 'test-user-id');

      expect(cryptoService.generateSecureRandom).toHaveBeenCalledWith(32);
    });
  });
});