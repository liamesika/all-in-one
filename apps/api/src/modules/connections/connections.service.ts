import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { CryptoService } from '../../lib/crypto.service';
import {
  ConnectionProvider,
  ConnectionStatus,
  JobType,
  JobStatus,
  Connection,
  OAuthToken,
  AdAccount,
  Job
} from '@prisma/client';

export interface CreateConnectionDto {
  provider: ConnectionProvider;
  displayName?: string;
  accountEmail?: string;
}

export interface OAuthCallbackData {
  code: string;
  state: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  /**
   * Create a new connection for a user
   */
  async createConnection(
    ownerUid: string,
    data: CreateConnectionDto,
    organizationId?: string,
  ): Promise<Connection> {
    // Check if connection already exists
    const existing = await this.prisma.connection.findUnique({
      where: {
        ownerUid_provider: {
          ownerUid,
          provider: data.provider,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Connection to ${data.provider} already exists`,
      );
    }

    return this.prisma.connection.create({
      data: {
        ownerUid,
        organizationId,
        provider: data.provider,
        displayName: data.displayName,
        accountEmail: data.accountEmail,
        status: ConnectionStatus.DISCONNECTED,
      },
    });
  }

  /**
   * Store OAuth tokens securely
   */
  async storeOAuthTokens(
    connectionId: string,
    tokenData: OAuthCallbackData,
  ): Promise<void> {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = this.crypto.encrypt(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken
      ? this.crypto.encrypt(tokenData.refreshToken)
      : null;

    // Calculate expiry time
    const expiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : null;

    // Upsert OAuth token
    await this.prisma.oAuthToken.upsert({
      where: { connectionId },
      create: {
        connectionId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenData.scope,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenData.scope,
        lastRefreshAt: new Date(),
        refreshCount: {
          increment: 1,
        },
      },
    });

    // Update connection status
    await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.CONNECTED,
        lastSyncAt: new Date(),
        lastErrorAt: null,
        lastError: null,
      },
    });
  }

  /**
   * Get decrypted access token for API calls
   */
  async getAccessToken(connectionId: string): Promise<string | null> {
    const token = await this.prisma.oAuthToken.findUnique({
      where: { connectionId },
    });

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (token.expiresAt && token.expiresAt < new Date()) {
      // Try to refresh token
      const refreshed = await this.refreshToken(connectionId);
      if (!refreshed) {
        return null;
      }
      // Get the refreshed token
      const refreshedToken = await this.prisma.oAuthToken.findUnique({
        where: { connectionId },
      });
      return refreshedToken ? this.crypto.decrypt(refreshedToken.accessToken) : null;
    }

    return this.crypto.decrypt(token.accessToken);
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(connectionId: string): Promise<boolean> {
    const token = await this.prisma.oAuthToken.findUnique({
      where: { connectionId },
      include: { connection: true },
    });

    if (!token || !token.refreshToken) {
      await this.markConnectionExpired(connectionId);
      return false;
    }

    try {
      // This would call the appropriate provider's refresh endpoint
      // For now, we'll mark it as needing implementation
      const refreshTokenValue = this.crypto.decrypt(token.refreshToken);

      // TODO: Implement provider-specific token refresh
      // const refreshedTokens = await this.refreshTokenWithProvider(
      //   token.connection.provider,
      //   refreshTokenValue
      // );

      // For now, just update the refresh timestamp
      await this.prisma.oAuthToken.update({
        where: { connectionId },
        data: {
          lastRefreshAt: new Date(),
          refreshCount: {
            increment: 1,
          },
        },
      });

      return true;
    } catch (error) {
      await this.markConnectionExpired(connectionId, error.message);
      return false;
    }
  }

  /**
   * Mark connection as expired
   */
  private async markConnectionExpired(
    connectionId: string,
    error?: string,
  ): Promise<void> {
    await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.EXPIRED,
        lastErrorAt: new Date(),
        lastError: error || 'Token expired and refresh failed',
      },
    });
  }

  /**
   * List connections for a user
   */
  async listConnections(ownerUid: string): Promise<Array<Connection & {
    adAccounts: AdAccount[];
    _count: { adAccounts: number };
  }>> {
    return this.prisma.connection.findMany({
      where: { ownerUid },
      include: {
        adAccounts: {
          where: { isActive: true },
          take: 10, // Limit for performance
        },
        _count: {
          select: { adAccounts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get connection by ID
   */
  async getConnection(
    connectionId: string,
    ownerUid: string,
  ): Promise<Connection | null> {
    return this.prisma.connection.findFirst({
      where: {
        id: connectionId,
        ownerUid,
      },
    });
  }

  /**
   * Disconnect and revoke connection
   */
  async disconnectConnection(
    connectionId: string,
    ownerUid: string,
  ): Promise<void> {
    const connection = await this.getConnection(connectionId, ownerUid);
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // TODO: Revoke tokens with the provider
    // await this.revokeTokensWithProvider(connection.provider, accessToken);

    // Delete OAuth tokens
    await this.prisma.oAuthToken.deleteMany({
      where: { connectionId },
    });

    // Update connection status
    await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: ConnectionStatus.DISCONNECTED,
        lastErrorAt: new Date(),
        lastError: 'Connection manually disconnected',
      },
    });
  }

  /**
   * Enqueue sync accounts job
   */
  async enqueueSyncAccounts(
    connectionId: string,
    ownerUid: string,
  ): Promise<Job> {
    const connection = await this.getConnection(connectionId, ownerUid);
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new BadRequestException('Connection is not in CONNECTED state');
    }

    return this.prisma.job.create({
      data: {
        ownerUid,
        connectionId,
        type: JobType.SYNC_ACCOUNTS,
        status: JobStatus.PENDING,
        inputData: {
          provider: connection.provider,
        },
        scheduledFor: new Date(),
      },
    });
  }

  /**
   * Get connection health status
   */
  async getConnectionHealth(ownerUid: string): Promise<Array<{
    connectionId: string;
    provider: ConnectionProvider;
    status: ConnectionStatus;
    isHealthy: boolean;
    lastCheck: Date | null;
    errorMessage?: string;
  }>> {
    const connections = await this.prisma.connection.findMany({
      where: { ownerUid },
      include: {
        oauthTokens: true,
      },
    });

    return connections.map(connection => {
      const hasValidToken = connection.oauthTokens.some(token =>
        !token.expiresAt || token.expiresAt > new Date()
      );

      return {
        connectionId: connection.id,
        provider: connection.provider,
        status: connection.status,
        isHealthy: connection.status === ConnectionStatus.CONNECTED && hasValidToken,
        lastCheck: connection.lastSyncAt,
        errorMessage: connection.lastError || undefined,
      };
    });
  }
}