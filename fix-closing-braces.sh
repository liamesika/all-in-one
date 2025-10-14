#!/bin/bash

# Fix closing braces for auth middleware wrappers
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

echo "Fixing closing braces..."

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    continue
  fi

  echo "Processing: $file"

  # Replace standalone closing brace "}" at end of functions with "});"
  # This targets patterns like:
  #     );
  #   }
  # }
  # And converts the last } to });

  # Use perl for more complex regex
  perl -i -pe 's/^}$/});/ if eof' "$file"

  echo "   ✓ Fixed"
done

echo "✅ Closing braces fixed!"
