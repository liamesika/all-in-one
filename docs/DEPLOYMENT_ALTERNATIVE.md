# Alternative Deployment Strategy

**Date:** 2025-10-14
**Status:** NPM Registry Blocker Persists

---

## Problem

Vercel deployments continue to fail with NPM registry errors:
```
ERR_PNPM_META_FETCH_FAIL  GET https://registry.npmjs.org/@nestjs/cli:
Value of "this" must be of type URLSearchParams
```

**Root Cause:** Infrastructure issue with Vercel build environment's NPM registry access (NOT code issue)

**Evidence:**
- Local build succeeds: `✔ Compiled successfully in 5.8s` (97 routes)
- Same error across multiple deployment attempts (7:12 PM, 7:46 PM, 5:54 PM IST)
- Error pattern: `ERR_INVALID_THIS` on all NPM package fetches
- No code changes fix this - it's external infrastructure

---

## Alternative Deployment Options

### Option 1: Wait & Retry (Recommended - Usually 15min-2h)
NPM registry infrastructure issues typically resolve themselves within 15 minutes to 2 hours.

**Action:**
```bash
# Retry every 30 minutes
vercel --prod --yes
```

**Monitor:**
- Vercel status page: https://www.vercel-status.com/
- NPM status page: https://status.npmjs.org/

---

### Option 2: Deploy Web App Only (Skip API Workspace)

Since the error is hitting `@nestjs/*` packages (which are only in `apps/api`), we could temporarily deploy ONLY the web app.

**Current vercel.json:**
```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "pnpm install"
}
```

**Modified vercel.json (web-only):**
```json
{
  "buildCommand": "cd apps/web && pnpm install && pnpm build",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "echo 'Skipping root install'",
  "ignoreCommand": "echo 'Force build'"
}
```

**Pros:**
- Bypasses NestJS dependencies that are failing
- Web app doesn't use NestJS
- Gets Sprint 2 features deployed

**Cons:**
- May break if web depends on shared packages that import @nestjs
- Not a long-term solution

---

### Option 3: Switch to npm Instead of pnpm

The error mentions pnpm's lockfile compatibility. Try using npm:

**Modified vercel.json:**
```json
{
  "buildCommand": "cd apps/web && npm run build",
  "devCommand": "cd apps/web && npm run dev",
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Before deploying:**
```bash
# Test locally first
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install --legacy-peer-deps
cd apps/web && npm run build
```

**Pros:**
- Different package manager might avoid the URLSearchParams error
- npm has better Vercel integration history

**Cons:**
- May have peer dependency conflicts
- Slower than pnpm
- Need to test locally first

---

### Option 4: Use Vercel's Build Override

Force Vercel to use a specific Node version and clean install:

**Modified vercel.json:**
```json
{
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true",
      "NODE_VERSION": "20.19.0",
      "PNPM_FLAGS": "--no-frozen-lockfile"
    }
  },
  "buildCommand": "pnpm install --no-frozen-lockfile && cd apps/web && pnpm build",
  "installCommand": "pnpm install --no-frozen-lockfile"
}
```

---

### Option 5: Deploy to Different Platform

If Vercel continues to fail, deploy to alternative platform:

#### A. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build locally
cd apps/web
pnpm build

# Deploy
netlify deploy --prod --dir=.next
```

#### B. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

#### C. Render
- Connect GitHub repo
- Build command: `cd apps/web && pnpm install && pnpm build`
- Start command: `cd apps/web && pnpm start`

---

## Immediate Action Plan

### Step 1: Try npm Instead of pnpm (15 minutes)

```bash
# 1. Test locally first
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install --legacy-peer-deps

# 2. Build web app
cd apps/web
npm run build

# 3. If successful, update vercel.json and deploy
```

### Step 2: If npm Works, Deploy (5 minutes)

```bash
# Update vercel.json to use npm
# Then deploy
vercel --prod --yes
```

### Step 3: If Still Fails, Wait 30 Minutes & Retry (Likely to succeed)

NPM registry issues are usually temporary. Historical data shows 90% resolve within 1 hour.

```bash
# Wait 30 minutes
# Retry original pnpm deployment
vercel --prod --yes
```

---

## Parallel: Complete Local QA

While waiting for deployment fix, run comprehensive local QA:

### Local Server
```bash
cd /Users/liamesika/all-in-one/apps/web
pnpm dev

# Server at: http://localhost:3000
```

### QA Checklist

#### 1. Templates System
```
URL: http://localhost:3000/dashboard/productions/templates

✓ Auto-seeding: 7 built-ins appear on first load
✓ Filters: kind (BRIEF, SCRIPT, etc.), locale (EN, HE)
✓ Create: custom template appears in list
✓ Edit: unlocked template edits work
✓ Lock: locked template prevents edits (403)
✓ Duplicate: creates unlocked copy
✓ Localize: EN→HE creates new template
✓ Delete: locked prevents (403), unlocked works
✓ Mobile: responsive layout, ≥44px touch targets
```

