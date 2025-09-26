import { Module } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';

// Services
import { ProductionProjectService } from './production-project.service';
import { ProductionTaskService } from './production-task.service';
import { ProductionBudgetService } from './production-budget.service';
import { ProductionSupplierService } from './production-supplier.service';
import { ProductionFileService } from './production-file.service';
import { ProductionAnalyticsService } from './production-analytics.service';

// Controllers
import { ProductionProjectController } from './production-project.controller';
import { ProductionTaskController } from './production-task.controller';
import { ProductionBudgetController } from './production-budget.controller';
import { ProductionSupplierController } from './production-supplier.controller';
import { ProductionFileController } from './production-file.controller';
import { ProductionAnalyticsController } from './production-analytics.controller';

// Guards
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';

@Module({
  imports: [],
  controllers: [
    ProductionProjectController,
    ProductionTaskController,
    ProductionBudgetController,
    ProductionSupplierController,
    ProductionFileController,
    ProductionAnalyticsController,
  ],
  providers: [
    PrismaService,
    ProductionProjectService,
    ProductionTaskService,
    ProductionBudgetService,
    ProductionSupplierService,
    ProductionFileService,
    ProductionAnalyticsService,
    ProductionPermissionsGuard,
  ],
  exports: [
    ProductionProjectService,
    ProductionTaskService,
    ProductionBudgetService,
    ProductionSupplierService,
    ProductionFileService,
    ProductionAnalyticsService,
  ],
})
export class ProductionModule {}