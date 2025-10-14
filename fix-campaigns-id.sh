#!/bin/bash
file="/Users/liamesika/all-in-one/apps/web/app/api/real-estate/campaigns/[id]/route.ts"

# Use sed to fix the specific patterns
sed -i '.tmp' '
# Fix line 49 - close GET handler
49s/^}$/});/

# Fix line 52-54 - fix PATCH params
52,54s/export const PATCH = withAuth(async ($/export const PATCH = withAuth(async (request, { user, params }) => {/
53,54d

# Fix line 128 - close PATCH handler  
128s/^}$/});/

# Fix line 131-133 - fix DELETE params
131,133s/export const DELETE = withAuth(async ($/export const DELETE = withAuth(async (request, { user, params }) => {/
132,133d

# Fix last line - close DELETE handler
$s/^}$/});/
' "$file"

# Clean up temp file
rm -f "$file.tmp"

echo "Fixed campaigns [id] route"
