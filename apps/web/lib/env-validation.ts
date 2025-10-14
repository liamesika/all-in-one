/**
 * Environment Variable Validation System
 * Validates all required environment variables at startup
 * Fails fast if critical vars are missing
 */

interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  category: 'firebase' | 'database' | 'stripe' | 'redis' | 'other';
  validate?: (value: string) => boolean;
}

const ENV_SCHEMA: EnvVariable[] = [
  // Firebase Admin (Server-side)
  {
    name: 'FIREBASE_ADMIN_PROJECT_ID',
    description: 'Firebase project ID for server-side auth',
    required: true,
    category: 'firebase',
  },
  {
    name: 'FIREBASE_ADMIN_CLIENT_EMAIL',
    description: 'Firebase service account email',
    required: true,
    category: 'firebase',
    validate: (val) => val.includes('@') && val.includes('.iam.gserviceaccount.com'),
  },
  {
    name: 'FIREBASE_ADMIN_PRIVATE_KEY',
    description: 'Firebase service account private key',
    required: true,
    category: 'firebase',
    validate: (val) => val.includes('BEGIN PRIVATE KEY') || val.includes('\\n'),
  },

  // Firebase Public (Client-side)
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    description: 'Firebase API key for client',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    description: 'Firebase auth domain',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase project ID for client',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    description: 'Firebase storage bucket',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase messaging sender ID',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    description: 'Firebase app ID',
    required: true,
    category: 'firebase',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_DB_URL',
    description: 'Firebase Realtime Database URL',
    required: true,
    category: 'firebase',
  },

  // Database
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string (pooled)',
    required: true,
    category: 'database',
    validate: (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
  },
  {
    name: 'DIRECT_URL',
    description: 'PostgreSQL direct connection string',
    required: true,
    category: 'database',
    validate: (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
  },

  // Stripe (Billing)
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for server-side operations',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('sk_'),
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signing secret',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('whsec_'),
  },
  {
    name: 'STRIPE_PRICE_BASIC',
    description: 'Stripe Price ID for Basic plan',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('price_'),
  },
  {
    name: 'STRIPE_PRICE_PRO',
    description: 'Stripe Price ID for Pro plan',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('price_'),
  },
  {
    name: 'STRIPE_PRICE_AGENCY',
    description: 'Stripe Price ID for Agency plan',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('price_'),
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key for client',
    required: true,
    category: 'stripe',
    validate: (val) => val.startsWith('pk_'),
  },

  // Redis (Rate Limiting)
  {
    name: 'REDIS_URL',
    description: 'Redis connection URL for rate limiting',
    required: false,
    category: 'redis',
    validate: (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    description: 'Upstash Redis REST URL (alternative to REDIS_URL)',
    required: false,
    category: 'redis',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis REST token',
    required: false,
    category: 'redis',
  },

  // Other
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth encryption secret',
    required: false,
    category: 'other',
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'NextAuth base URL',
    required: false,
    category: 'other',
  },
];

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    required: number;
    optional: number;
    missing: number;
    invalid: number;
  };
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let missing = 0;
  let invalid = 0;

  for (const envVar of ENV_SCHEMA) {
    const value = process.env[envVar.name];

    // Check if required var is missing
    if (envVar.required && !value) {
      errors.push(
        `❌ ${envVar.name} is REQUIRED but not set\n` +
        `   Description: ${envVar.description}\n` +
        `   Category: ${envVar.category}`
      );
      missing++;
      continue;
    }

    // Check if optional var is missing (just warn)
    if (!envVar.required && !value) {
      warnings.push(
        `⚠️  ${envVar.name} is optional but not set\n` +
        `   Description: ${envVar.description}`
      );
      continue;
    }

    // Validate value format if validator exists
    if (value && envVar.validate && !envVar.validate(value)) {
      errors.push(
        `❌ ${envVar.name} has invalid format\n` +
        `   Description: ${envVar.description}\n` +
        `   Current value: ${value.substring(0, 20)}...`
      );
      invalid++;
    }
  }

  const summary = {
    total: ENV_SCHEMA.length,
    required: ENV_SCHEMA.filter(e => e.required).length,
    optional: ENV_SCHEMA.filter(e => !e.required).length,
    missing,
    invalid,
  };

  return {
    success: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}

/**
 * Print validation results
 */
export function printValidationResults(result: ValidationResult): void {
  console.log('\n========================================');
  console.log('  ENVIRONMENT VARIABLE VALIDATION');
  console.log('========================================\n');

  console.log('Summary:');
  console.log(`  Total variables: ${result.summary.total}`);
  console.log(`  Required: ${result.summary.required}`);
  console.log(`  Optional: ${result.summary.optional}`);
  console.log(`  Missing: ${result.summary.missing}`);
  console.log(`  Invalid: ${result.summary.invalid}\n`);

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    result.errors.forEach(error => console.log(`\n${error}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.log(`\n${warning}`));
    console.log('');
  }

  if (result.success) {
    console.log('✅ All required environment variables are valid!\n');
  } else {
    console.log('❌ Environment validation FAILED\n');
    console.log('Please fix the above errors before proceeding.\n');
  }

  console.log('========================================\n');
}

/**
 * Validate and throw if validation fails
 * Use this in server startup
 */
export function requireValidEnv(): void {
  const result = validateEnv();
  printValidationResults(result);

  if (!result.success) {
    throw new Error('Environment validation failed. See logs above for details.');
  }
}

/**
 * Get environment variable with validation
 */
export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];

  if (!value && !fallback) {
    throw new Error(`Environment variable ${name} is not set and no fallback provided`);
  }

  return value || fallback!;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get environment name
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as any) || 'development';
}
