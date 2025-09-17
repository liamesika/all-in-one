#!/bin/bash

echo "=== Setting up Node 20 for the project ==="
echo ""

# Export Node 20 paths
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

echo "Installing dependencies with Node 20..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "package-lock.json has been generated."
    echo ""
    echo "Next steps:"
    echo "1. Commit the package-lock.json:"
    echo "   git add package-lock.json"
    echo "   git commit -m 'Add package-lock.json for dependency lock'"
    echo "   git push origin main"
    echo ""
    echo "2. In Vercel, redeploy with 'Clear Build Cache' option"
    echo ""
    echo "To use Node 20 in your terminal permanently, add these lines to ~/.zshrc:"
    echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"'
    echo 'export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"'
    echo 'export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"'
else
    echo "❌ Installation failed. Please check the error messages above."
fi