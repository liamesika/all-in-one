import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute
    }, {
      name: 'medium',
      ttl: 300000, // 5 minutes
      limit: 20, // 20 requests per 5 minutes
    }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService],
  exports: [AuthService, PrismaService],
})
export class AuthModule {}