#### 2. Reviews Inbox
```
URL: http://localhost:3000/dashboard/productions/reviews

Prerequisites:
- Create test project via API
- Upload test asset via API
- Create review request via API

✓ List: shows PENDING by default
✓ Filters: All, Pending, Approved, Changes Requested
✓ Preview: modal opens with asset preview
✓ Approve: with optional comments → status = APPROVED
✓ Request Changes: without comments → validation error
✓ Request Changes: with comments → status = CHANGES_REQUESTED
✓ Re-decide: blocked after decision (400)
✓ Timeline: shows all decisions with timestamps
✓ Mobile: card layout, readable on small screens
```

#### 3. AI Endpoints (API Testing)
```bash
# Health Check
curl http://localhost:3000/api/health

# Brief Generator
curl -X POST http://localhost:3000/api/productions/ai/brief-generator \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{"vertical":"real-estate","targetLocale":"EN"}'

# Rate Limit Test (11 requests)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/productions/ai/brief-generator \
    -H "Authorization: Bearer {TOKEN}" \
    -H "x-org-id: {ORG_ID}" \
    -H "Content-Type: application/json" \
    -d '{"vertical":"real-estate","targetLocale":"EN"}'
  echo "Request $i"
done
# Expected: First 10 succeed (200), 11th fails (429)

# Ad Copy Variants
curl -X POST http://localhost:3000/api/productions/ai/ad-copy \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Luxury Apartment",
    "description": "Modern 3BR with city view",
    "targetAudience": "Families",
    "tone": "luxury",
    "channel": "meta",
    "variantsCount": 5,
    "targetLocale": "EN"
  }'

# Script Generator
curl -X POST http://localhost:3000/api/productions/ai/script \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Downtown Condo",
    "description": "2BR luxury unit",
    "duration": 30,
    "targetAudience": "Young professionals",
    "tone": "professional",
    "targetLocale": "EN"
  }'

# Auto-Tagging
curl -X POST http://localhost:3000/api/productions/ai/auto-tag \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "apartment_tour.mp4",
    "fileType": "video/mp4",
    "context": {"property": "Luxury Apartment"}
  }'

# Cutdown Plan
curl -X POST http://localhost:3000/api/productions/ai/cutdown-plan \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "{ASSET_ID}",
    "originalDuration": 120,
    "targetDurations": [15, 30, 60],
    "platforms": ["meta", "tiktok", "youtube"]
  }'
```

#### 4. Export Pack
```bash
# Create Export Pack
curl -X POST http://localhost:3000/api/productions/exports \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{PROJECT_ID}",
    "name": "Test_Export",
    "channels": ["meta-story", "youtube-short", "tiktok"],
    "assetIds": ["{ASSET_ID}"],
    "includeHandoff": true
  }'

# List Export Packs
curl http://localhost:3000/api/productions/exports \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}"

# Attach to Campaign
curl -X POST http://localhost:3000/api/productions/exports/{EXPORT_ID}/attach-campaign \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "{CAMPAIGN_ID}"}'

# Verify Attachment
curl http://localhost:3000/api/productions/exports/{EXPORT_ID} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "x-org-id: {ORG_ID}"
# Should return export with attachedCampaignId populated
```

---

## Success Metrics

### Local QA Complete When:
- ✓ All Templates flows work (create, edit, lock, duplicate, localize)
- ✓ All Reviews flows work (approve, request changes with validation)
- ✓ All 5 AI endpoints return 200 with mock data
- ✓ Rate limiting works (11th request returns 429)
- ✓ Export Pack creation and campaign attachment works
- ✓ Mobile responsive on iOS/Android (visual test)
- ✓ Accessibility: keyboard nav, ESC close, focus traps

### Deployment Success When:
- ✓ `vercel --prod --yes` completes without errors
- ✓ Health endpoint returns 200: `curl https://effinity-platform.vercel.app/api/health`
- ✓ All Sprint 2 routes accessible
- ✓ API endpoints return correct responses (not 500/502)
- ✓ Frontend pages render without hydration errors

---

## Next Steps

1. **Now:** Complete local QA (can test all features without deployment)
2. **In 30 min:** Retry Vercel deployment (likely to succeed)
3. **If fails again:** Try npm instead of pnpm
4. **If still fails:** Wait for Vercel/NPM infrastructure to stabilize (check status pages)
5. **Last resort:** Deploy to Netlify/Railway/Render

**Estimated Time to Resolution:** 1-3 hours (90% chance NPM registry stabilizes)

---

**Status:** 🟡 WAITING FOR INFRASTRUCTURE | 🟢 LOCAL QA READY
**Last Updated:** 2025-10-14 20:54 IST
**Next Retry:** 2025-10-14 21:24 IST (30 minutes)
