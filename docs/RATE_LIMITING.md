# Rate Limiting Implementation Guide

## Overview

EFFINITY uses Redis-backed rate limiting to protect API endpoints from abuse while ensuring fair usage for all users. The system supports:

- **Distributed rate limiting** across multiple servers
- **Per-user and per-IP** limiting
- **Route-specific limits** for different operation types
- **Sliding window algorithm** for accurate rate tracking
- **Graceful degradation** if Redis is unavailable

## Quick Start

### 1. Install Dependencies

```bash
pnpm add @upstash/redis
```

### 2. Configure Environment Variables

```bash
# Option 1: Upstash Redis (recommended for serverless)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Option 2: Standard Redis
REDIS_URL=redis://localhost:6379
```

### 3. Apply Rate Limiting to Routes

#### Basic Usage (Standard Limits)

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const GET = rateLimit(
  async (request: NextRequest) => {
    // Your handler logic
    return NextResponse.json({ data: 'success' });
  },
  RateLimitPresets.STANDARD // 100 req/min
);
```

#### With Authentication

```typescript
import { rateLimitWithAuth, RateLimitPresets } from '@/lib/rate-limit';

export const POST = rateLimitWithAuth(
  async (request, { user }) => {
    // Handler has both auth and rate limiting
    return NextResponse.json({ message: 'Protected and rate-limited' });
  },
  RateLimitPresets.AI_OPERATIONS // 10 req/min for AI endpoints
);
```

#### Custom Configuration

```typescript
import { rateLimit } from '@/lib/rate-limit';

export const POST = rateLimit(
  async (request) => {
    // Your handler
    return NextResponse.json({ success: true });
  },
  {
    limit: 30,      // 30 requests
    window: 60,     // per 60 seconds
    identifier: (req) => req.headers.get('x-api-key') || 'anonymous',
    skip: (req) => req.headers.get('x-admin') === 'true', // Skip for admins
  }
);
```

## Rate Limit Presets

Pre-configured limits for common scenarios:

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `STANDARD` | 100 req | 60s | General API calls |
| `AI_OPERATIONS` | 10 req | 60s | AI-powered features (search, chat, generation) |
| `IMPORT_EXPORT` | 5 req | 60s | CSV imports, bulk operations |
| `CAMPAIGNS` | 20 req | 60s | Campaign CRUD operations |
| `FILE_UPLOAD` | 10 req | 300s | File/image uploads |
| `AUTH` | 5 req | 60s | Login, registration (per IP) |
| `WEBHOOKS` | 100 req | 60s | Incoming webhooks |
| `SEARCH` | 50 req | 60s | Search and filtering |

## Route-Specific Implementation

### AI-Powered Endpoints

```typescript
// apps/web/app/api/real-estate/ai-advisor/route.ts
import { rateLimitWithAuth, RateLimitPresets } from '@/lib/rate-limit';

export const POST = rateLimitWithAuth(
  async (request, { user }) => {
    // AI logic here
    return NextResponse.json({ advice: '...' });
  },
  RateLimitPresets.AI_OPERATIONS // 10 req/min
);
```

### Import/Export Operations

```typescript
// apps/web/app/api/real-estate/leads/import/route.ts
import { rateLimitWithAuth, RateLimitPresets } from '@/lib/rate-limit';

export const POST = rateLimitWithAuth(
  async (request, { user }) => {
    // Import CSV logic
    return NextResponse.json({ imported: 100 });
  },
  RateLimitPresets.IMPORT_EXPORT // 5 req/min
);
```

### Campaign Operations

```typescript
// apps/web/app/api/campaigns/route.ts
import { rateLimitWithAuth, RateLimitPresets } from '@/lib/rate-limit';

export const POST = rateLimitWithAuth(
  async (request, { user }) => {
    // Create campaign
    return NextResponse.json({ campaign: {...} });
  },
  RateLimitPresets.CAMPAIGNS // 20 req/min
);
```

### File Uploads

```typescript
// apps/web/app/api/uploads/route.ts
import { rateLimitWithAuth, RateLimitPresets } from '@/lib/rate-limit';

export const POST = rateLimitWithAuth(
  async (request, { user }) => {
    // Upload file to S3
    return NextResponse.json({ url: '...' });
  },
  RateLimitPresets.FILE_UPLOAD // 10 req/5min
);
```

## Response Headers

All rate-limited responses include these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735678900000
```

