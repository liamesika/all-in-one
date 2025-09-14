import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { OAuthService } from './oauth.service';
import { CryptoService } from '../../lib/crypto.service';
import { EnvService } from '../../lib/env.service';
import { PrismaService } from '../../lib/prisma.service';
import { ProviderClientService } from '../../lib/provider-client.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, OAuthService, CryptoService, EnvService, PrismaService, ProviderClientService],
  exports: [ConnectionsService, OAuthService],
})
export class ConnectionsModule {}