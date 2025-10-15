#!/usr/bin/env node

/**
 * CI Check: Prevent route group page.tsx violations
 *
 * This script ensures:
 * 1. No page.tsx files inside route groups import/re-export other pages
 * 2. Root app/page.tsx doesn't import from route group pages
 * 3. All pages are either at root or in route groups, never both
 *
 * Prevents Next.js clientReferenceManifest errors caused by:
 * - Server components importing from route group pages
 * - Barrel exports mixing server/client boundaries
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const appDir = path.join(__dirname, '../app');

// Check if root page.tsx exists
const rootPagePath = path.join(appDir, 'page.tsx');
const hasRootPage = fs.existsSync(rootPagePath);

// Find all route group pages
function findRouteGroupPages(dir, routeGroupPages = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Check if this is a route group (starts with parentheses)
      if (entry.name.match(/^\(.+\)$/)) {
        const pagePath = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          routeGroupPages.push(pagePath);
        }
      }
      // Recurse into subdirectories
      findRouteGroupPages(fullPath, routeGroupPages);
    }
  }

  return routeGroupPages;
}

const routeGroupPages = findRouteGroupPages(appDir);

// Rule 1: Check if root page imports from route group pages
if (hasRootPage) {
  const rootContent = fs.readFileSync(rootPagePath, 'utf-8');

  for (const routePage of routeGroupPages) {
    const relPath = path.relative(appDir, routePage);
    const importPattern = new RegExp(`from ['"].*${relPath.replace('.tsx', '')}['"]`);

    if (importPattern.test(rootContent)) {
      errors.push(
        `❌ Root app/page.tsx imports from route group page: ${relPath}\n` +
        `   This causes Next.js clientReferenceManifest errors.\n` +
        `   Import components directly instead of importing the page.`
      );
    }
  }

  // Check for re-exports
  if (/export\s+{[^}]*}\s+from\s+['"].*\([^)]+\)\/page/.test(rootContent)) {
    errors.push(
      `❌ Root app/page.tsx re-exports from a route group page\n` +
      `   This breaks Next.js RSC manifest resolution.`
    );
  }
}

// Rule 2: Warn if both root and route group pages exist
if (hasRootPage && routeGroupPages.length > 0) {
  console.log(
    `⚠️  WARNING: Both root app/page.tsx and route group pages exist.\n` +
    `   Ensure root page doesn't import from route group pages.\n` +
    `   Found route group pages:`
  );
  routeGroupPages.forEach(p => {
    console.log(`   - ${path.relative(appDir, p)}`);
  });
  console.log('');
}

// Rule 3: Check route group pages don't import other pages
for (const routePage of routeGroupPages) {
  const content = fs.readFileSync(routePage, 'utf-8');

  if (/import.*from ['"].*\/page['"]/.test(content)) {
    errors.push(
      `❌ Route group page imports another page: ${path.relative(appDir, routePage)}\n` +
      `   Pages should not import other pages. Extract shared components.`
    );
  }

  if (/export.*from ['"].*\/page/.test(content)) {
    errors.push(
      `❌ Route group page re-exports from another page: ${path.relative(appDir, routePage)}\n` +
      `   This creates circular dependencies and RSC issues.`
    );
  }
}

// Report results
if (errors.length > 0) {
  console.error('\n🚨 Route Group Violations Found:\n');
  errors.forEach(err => console.error(err + '\n'));
  console.error('Fix these issues to prevent Next.js clientReferenceManifest errors.\n');
  process.exit(1);
}

console.log('✅ No route group violations found. Safe to build!');
process.exit(0);
