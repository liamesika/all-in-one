import { Module, MiddlewareConsumer } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationScopeMiddleware } from '../auth/middleware/organization-scope.middleware';
import { RoleGuard } from '../auth/guards/role.guard';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    RoleGuard,
    AuditService,
    PrismaService
  ],
  exports: [OrganizationsService]
})
export class OrganizationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OrganizationScopeMiddleware)
      .forRoutes(OrganizationsController);
  }
}