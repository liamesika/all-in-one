import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { ProductionAnalyticsService } from './production-analytics.service';
import { ProductionAnalyticsQueryDto } from './dto/production-analytics.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import { CanViewAnalytics } from './decorators/production-roles.decorator';

@Controller('production/analytics')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionAnalyticsController {
  constructor(private readonly productionAnalyticsService: ProductionAnalyticsService) {}

  @Get()
  @CanViewAnalytics()
  async getAnalytics(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionAnalyticsQueryDto,
  ) {
    const { organization } = req;

    const analytics = await this.productionAnalyticsService.getAnalytics(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('dashboard-kpis')
  @CanViewAnalytics()
  async getDashboardKPIs(@Req() req: AuthenticatedRequest) {
    const { organization } = req;

    const kpis = await this.productionAnalyticsService.getDashboardKPIs(
      organization.ownerUserId,
      organization.id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dashboard KPIs retrieved successfully',
      data: kpis,
    };
  }
}