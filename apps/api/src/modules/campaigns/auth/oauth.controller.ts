import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  Param, 
  Body, 
  Res, 
  HttpException, 
  HttpStatus,
  Logger,
  UseGuards 
} from '@nestjs/common';
import { Response } from 'express';
import { OAuthService } from './oauth.service';

/**
 * OAuth Controller for Ad Platform Authentication
 * 
 * Handles OAuth2 flows for Meta and Google Ads platforms.
 * Routes for initiating auth, handling callbacks, and managing tokens.
 */
@Controller('api/campaigns/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Initiate OAuth flow for a platform
   * GET /api/campaigns/oauth/:platform/auth?userId=xxx&redirectUri=xxx
   */
  @Get(':platform/auth')
  async initiateAuth(
    @Param('platform') platform: 'meta' | 'google',
    @Query('userId') userId: string,
    @Res() res: Response,
    @Query('redirectUri') redirectUri?: string
  ) {
    try {
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      if (!['meta', 'google'].includes(platform)) {
        throw new HttpException('Invalid platform', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Initiating OAuth for platform ${platform}, user ${userId}`);

      const result = await this.oauthService.initiateOAuth(platform, userId, redirectUri);
      
      // Redirect user to platform's OAuth page
      res.redirect(result.auth_url);
    } catch (error) {
      this.logger.error(`OAuth initiation failed:`, error);
      throw new HttpException(
        'Failed to initiate OAuth flow', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Handle OAuth callback from platform
   * GET /api/campaigns/oauth/:platform/callback?code=xxx&state=xxx
   */
  @Get(':platform/callback')
  async handleCallback(
    @Param('platform') platform: 'meta' | 'google',
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Query('error') error?: string
  ) {
    try {
      // Handle OAuth errors
      if (error) {
        this.logger.warn(`OAuth error from ${platform}: ${error}`);
        return res.redirect(`${process.env.WEB_BASE_URL}/e-commerce/campaigns?error=${error}`);
      }

      if (!code || !state) {
        throw new HttpException('Missing code or state parameter', HttpStatus.BAD_REQUEST);
      }

      // Extract userId from state
      const userId = this.extractUserIdFromState(state);
      if (!userId) {
        throw new HttpException('Invalid state parameter', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Handling OAuth callback for platform ${platform}, user ${userId}`);

      const tokenResult = await this.oauthService.handleOAuthCallback(
        platform, 
        code, 
        state, 
        userId
      );

      // Store tokens securely
      await this.oauthService.storeTokens(platform, userId, tokenResult);

      // Redirect to success page
      const redirectUrl = `${process.env.WEB_BASE_URL}/e-commerce/campaigns?connected=${platform}`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      this.logger.error(`OAuth callback failed:`, error);
      const errorUrl = `${process.env.WEB_BASE_URL}/e-commerce/campaigns?error=oauth_failed`;
      res.redirect(errorUrl);
    }
  }

  /**
   * Get OAuth status for user's connected platforms
   * GET /api/campaigns/oauth/status?userId=xxx
   */
  @Get('status')
  async getOAuthStatus(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.debug(`Getting OAuth status for user ${userId}`);

      const [metaTokens, googleTokens] = await Promise.all([
        this.oauthService.getStoredTokens('meta', userId),
        this.oauthService.getStoredTokens('google', userId)
      ]);

      return {
        user_id: userId,
        platforms: {
          meta: {
            connected: !!metaTokens,
            expires_at: metaTokens?.expires_at,
            scope: metaTokens?.scope
          },
          google: {
            connected: !!googleTokens,
            expires_at: googleTokens?.expires_at,
            scope: googleTokens?.scope
          }
        }
      };
    } catch (error) {
      this.logger.error(`OAuth status check failed:`, error);
      throw new HttpException(
        'Failed to get OAuth status', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Refresh access token for a platform
   * POST /api/campaigns/oauth/:platform/refresh
   */
  @Post(':platform/refresh')
  async refreshToken(
    @Param('platform') platform: 'meta' | 'google',
    @Body() body: { userId: string }
  ) {
    try {
      const { userId } = body;
      
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      if (!['meta', 'google'].includes(platform)) {
        throw new HttpException('Invalid platform', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Refreshing token for platform ${platform}, user ${userId}`);

      // Get stored refresh token
      const storedTokens = await this.oauthService.getStoredTokens(platform, userId);
      if (!storedTokens || !storedTokens.refresh_token) {
        throw new HttpException('No refresh token available', HttpStatus.BAD_REQUEST);
      }

      // Refresh the token
      const newTokens = await this.oauthService.refreshToken(
        platform, 
        userId, 
        storedTokens.refresh_token
      );

      // Store the new tokens
      await this.oauthService.storeTokens(platform, userId, newTokens);

      return {
        success: true,
        platform,
        expires_in: newTokens.expires_in
      };
    } catch (error) {
      this.logger.error(`Token refresh failed:`, error);
      throw new HttpException(
        'Failed to refresh token', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Revoke OAuth access for a platform
   * POST /api/campaigns/oauth/:platform/revoke
   */
  @Post(':platform/revoke')
  async revokeAccess(
    @Param('platform') platform: 'meta' | 'google',
    @Body() body: { userId: string }
  ) {
    try {
      const { userId } = body;
      
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      if (!['meta', 'google'].includes(platform)) {
        throw new HttpException('Invalid platform', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Revoking access for platform ${platform}, user ${userId}`);

      // Get stored access token
      const storedTokens = await this.oauthService.getStoredTokens(platform, userId);
      if (!storedTokens) {
        throw new HttpException('No stored tokens found', HttpStatus.NOT_FOUND);
      }

      // Revoke access on platform
      const success = await this.oauthService.revokeAccess(
        platform, 
        userId, 
        storedTokens.access_token
      );

      if (success) {
        // TODO: Remove stored tokens from database
        this.logger.log(`Successfully revoked access for ${platform}`);
      }

      return {
        success,
        platform,
        revoked_at: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Access revocation failed:`, error);
      throw new HttpException(
        'Failed to revoke access', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Test platform connection with stored credentials
   * GET /api/campaigns/oauth/:platform/test?userId=xxx
   */
  @Get(':platform/test')
  async testConnection(
    @Param('platform') platform: 'meta' | 'google',
    @Query('userId') userId: string
  ) {
    try {
      if (!userId) {
        throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
      }

      if (!['meta', 'google'].includes(platform)) {
        throw new HttpException('Invalid platform', HttpStatus.BAD_REQUEST);
      }

      this.logger.debug(`Testing connection for platform ${platform}, user ${userId}`);

      const storedTokens = await this.oauthService.getStoredTokens(platform, userId);
      if (!storedTokens) {
        return {
          connected: false,
          error: 'No stored credentials'
        };
      }

      // TODO: Test actual API connection using stored tokens
      // For now, just check if tokens exist and are not expired
      const now = new Date();
      const expiresAt = new Date(storedTokens.expires_at);
      const isExpired = now >= expiresAt;

      return {
        platform,
        connected: !isExpired,
        expires_at: storedTokens.expires_at,
        scope: storedTokens.scope,
        needs_refresh: isExpired
      };
    } catch (error) {
      this.logger.error(`Connection test failed:`, error);
      return {
        connected: false,
        error: 'Connection test failed'
      };
    }
  }

  // ==================== Helper Methods ====================

  private extractUserIdFromState(state: string): string | null {
    try {
      const decoded = Buffer.from(state, 'base64url').toString();
      const [userId] = decoded.split(':');
      return userId;
    } catch {
      return null;
    }
  }
}