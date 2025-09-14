import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { InsightsService, InsightsQuery } from './insights.service';
import { ConnectionProvider } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    organizationId?: string;
  };
}

@Controller('api/insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  /**
   * Get insights for a provider/account
   * GET /api/insights/:provider/accounts/:accountId
   */
  @Get(':provider/accounts/:accountId')
  async getAccountInsights(
    @Param('provider') provider: string,
    @Param('accountId') accountId: string,
    @Query() query: InsightsQuery,
    @Req() req: AuthenticatedRequest,
  ) {
    const providerEnum = this.validateProvider(provider);

    const insights = await this.insightsService.getInsights(
      req.user.uid,
      providerEnum,
      accountId,
      query,
    );

    return {
      success: true,
      insights,
      provider: providerEnum,
      accountId,
      window: query.window || '7',
      total: insights.length,
    };
  }

  /**
   * Get insights for all accounts of a provider
   * GET /api/insights/:provider
   */
  @Get(':provider')
  async getProviderInsights(
    @Param('provider') provider: string,
    @Query() query: InsightsQuery,
    @Req() req: AuthenticatedRequest,
  ) {
    const providerEnum = this.validateProvider(provider);

    const insights = await this.insightsService.getInsights(
      req.user.uid,
      providerEnum,
      undefined, // No specific account
      query,
    );

    return {
      success: true,
      insights,
      provider: providerEnum,
      window: query.window || '7',
      total: insights.length,
    };
  }

  /**
   * Trigger fresh insights fetch from providers
   * POST /api/insights/refresh
   */
  @Post('refresh')
  async refreshInsights(
    @Query('connectionId') connectionId?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    await this.insightsService.fetchInsightsFromProviders(
      req.user.uid,
      connectionId,
    );

    return {
      success: true,
      message: 'Insights refresh initiated',
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