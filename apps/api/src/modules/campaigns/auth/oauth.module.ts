import { Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';

/**
 * OAuth Module for Campaign Platform Authentication
 * 
 * Provides OAuth2 authentication flows for advertising platforms
 * like Meta (Facebook/Instagram) and Google Ads.
 */
@Module({
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService] // Export for use in other modules
})
export class OAuthModule {}