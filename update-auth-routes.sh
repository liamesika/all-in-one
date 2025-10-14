#!/bin/bash

# Script to update API routes to use withAuth middleware
# This script adds the import and converts export async function to export const with withAuth

# List of files to update (excluding auth/register, webhooks, debug)
FILES=(
"/Users/liamesika/all-in-one/apps/web/app/api/organizations/me/active-org/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/organizations/me/memberships/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/organizations/members/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/import-history/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/source-health/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/csv-preview/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/csv-import/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/[id]/status/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/leads/[id]/first-contact/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/law/dashboard/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/integrations/oauth/[platform]/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/integrations/oauth/callback/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/integrations/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/integrations/[id]/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/integrations/[id]/sync/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/automations/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/automations/execute/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/automations/[id]/toggle/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/automations/[id]/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/real-estate/campaigns/[id]/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/campaigns/[id]/activate/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/campaigns/[id]/pause/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/campaigns/[id]/duplicate/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/campaigns/[id]/preflight-check/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/connections/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/templates/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/templates/[id]/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/uploads/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/permissions/check/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/permissions/me/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/billing/usage/route.ts"
"/Users/liamesika/all-in-one/apps/web/app/api/billing/example-with-limits/route.ts"
)

echo "Starting auth middleware update for ${#FILES[@]} files..."

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Skipping $file (not found)"
    continue
  fi

  echo "Processing: $file"

  # Check if already has withAuth
  if grep -q "withAuth\|withAuthAndOrg" "$file"; then
    echo "   ✓ Already has auth middleware"
    continue
  fi

  # Create backup
  cp "$file" "$file.bak"

  # Add import if not present
  if ! grep -q "from '@/lib/apiAuth'" "$file"; then
    sed -i '' "1s|^|import { withAuth, getOwnerUid } from '@/lib/apiAuth';\n|" "$file"
  fi

  # Replace export async function GET with export const GET = withAuth
  sed -i '' 's/export async function GET(request: NextRequest)/export const GET = withAuth(async (request, { user }) =>/g' "$file"

  # Replace export async function POST with export const POST = withAuth
  sed -i '' 's/export async function POST(request: NextRequest)/export const POST = withAuth(async (request, { user }) =>/g' "$file"

  # Replace export async function PATCH with export const PATCH = withAuth
  sed -i '' 's/export async function PATCH(/export const PATCH = withAuth(async (/g' "$file"

  # Replace export async function PUT with export const PUT = withAuth
  sed -i '' 's/export async function PUT(/export const PUT = withAuth(async (/g' "$file"

  # Replace export async function DELETE with export const DELETE = withAuth
  sed -i '' 's/export async function DELETE(/export const DELETE = withAuth(async (/g' "$file"

  # Replace x-owner-uid header access with getOwnerUid(user)
  sed -i '' "s/request.headers.get('x-owner-uid') || 'demo-user'/getOwnerUid(user)/g" "$file"
  sed -i '' "s/request.headers.get('x-owner-uid')/getOwnerUid(user)/g" "$file"

  echo "   ✓ Updated"
done

echo ""
echo "✅ Update complete! Please manually review the files and:"
echo "   1. Add closing '});' for each handler"
echo "   2. Update params handling for dynamic routes"
echo "   3. Test the endpoints"
echo ""
echo "Backup files created with .bak extension"
