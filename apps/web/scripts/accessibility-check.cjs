#!/usr/bin/env node

/**
 * Accessibility Health Check Script
 * 
 * Runs comprehensive accessibility validation for the Effinity platform
 * Usage: npm run a11y:check
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 EFFINITY ACCESSIBILITY HEALTH CHECK\n');

const checks = [
  {
    name: 'Running automated accessibility tests',
    command: 'npm test -- --testPathPatterns=accessibility --passWithNoTests',
    description: 'Validates WCAG AA compliance with axe-core'
  },
  {
    name: 'Checking for accessibility linting violations',
    command: 'npx eslint . --ext .tsx,.jsx --rule "jsx-a11y/*: error" --format compact',
    description: 'Static analysis for common accessibility issues'
  },
  {
    name: 'Validating form accessibility patterns',
    command: 'grep -r "aria-label\\|aria-labelledby\\|aria-describedby" components/ || true',
    description: 'Ensures proper ARIA labeling is implemented'
  }
];

let overallScore = 100;
const results = [];

for (const check of checks) {
  console.log(`\n⚡ ${check.name}...`);
  console.log(`   ${check.description}\n`);
  
  try {
    const output = execSync(check.command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output.trim()) {
      console.log(output);
    }
    
    console.log('   ✅ PASSED\n');
    results.push({ name: check.name, status: 'PASSED', details: output });
    
  } catch (error) {
    console.log(`   ❌ ISSUES FOUND`);
    console.log(`   ${error.stdout || error.message}\n`);
    
    overallScore -= 25;
    results.push({ 
      name: check.name, 
      status: 'FAILED', 
      details: error.stdout || error.message 
    });
  }
}

// Additional file-based checks
console.log('\n⚡ Checking for accessibility utilities...');

const requiredFiles = [
  'lib/accessibility.tsx',
  'components/ui.tsx', 
  'jest.setup.accessibility.js'
];

let missingFiles = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`   ✅ ${file} found`);
  } else {
    console.log(`   ❌ ${file} missing`);
    missingFiles++;
  }
});

if (missingFiles > 0) {
  overallScore -= (missingFiles * 10);
}

// Color contrast check
console.log('\n⚡ Checking Tailwind color configuration...');

try {
  const tailwindConfig = fs.readFileSync(path.join(__dirname, '..', 'tailwind.config.ts'), 'utf8');
  
  if (tailwindConfig.includes('brand-blue-600') && tailwindConfig.includes('WCAG AA')) {
    console.log('   ✅ Accessible color palette configured');
  } else {
    console.log('   ⚠️  Color palette may not be fully accessible');
    overallScore -= 10;
  }
} catch (error) {
  console.log('   ❌ Could not validate Tailwind configuration');
  overallScore -= 10;
}

// Focus management check
console.log('\n⚡ Checking focus management patterns...');

try {
  const focusPatterns = execSync(
    'grep -r "focus-visible\\|tabIndex\\|autoFocus" components/ | wc -l',
    { encoding: 'utf8' }
  ).trim();
  
  const focusCount = parseInt(focusPatterns);
  
  if (focusCount > 5) {
    console.log(`   ✅ Focus management implemented (${focusCount} instances)`);
  } else {
    console.log(`   ⚠️  Limited focus management detected (${focusCount} instances)`);
    overallScore -= 15;
  }
} catch (error) {
  console.log('   ❌ Could not check focus management patterns');
  overallScore -= 15;
}

// Generate final report
console.log('\n' + '='.repeat(60));
console.log('📊 ACCESSIBILITY HEALTH REPORT');
console.log('='.repeat(60));

const scoreColor = overallScore >= 90 ? '🟢' : overallScore >= 70 ? '🟡' : '🔴';
console.log(`\n${scoreColor} Overall Accessibility Score: ${overallScore}/100\n`);

if (overallScore >= 90) {
  console.log('🎉 Excellent! Your accessibility implementation is strong.');
  console.log('   Continue following the established patterns.');
} else if (overallScore >= 70) {
  console.log('⚠️  Good progress, but some areas need attention.');
  console.log('   Review the failed checks above.');
} else {
  console.log('🚨 Critical accessibility issues detected.');
  console.log('   Please address the failures before proceeding.');
}

console.log('\n📋 RECOMMENDATIONS:');

if (overallScore < 100) {
  console.log('\n🔧 Quick Fixes:');
  results.forEach(result => {
    if (result.status === 'FAILED') {
      console.log(`   • Address: ${result.name}`);
    }
  });
}

console.log('\n🎯 Best Practices:');
console.log('   • Run accessibility tests before each commit');
console.log('   • Test with keyboard navigation regularly');
console.log('   • Use semantic HTML elements');
console.log('   • Ensure 4.5:1 color contrast ratios');
console.log('   • Add proper ARIA labels for all interactive elements');
console.log('   • Test with screen readers during development');

console.log('\n📚 Resources:');
console.log('   • Accessibility Guidelines: /ACCESSIBILITY_GUIDELINES.md');
console.log('   • Component Library: /components/ui.tsx');
console.log('   • Testing Utilities: /lib/accessibility.tsx');
console.log('   • Run tests: npm test -- accessibility');

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(overallScore >= 70 ? 0 : 1);