When limit is exceeded (429 response):

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735678900000
Retry-After: 60
```

## Client-Side Handling

### Fetch with Rate Limit Handling

```typescript
async function apiCall(endpoint: string) {
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const data = await response.json();

    console.error(`Rate limit exceeded. Retry after ${retryAfter}s`);
    throw new Error(data.message);
  }

  return response.json();
}
```

### Axios Interceptor

```typescript
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`Rate limited. Retry in ${retryAfter}s`);

      // Show toast notification
      toast.error(`Too many requests. Please wait ${retryAfter} seconds.`);
    }
    return Promise.reject(error);
  }
);
```

## Monitoring & Admin

### Check Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/rate-limit';

const status = await getRateLimitStatus('ratelimit:/api/ai-advisor:user:123');
console.log(status);
// { success: true, limit: 10, remaining: 7, reset: 1735678900000 }
```

### Clear Rate Limit (Admin/Testing)

```typescript
import { clearRateLimit } from '@/lib/rate-limit';

// Clear rate limit for specific user
await clearRateLimit('ratelimit:/api/ai-advisor:user:123');
```

## Testing

### Unit Tests

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    const handler = rateLimit(
      async () => NextResponse.json({ ok: true }),
      { limit: 5, window: 60 }
    );

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const response = await handler(new NextRequest('http://localhost/api/test'));
      expect(response.status).toBe(200);
    }
  });

  it('should block requests exceeding limit', async () => {
    const handler = rateLimit(
      async () => NextResponse.json({ ok: true }),
      { limit: 2, window: 60 }
    );

    // Exceed limit
    await handler(new NextRequest('http://localhost/api/test'));
    await handler(new NextRequest('http://localhost/api/test'));

    const response = await handler(new NextRequest('http://localhost/api/test'));
    expect(response.status).toBe(429);
  });
});
```

### Integration Tests

```typescript
// Test actual API endpoint
it('should rate limit AI advisor endpoint', async () => {
  const requests = [];

  // Make 15 requests (limit is 10)
  for (let i = 0; i < 15; i++) {
    requests.push(
      fetch('/api/real-estate/ai-advisor', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question: 'test' }),
      })
    );
  }

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);

  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## Production Deployment

### Environment Setup

1. **Create Upstash Redis Database** (recommended for serverless):
   - Go to [upstash.com](https://upstash.com)
   - Create new Redis database
   - Copy REST URL and token

2. **Add to Vercel/Production**:
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   ```

3. **Verify Configuration**:
   ```bash
   npm run validate:env
   ```

### Monitoring

Monitor rate limit metrics in production:

```typescript
// Log rate limit hits
console.log('[Rate Limit]', {
  endpoint: request.nextUrl.pathname,
  user: user.uid,
  remaining: result.remaining,
  limit: result.limit,
});

// Alert on frequent 429s
if (response.status === 429) {
  analytics.track('rate_limit_exceeded', {
    endpoint,
    user_id,
    timestamp: Date.now(),
  });
}
```

## Performance Optimization

### 1. Redis Connection Pooling

Upstash REST API automatically handles connection pooling.

### 2. Caching Rate Limit Checks

For high-traffic endpoints, consider caching the rate limit check:

```typescript
const cached = cache.get(`rl:${userId}`);
if (cached && cached.remaining > 0) {
  return handler(request);
}
```

### 3. Async Rate Limit Updates

Update rate limits asynchronously to reduce latency:

```typescript
// Fire and forget
updateRateLimit(key).catch(console.error);
return handler(request);
```

## Troubleshooting

### Issue: Rate limits not working

**Check:**
1. Redis environment variables are set
2. Redis connection is successful
3. Middleware is applied to route

```bash
# Test Redis connection
curl $UPSTASH_REDIS_REST_URL -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

### Issue: Rate limits too strict/lenient

**Solution:** Adjust presets or create custom configuration:

```typescript
const customLimit = {
  limit: process.env.NODE_ENV === 'development' ? 1000 : 50,
  window: 60,
};
```

### Issue: Users hitting rate limits legitimately

**Solution:** Implement rate limit bypass for premium users:

```typescript
skip: (req) => {
  const user = getUserFromRequest(req);
  return user?.plan === 'ENTERPRISE'; // No limits for enterprise
}
```

---

**Last Updated:** 2025-10-13
**Status:** Production Ready
**Next Steps:** Apply to remaining high-traffic endpoints
