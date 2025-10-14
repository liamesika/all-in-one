#!/usr/bin/env ts-node
/**
 * Environment Variable Validation Script
 * Run this before build/deploy to ensure all required vars are set
 *
 * Usage:
 *   npx ts-node scripts/validate-env.ts
 *   npm run validate:env
 */

import { validateEnv, printValidationResults } from '../lib/env-validation';

// Run validation
const result = validateEnv();
printValidationResults(result);

// Exit with error code if validation failed
if (!result.success) {
  console.error('\n❌ Environment validation failed. Exiting with code 1.\n');
  process.exit(1);
}

console.log('✅ Environment validation passed. Ready to build/deploy.\n');
process.exit(0);
