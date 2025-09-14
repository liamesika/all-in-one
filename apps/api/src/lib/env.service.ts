import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),

  // API Configuration
  API_BASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('3001'),

  // Token Encryption
  TOKEN_CRYPTO_KEY: z.string().min(24), // Base64 encoded 32-byte key should be at least 24 chars

  // Redis (optional for development)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().int()).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // Meta OAuth
  META_CLIENT_ID: z.string().optional(),
  META_CLIENT_SECRET: z.string().optional(),
  META_REDIRECT_URI: z.string().url().optional(),

  // Google Ads OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // TikTok Ads OAuth
  TIKTOK_CLIENT_ID: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_REDIRECT_URI: z.string().url().optional(),

  // LinkedIn Ads OAuth
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().url().optional(),

  // Firebase (optional)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

@Injectable()
export class EnvService {
  private readonly logger = new Logger(EnvService.name);
  private readonly config: EnvConfig;

  constructor() {
    this.config = this.validateEnv();
    this.logConfigStatus();
  }

  private validateEnv(): EnvConfig {
    try {
      const parsed = EnvSchema.parse(process.env);
      this.logger.log('Environment variables validated successfully');
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join('\n');

        this.logger.error(`Environment validation failed:\n${formattedErrors}`);
        throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
      }
      throw error;
    }
  }

  private logConfigStatus(): void {
    const providers = [
      { name: 'Meta', configured: this.isProviderConfigured('META') },
      { name: 'Google Ads', configured: this.isProviderConfigured('GOOGLE') },
      { name: 'TikTok Ads', configured: this.isProviderConfigured('TIKTOK') },
      { name: 'LinkedIn Ads', configured: this.isProviderConfigured('LINKEDIN') },
    ];

    this.logger.log('Platform integration status:');
    providers.forEach(provider => {
      const status = provider.configured ? '✅ Configured' : '❌ Missing credentials';
      this.logger.log(`  ${provider.name}: ${status}`);
    });

    // Log additional service status
    const services = [
      { name: 'Redis', configured: !!this.config.REDIS_HOST },
      { name: 'Firebase', configured: !!this.config.FIREBASE_PROJECT_ID },
      { name: 'OpenAI', configured: !!this.config.OPENAI_API_KEY },
    ];

    this.logger.log('Additional services:');
    services.forEach(service => {
      const status = service.configured ? '✅ Configured' : '⚠️  Optional - Not configured';
      this.logger.log(`  ${service.name}: ${status}`);
    });
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  getAll(): EnvConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  isProviderConfigured(provider: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'): boolean {
    const clientId = this.config[`${provider}_CLIENT_ID` as keyof EnvConfig];
    const clientSecret = this.config[`${provider}_CLIENT_SECRET` as keyof EnvConfig];
    const redirectUri = this.config[`${provider}_REDIRECT_URI` as keyof EnvConfig];

    return !!(clientId && clientSecret && redirectUri);
  }

  getProviderCredentials(provider: 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN'): {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  } | null {
    if (!this.isProviderConfigured(provider)) {
      return null;
    }

    return {
      clientId: this.config[`${provider}_CLIENT_ID` as keyof EnvConfig] as string,
      clientSecret: this.config[`${provider}_CLIENT_SECRET` as keyof EnvConfig] as string,
      redirectUri: this.config[`${provider}_REDIRECT_URI` as keyof EnvConfig] as string,
    };
  }

  /**
   * Get sanitized config for logging (removes sensitive data)
   */
  getSanitizedConfig(): Record<string, any> {
    const sanitized = { ...this.config };

    // Mask sensitive keys
    const sensitiveKeys = [
      'JWT_SECRET',
      'TOKEN_CRYPTO_KEY',
      'META_CLIENT_SECRET',
      'GOOGLE_CLIENT_SECRET',
      'TIKTOK_CLIENT_SECRET',
      'LINKEDIN_CLIENT_SECRET',
      'FIREBASE_PRIVATE_KEY',
      'OPENAI_API_KEY',
      'REDIS_PASSWORD',
    ];

    sensitiveKeys.forEach(key => {
      if (sanitized[key as keyof EnvConfig]) {
        (sanitized as any)[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Validate that a 32-byte key is properly base64 encoded
   */
  validateCryptoKey(): void {
    const key = this.config.TOKEN_CRYPTO_KEY;
    try {
      const decoded = Buffer.from(key, 'base64');
      if (decoded.length !== 32) {
        throw new Error(`TOKEN_CRYPTO_KEY must decode to exactly 32 bytes, got ${decoded.length} bytes`);
      }
      this.logger.log('Crypto key validation passed');
    } catch (error) {
      this.logger.error('Invalid TOKEN_CRYPTO_KEY format - must be base64-encoded 32-byte key');
      throw error;
    }
  }
}