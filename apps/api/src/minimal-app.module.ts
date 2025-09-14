import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RealEstatePropertiesModule } from './modules/real-estate-properties/real-estate-properties.module';
import { RealEstateLeadsModule } from './modules/real-estate-leads/real-estate-leads.module';
import { PingController } from './ping.controller';

@Module({
  imports: [AuthModule, RealEstatePropertiesModule, RealEstateLeadsModule],
  controllers: [PingController],
  providers: [],
})
export class MinimalAppModule {}