import { Injectable, BadRequestException } from '@nestjs/common';
import { CryptoService } from '../../lib/crypto.service';
import { ProviderClientService } from '../../lib/provider-client.service';
import { ConnectionProvider } from '@prisma/client';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authBaseUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private crypto: CryptoService,
    private providerClient: ProviderClientService
  ) {}

  private getProviderConfig(provider: ConnectionProvider): OAuthConfig {
    const baseRedirectUri = process.env.API_BASE_URL || 'http://localhost:3001';

    switch (provider) {
      case ConnectionProvider.META:
        return {
          clientId: process.env.META_APP_ID!,
          clientSecret: process.env.META_APP_SECRET!,
          redirectUri: `${baseRedirectUri}/api/connections/meta/callback`,
          scopes: [
            'ads_management',
            'ads_read',
            'business_management',
            'read_insights',
          ],
          authBaseUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
          tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
          revokeUrl: 'https://graph.facebook.com/v18.0/me/permissions',
        };

      case ConnectionProvider.GOOGLE_ADS:
        return {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          redirectUri: `${baseRedirectUri}/api/connections/google-ads/callback`,
          scopes: [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
          ],
          authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          revokeUrl: 'https://oauth2.googleapis.com/revoke',
        };

      case ConnectionProvider.TIKTOK_ADS:
        return {
          clientId: process.env.TIKTOK_APP_ID!,
          clientSecret: process.env.TIKTOK_SECRET!,
          redirectUri: `${baseRedirectUri}/api/connections/tiktok-ads/callback`,
          scopes: [
            'user_info.basic',
            'video.list',
            'business.get',
            'tt_user.basic.read',
          ],
          authBaseUrl: 'https://ads.tiktok.com/marketing_api/auth',
          tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
        };

      case ConnectionProvider.LINKEDIN_ADS:
        return {
          clientId: process.env.LINKEDIN_CLIENT_ID!,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirectUri: `${baseRedirectUri}/api/connections/linkedin-ads/callback`,
          scopes: [
            'r_liteprofile',
            'r_emailaddress',
            'r_ads',
            'r_ads_reporting',
            'rw_ads',
          ],
          authBaseUrl: 'https://www.linkedin.com/oauth/v2/authorization',
          tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        };

      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(provider: ConnectionProvider, ownerUid: string): string {
    const config = this.getProviderConfig(provider);
    const state = this.generateState(ownerUid, provider);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state,
      access_type: 'offline', // Request refresh token
    });

    // Provider-specific parameters
    if (provider === ConnectionProvider.GOOGLE_ADS) {
      params.append('prompt', 'consent');
    }

    return `${config.authBaseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    provider: ConnectionProvider,
    code: string,
    state: string,
  ): Promise<OAuthTokenResponse & { ownerUid: string }> {
    const config = this.getProviderConfig(provider);
    const { ownerUid } = this.validateState(state, provider);

    const tokenData = await this.fetchTokens(config, code);

    return {
      ...tokenData,
      ownerUid,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    provider: ConnectionProvider,
    refreshToken: string,
  ): Promise<OAuthTokenResponse> {
    const config = this.getProviderConfig(provider);

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new BadRequestException(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(
    provider: ConnectionProvider,
    accessToken: string,
  ): Promise<void> {
    const config = this.getProviderConfig(provider);

    if (!config.revokeUrl) {
      return; // Some providers don't have revoke endpoints
    }

    try {
      const params = new URLSearchParams({
        token: accessToken,
      });

      const response = await fetch(config.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        console.warn(`Token revocation failed for ${provider}: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Token revocation error for ${provider}:`, error.message);
    }
  }

  private async fetchTokens(
    config: OAuthConfig,
    code: string,
  ): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    });

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      const tokenData = await response.json();

      if (!tokenData.access_token) {
        throw new Error('No access token in response');
      }

      return tokenData;
    } catch (error) {
      throw new BadRequestException(`OAuth token exchange failed: ${error.message}`);
    }
  }

  private generateState(ownerUid: string, provider: ConnectionProvider): string {
    const stateData = {
      ownerUid,
      provider,
      timestamp: Date.now(),
      nonce: this.crypto.generateSecureRandom(16),
    };

    return Buffer.from(JSON.stringify(stateData)).toString('base64url');
  }

  private validateState(
    state: string,
    expectedProvider: ConnectionProvider,
  ): { ownerUid: string; provider: ConnectionProvider } {
    try {
      const stateData = JSON.parse(
        Buffer.from(state, 'base64url').toString('utf8'),
      );

      if (!stateData.ownerUid || !stateData.provider || !stateData.timestamp) {
        throw new Error('Invalid state format');
      }

      if (stateData.provider !== expectedProvider) {
        throw new Error('Provider mismatch in state');
      }

      // Check if state is not too old (15 minutes max)
      const maxAge = 15 * 60 * 1000; // 15 minutes
      if (Date.now() - stateData.timestamp > maxAge) {
        throw new Error('State has expired');
      }

      return stateData;
    } catch (error) {
      throw new BadRequestException(`Invalid OAuth state: ${error.message}`);
    }
  }

  /**
   * Get required environment variables for a provider
   */
  getRequiredEnvVars(provider: ConnectionProvider): string[] {
    switch (provider) {
      case ConnectionProvider.META:
        return ['META_APP_ID', 'META_APP_SECRET'];
      case ConnectionProvider.GOOGLE_ADS:
        return ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
      case ConnectionProvider.TIKTOK_ADS:
        return ['TIKTOK_APP_ID', 'TIKTOK_SECRET'];
      case ConnectionProvider.LINKEDIN_ADS:
        return ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'];
      default:
        return [];
    }
  }

  /**
   * Check if provider is properly configured
   */
  isProviderConfigured(provider: ConnectionProvider): boolean {
    const requiredVars = this.getRequiredEnvVars(provider);
    return requiredVars.every(varName => !!process.env[varName]);
  }
}