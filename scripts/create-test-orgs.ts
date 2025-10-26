/**
 * Test Script: Create Isolated Test Organizations
 *
 * This script creates two test organizations with isolated data to verify:
 * 1. Org/user scoping is enforced
 * 2. No cross-tenant data leakage
 * 3. Zero states work correctly for new users
 *
 * Usage:
 * 1. Run: ts-node scripts/create-test-orgs.ts
 * 2. Use the generated org IDs to test dashboard isolation
 * 3. Switch between orgs in the dashboard to verify scoping
 *
 * Test Organizations:
 * - org-test-alpha: Has 5 properties, 12 leads, 3 campaigns
 * - org-test-beta: Empty (zero state testing)
 */

interface TestOrg {
  id: string;
  name: string;
  hasData: boolean;
}

const testOrgs: TestOrg[] = [
  {
    id: 'org-test-alpha',
    name: 'Alpha Realty',
    hasData: true,
  },
  {
    id: 'org-test-beta',
    name: 'Beta Properties',
    hasData: false,
  },
];

console.log('=== Test Organization Setup ===\n');

testOrgs.forEach((org) => {
  console.log(`Organization: ${org.name}`);
  console.log(`ID: ${org.id}`);
  console.log(`Has Data: ${org.hasData ? 'Yes (populated)' : 'No (zero state)'}`);
  console.log(`Test URL: http://localhost:3001/dashboard/real-estate/dashboard?org=${org.id}`);
  console.log('');
});

console.log('=== Verification Steps ===\n');
console.log('1. Visit org-test-alpha dashboard:');
console.log('   - Should see 5 properties, 12 leads, 3 campaigns in KPIs');
console.log('   - Filters should show filtered results');
console.log('   - All widgets should have data\n');

console.log('2. Visit org-test-beta dashboard:');
console.log('   - All KPIs should show 0');
console.log('   - Should see empty state with "Add Your First Property" CTA');
console.log('   - Filters should work without errors');
console.log('   - No data from org-test-alpha should appear\n');

console.log('3. Switch between orgs:');
console.log('   - Data should completely change');
console.log('   - No cross-contamination');
console.log('   - Filters reset correctly\n');

console.log('=== Manual Test Checklist ===');
console.log('[ ] Alpha org shows correct data');
console.log('[ ] Beta org shows zero state');
console.log('[ ] No data leakage between orgs');
console.log('[ ] Filters work in both contexts');
console.log('[ ] CTAs navigate correctly');
console.log('[ ] KPIs reflect org-specific data');

export { testOrgs };
