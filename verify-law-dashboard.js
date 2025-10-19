/**
 * Automated verification script for Law Dashboard
 * Run: node verify-law-dashboard.js
 */

const http = require('http');

const DASHBOARD_URL = 'http://localhost:3001/dashboard/law/dashboard';

async function checkServer() {
  return new Promise((resolve, reject) => {
    http.get(DASHBOARD_URL, (res) => {
      console.log('✅ Server Status:', res.statusCode);
      console.log('✅ Content-Type:', res.headers['content-type']);

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Check for key content
        const checks = {
          'Law Dashboard title': data.includes('Law Dashboard'),
          'Active Cases KPI': data.includes('Active Cases'),
          'Recent Cases widget': data.includes('Recent Cases'),
          'Upcoming Tasks widget': data.includes('Upcoming Tasks'),
          'Theme CSS loaded': data.includes('law-theme') || data.includes('law-bg'),
        };

        console.log('\n📊 Content Checks:');
        Object.entries(checks).forEach(([name, pass]) => {
          console.log(pass ? `✅ ${name}` : `❌ ${name}`);
        });

        resolve(checks);
      });
    }).on('error', (err) => {
      console.error('❌ Server Error:', err.message);
      reject(err);
    });
  });
}

async function verifyFiles() {
  const fs = require('fs');
  const path = require('path');

  const files = [
    'apps/web/styles/themes/law.theme.css',
    'apps/web/lib/themes/law-theme-config.ts',
    'apps/web/components/law/shared/LawCard.tsx',
    'apps/web/components/law/shared/LawButton.tsx',
    'apps/web/components/law/shared/LawBadge.tsx',
    'apps/web/components/law/shared/LawSkeleton.tsx',
    'apps/web/components/law/shared/LawEmptyState.tsx',
    'apps/web/app/dashboard/law/dashboard/NewLawDashboard.tsx',
    'LAW-DASHBOARD-PROTOTYPE-SUMMARY.md',
  ];

  console.log('\n📁 File Verification:');
  files.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(exists ? `✅ ${file}` : `❌ ${file} MISSING`);
  });
}

async function verifyThemeTokens() {
  const fs = require('fs');
  const path = require('path');

  const themePath = path.join(__dirname, 'apps/web/styles/themes/law.theme.css');
  const themeCSS = fs.readFileSync(themePath, 'utf8');

  const tokens = [
    '--law-bg',
    '--law-surface',
    '--law-primary',
    '--law-accent',
    '--law-secondary',
    '--law-border',
    '--law-line-height-normal',
  ];

  console.log('\n🎨 Theme Token Verification:');
  tokens.forEach(token => {
    const exists = themeCSS.includes(token);
    console.log(exists ? `✅ ${token}` : `❌ ${token} MISSING`);
  });
}

async function verifyComponents() {
  const fs = require('fs');
  const path = require('path');

  const dashboardPath = path.join(__dirname, 'apps/web/app/dashboard/law/dashboard/NewLawDashboard.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

  const features = [
    'law_dashboard_view',         // Analytics event
    'law_quick_action',            // Analytics event
    'trackEventWithConsent',       // Consent-based tracking
    'LawCard',                     // Component usage
    'LawButton',                   // Component usage
    'CaseStatusBadge',             // Component usage
    'LawDashboardKPISkeleton',     // Skeleton state
    'NoCasesEmptyState',           // Empty state
    'framer-motion',               // Animations
    'min-h-[44px]',                // Mobile tap targets
  ];

  console.log('\n⚙️ Dashboard Features:');
  features.forEach(feature => {
    const exists = dashboardCode.includes(feature);
    console.log(exists ? `✅ ${feature}` : `❌ ${feature} MISSING`);
  });
}

async function main() {
  console.log('🔍 Law Dashboard Verification\n');
  console.log('='.repeat(50));

  try {
    await verifyFiles();
    await verifyThemeTokens();
    await verifyComponents();
    await checkServer();

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Automated verification complete!');
    console.log('\n📋 Manual testing required:');
    console.log('   - Lighthouse mobile audit (see UAT_INSTRUCTIONS.md)');
    console.log('   - GA4 DebugView screenshots');
    console.log('   - Loom walkthrough recording');
    console.log('   - Full UAT checklist completion');
    console.log('\n📖 See UAT_INSTRUCTIONS.md for details');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main();
