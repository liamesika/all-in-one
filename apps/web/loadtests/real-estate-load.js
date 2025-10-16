import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 200 }, // Peak at 200 users
    { duration: '1m', target: 100 },  // Ramp down to 100
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
    errors: ['rate<0.1'],              // Less than 10% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Dashboard load
  let dashboardRes = http.get(`${BASE_URL}/dashboard/real-estate/dashboard`);
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Properties list
  let propertiesRes = http.get(`${BASE_URL}/dashboard/real-estate/properties`);
  check(propertiesRes, {
    'properties status is 200': (r) => r.status === 200,
    'properties loads in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Leads list
  let leadsRes = http.get(`${BASE_URL}/dashboard/real-estate/leads`);
  check(leadsRes, {
    'leads status is 200': (r) => r.status === 200,
    'leads loads in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: API endpoint (properties)
  let apiRes = http.get(`${BASE_URL}/api/real-estate/properties`, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(apiRes, {
    'api responds': (r) => r.status === 200 || r.status === 401, // 401 expected without auth
    'api responds fast': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);
}
