// apps/api/src/modules/usage-tracking/usage-tracking.controller.ts
import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsageTrackingService } from './usage-tracking.service';

@Controller('usage')
// @UseGuards(JwtAuthGuard) // TODO: Add authentication
export class UsageTrackingController {
  constructor(
    private readonly usageTrackingService: UsageTrackingService,
  ) {}

  /**
   * Get usage summary for organization
   * GET /usage/summary?startDate=2025-01-01&endDate=2025-01-31
   */
  @Get('summary')
  async getUsageSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const { organizationId } = this.extractAuthContext(req);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.usageTrackingService.getUsageSummary(organizationId, start, end);
  }

  /**
   * Get storage quota for organization
   * GET /usage/storage
   */
  @Get('storage')
  async getStorageQuota(@Req() req: any) {
    const { organizationId } = this.extractAuthContext(req);

    return this.usageTrackingService.getStorageQuota(organizationId);
  }

  /**
   * Extract authentication context from request
   */
  private extractAuthContext(req: any): {
    organizationId: string;
    ownerUid: string;
    userId?: string;
  } {
    return {
      organizationId: req.user?.orgId || req.headers['x-org-id'],
      ownerUid: req.user?.ownerUid || req.headers['x-owner-uid'],
      userId: req.user?.id || req.headers['x-user-id'],
    };
  }
}
