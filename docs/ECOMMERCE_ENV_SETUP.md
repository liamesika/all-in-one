# E-Commerce Vertical - Environment Variables Setup

This document explains all environment variables required for the E-Commerce vertical to function with production integrations.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Fill in the required values below based on your deployment environment.

---

## Required for AI Features

### OpenAI API Key
**Variable:** `OPENAI_API_KEY`
**Required for:**
- CSV Builder product generation (GPT-4o Vision)
- AI Image Studio (DALL-E 3)
- Campaign Assistant (GPT-4o)

**How to get:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create account
3. Navigate to API Keys
4. Create new secret key
5. Copy and paste into `.env.local`

**Example:**
```bash
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxx"
```

**Fallback:** If not set, features will return basic/simulated data instead of AI-generated content.

---

## Required for File Uploads

### AWS S3 Configuration
**Variables:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_REGION`

**Required for:**
- CSV Builder image uploads
- AI Image Studio permanent storage

**How to get:**
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to IAM → Users
3. Create new user with programmatic access
4. Attach policy: `AmazonS3FullAccess` (or create restricted policy)
5. Note down Access Key ID and Secret Access Key
6. Create S3 bucket in desired region
7. Add credentials to `.env.local`

**Example:**
```bash
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_S3_BUCKET="effinity-ecommerce-uploads"
AWS_REGION="us-east-1"
```

**Fallback:** If not set, uploaded images will be stored as data URLs (base64) which can cause large database records.

---

## Optional for Performance Checks

### Google PageSpeed Insights API
**Variables:**
- `GOOGLE_PSI_API_KEY`
- `ECOM_PSI_REMOTE`

**Required for:**
- Performance Check real audits (optional)

**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable PageSpeed Insights API
4. Navigate to Credentials
5. Create API Key
6. Copy and add to `.env.local`
7. Set `ECOM_PSI_REMOTE="true"` to enable

**Example:**
```bash
GOOGLE_PSI_API_KEY="AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567"
ECOM_PSI_REMOTE="true"
```

**Fallback:** If not set or `ECOM_PSI_REMOTE="false"`, system uses realistic simulation data.

---

## Database Configuration

### PostgreSQL Connection
**Variables:**
- `DATABASE_URL` - Connection pooler URL
- `DIRECT_URL` - Direct connection for migrations

**Example:**
```bash
DATABASE_URL="postgresql://user:password@host.aws.neon.tech/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host.aws.neon.tech/db?sslmode=require"
```

---

## Firebase Authentication

### Firebase Admin SDK (Server-Side)
**Variables:**
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

**How to get:**
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key (downloads JSON)
4. Extract values and add to `.env.local`

**Important:** For `FIREBASE_ADMIN_PRIVATE_KEY`, replace `\n` in JSON with actual newlines.

### Firebase Client SDK (Public)
**Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**How to get:**
1. Firebase Console → Project Settings → General
2. Web apps → Config
3. Copy all values

---

## Feature Flags

### E-Commerce Feature Controls
**Variables:**
- `ECOM_SHOPIFY_PUSH="false"` - Enable Shopify export (future feature)
- `ECOM_PSI_REMOTE="false"` - Enable real PSI API (vs simulation)

---

## Rate Limiting

Rate limits are configured in `apps/web/lib/rate-limit.server.ts`:

- **CSV Generation:** 10 requests per user per hour
- **AI Images:** 20 images per user per hour
- **Campaign Assistant:** 15 campaigns per user per hour
- **PSI Audits:** 25 per day globally (respects Google quotas)

**No environment variables needed** - limits are hard-coded for security.

---

## Vercel Deployment

When deploying to Vercel, add all environment variables in the dashboard:

1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add each variable with appropriate scope:
   - **Production** - for production branch
   - **Preview** - for PR previews
   - **Development** - for local development overrides

**Important:** Never commit `.env.local` or any file with real credentials to Git.

---

## Testing Configuration

### Playwright E2E Tests
**Variable:** `PLAYWRIGHT_BASE_URL`

**Default:** `http://localhost:3000`

**Usage:**
```bash
# Run tests locally
npx playwright test

# Run specific test file
npx playwright test tests/e2e/ecommerce/dashboard.spec.ts

# Run in UI mode
npx playwright test --ui
```

---

## Validation

To verify your environment setup:

1. **Check required variables:**
   ```bash
   # In apps/web directory
   npm run build
   ```
   Build will fail if required variables are missing.

2. **Test OpenAI integration:**
   - Navigate to CSV Builder
   - Upload an image
   - Click "Generate with AI"
   - Should see real product data (not placeholder)

3. **Test S3 integration:**
   - Check browser console for "Uploaded to S3: ..." logs
   - Or check for "S3 Upload failed, using temporary URL" warnings

4. **Test PSI integration:**
   - Set `ECOM_PSI_REMOTE="true"`
   - Navigate to Performance Check
   - Run audit on google.com
   - Check console for "[PSI] API request" logs

---

## Troubleshooting

### OpenAI Error: "Invalid API Key"
- Verify key starts with `sk-proj-` or `sk-`
- Check for trailing spaces or quotes
- Ensure account has credits

### S3 Error: "Access Denied"
- Verify IAM user has S3 permissions
- Check bucket name matches exactly
- Ensure region is correct

### PSI Error: "API not enabled"
- Enable PageSpeed Insights API in Google Cloud Console
- Verify API key has proper permissions
- Check quota hasn't been exceeded

### Rate Limit Reached
- Wait for reset time (shown in error message)
- Rate limits reset automatically
- Limits are per-user for AI features, global for PSI

---

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** regularly
3. **Use restricted IAM policies** for AWS (not FullAccess in production)
4. **Enable billing alerts** for OpenAI and AWS
5. **Monitor usage** via provider dashboards
6. **Use environment-specific keys** (different keys for dev/staging/prod)

---

## Cost Estimates

### OpenAI (per 1000 requests)
- GPT-4o Vision (CSV): ~$0.50 - $1.00
- DALL-E 3 (AI Images): ~$40 (at $0.04/image)
- GPT-4o (Campaigns): ~$0.30 - $0.60

### AWS S3 (monthly)
- Storage: ~$0.023/GB
- Uploads: ~$0.005/1000 requests
- Data transfer: ~$0.09/GB

### Google PSI
- **Free tier:** 25,000 requests/day
- No charges unless exceeding quota

**Recommendation:** Start with free tiers and simulation modes, then enable production APIs as needed.
