import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConnectionsService } from './connections.service';
import { OAuthService } from './oauth.service';
import { ConnectionProvider } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    organizationId?: string;
  };
}

@Controller('api/connections')
export class ConnectionsController {
  constructor(
    private connectionsService: ConnectionsService,
    private oauthService: OAuthService,
  ) {}

  /**
   * Generate OAuth authorization URL
   * POST /api/connections/:provider/auth-url
   */
  @Post(':provider/auth-url')
  async generateAuthUrl(
    @Param('provider') provider: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ authUrl: string; provider: ConnectionProvider }> {
    const providerEnum = this.validateProvider(provider);

    if (!this.oauthService.isProviderConfigured(providerEnum)) {
      throw new BadRequestException(
        `Provider ${provider} is not properly configured. Missing environment variables: ${
          this.oauthService.getRequiredEnvVars(providerEnum).join(', ')
        }`,
      );
    }

    const authUrl = this.oauthService.generateAuthUrl(providerEnum, req.user.uid);

    return {
      authUrl,
      provider: providerEnum,
    };
  }

  /**
   * Handle OAuth callback
   * GET /api/connections/:provider/callback
   */
  @Get(':provider/callback')
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Res() res?: Response,
  ): Promise<void> {
    if (error) {
      return res?.redirect(
        `/connections?error=${encodeURIComponent(error)}&provider=${provider}`,
      );
    }

    if (!code || !state) {
      return res?.redirect(
        `/connections?error=${encodeURIComponent('Missing authorization code')}&provider=${provider}`,
      );
    }

    try {
      const providerEnum = this.validateProvider(provider);

      // Exchange code for tokens
      const tokenResponse = await this.oauthService.exchangeCodeForTokens(
        providerEnum,
        code,
        state,
      );

      // Create or update connection
      let connection;
      try {
        connection = await this.connectionsService.createConnection(
          tokenResponse.ownerUid,
          {
            provider: providerEnum,
            displayName: `${provider} Connection`,
          },
        );
      } catch (error) {
        // Connection might already exist, fetch it
        const connections = await this.connectionsService.listConnections(tokenResponse.ownerUid);
        connection = connections.find(c => c.provider === providerEnum);

        if (!connection) {
          throw error;
        }
      }

      // Store tokens
      await this.connectionsService.storeOAuthTokens(connection.id, {
        code,
        state,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        scope: tokenResponse.scope,
      });

      // Redirect to success page
      return res?.redirect(
        `/connections?success=1&provider=${provider}&connectionId=${connection.id}`,
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res?.redirect(
        `/connections?error=${encodeURIComponent(error.message)}&provider=${provider}`,
      );
    }
  }

  /**
   * List user connections
   * GET /api/connections
   */
  @Get()
  async listConnections(@Req() req: AuthenticatedRequest) {
    return this.connectionsService.listConnections(req.user.uid);
  }

  /**
   * Get connection health status
   * GET /api/connections/health
   */
  @Get('health')
  async getConnectionHealth(@Req() req: AuthenticatedRequest) {
    return this.connectionsService.getConnectionHealth(req.user.uid);
  }

  /**
   * Disconnect connection
   * DELETE /api/connections/:id
   */
  @Delete(':id')
  async disconnectConnection(
    @Param('id') connectionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    await this.connectionsService.disconnectConnection(connectionId, req.user.uid);

    return {
      success: true,
      message: 'Connection disconnected successfully',
    };
  }

  /**
   * Sync ad accounts for connection
   * POST /api/connections/:id/sync-accounts
   */
  @Post(':id/sync-accounts')
  async syncAccounts(
    @Param('id') connectionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const job = await this.connectionsService.enqueueSyncAccounts(
      connectionId,
      req.user.uid,
    );

    return {
      success: true,
      jobId: job.id,
      message: 'Account sync job enqueued',
    };
  }

  private validateProvider(provider: string): ConnectionProvider {
    const upperProvider = provider.toUpperCase().replace('-', '_');

    if (!Object.values(ConnectionProvider).includes(upperProvider as ConnectionProvider)) {
      throw new BadRequestException(
        `Unsupported provider: ${provider}. Supported providers: ${Object.values(ConnectionProvider).join(', ')}`,
      );
    }

    return upperProvider as ConnectionProvider;
  }
}