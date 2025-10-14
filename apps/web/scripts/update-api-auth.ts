#!/usr/bin/env ts-node
/**
 * Script to systematically update all API routes with authentication middleware
 * Usage: npx ts-node scripts/update-api-auth.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface RouteUpdate {
  filePath: string;
  hasAuth: boolean;
  needsUpdate: boolean;
  routeType: 'auth-only' | 'auth-and-org' | 'public' | 'webhook';
}

// Routes that should remain public (no auth required)
const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/firebase/session',
  '/api/billing/webhooks', // Stripe webhook - uses signature verification instead
  '/api/debug/', // Debug routes - for development only
];

// Routes that need both auth and org context
const ORG_CONTEXT_ROUTES = [
  '/api/billing/',
  '/api/organizations/',
  '/api/permissions/',
];

function shouldRouteBePublic(filePath: string): boolean {
  return PUBLIC_ROUTES.some(route => filePath.includes(route));
}

function needsOrgContext(filePath: string): boolean {
  return ORG_CONTEXT_ROUTES.some(route => filePath.includes(route));
}

function analyzeRoute(filePath: string): RouteUpdate {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already using withAuth or withAuthAndOrg
  const hasAuth = content.includes('withAuth(') || content.includes('withAuthAndOrg(');

  // Determine route type
  let routeType: RouteUpdate['routeType'];
  if (shouldRouteBePublic(filePath)) {
    routeType = 'public';
  } else if (filePath.includes('/api/billing/webhooks')) {
    routeType = 'webhook';
  } else if (needsOrgContext(filePath)) {
    routeType = 'auth-and-org';
  } else {
    routeType = 'auth-only';
  }

  return {
    filePath,
    hasAuth,
    needsUpdate: !hasAuth && routeType !== 'public' && routeType !== 'webhook',
    routeType,
  };
}

async function main() {
  console.log('🔍 Analyzing API routes for authentication updates...\n');

  // Find all route files
  const routeFiles = await glob('app/api/**/route.ts', {
    cwd: path.join(__dirname, '..'),
    absolute: true,
  });

  console.log(`Found ${routeFiles.length} route files\n`);

  // Analyze each route
  const analysis: RouteUpdate[] = routeFiles.map(analyzeRoute);

  // Group by status
  const needsUpdate = analysis.filter(a => a.needsUpdate);
  const hasAuth = analysis.filter(a => a.hasAuth);
  const isPublic = analysis.filter(a => a.routeType === 'public' || a.routeType === 'webhook');

  console.log('📊 Summary:');
  console.log(`  ✅ Already protected: ${hasAuth.length}`);
  console.log(`  🔒 Needs authentication: ${needsUpdate.length}`);
  console.log(`  🌐 Public/Webhook routes: ${isPublic.length}\n`);

  if (needsUpdate.length > 0) {
    console.log('🔧 Routes needing updates:\n');

    needsUpdate.forEach((route, index) => {
      const relativePath = path.relative(path.join(__dirname, '..'), route.filePath);
      console.log(`${index + 1}. ${relativePath}`);
      console.log(`   Type: ${route.routeType}\n`);
    });
  }

  console.log('\n✅ Analysis complete!');
  console.log('\nNext steps:');
  console.log('1. Review the routes that need authentication');
  console.log('2. Update each route to use withAuth() or withAuthAndOrg()');
  console.log('3. Remove hardcoded "demo-user" and x-owner-uid header checks');
  console.log('4. Test authentication flow end-to-end');
}

main().catch(console.error);
