#!/bin/bash

echo "=== NPM Installation Fix Script ==="
echo ""
echo "This script will help you install dependencies for the All-in-One project"
echo ""

# Check Node version
echo "Checking Node version..."
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "Node version: $node_version"
else
    echo "ERROR: Node is not installed or not in PATH"
    exit 1
fi

# Check npm version
echo "Checking npm version..."
npm_version=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "npm version: $npm_version"
else
    echo "ERROR: npm is not installed or not in PATH"
    echo "Trying to fix npm..."

    # Try to use node to run npm directly
    if [ -f "/usr/local/lib/node_modules/npm/bin/npm-cli.js" ]; then
        alias npm='node /usr/local/lib/node_modules/npm/bin/npm-cli.js'
        echo "Created npm alias"
    fi
fi

# Navigate to project root
cd "$(dirname "$0")"
echo "Working directory: $(pwd)"

# Clean npm cache
echo ""
echo "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || echo "Cache clean skipped"

# Remove existing node_modules and package-lock
echo ""
echo "Removing old node_modules and package-lock.json..."
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Install dependencies
echo ""
echo "Installing dependencies..."
echo "Running: npm install --legacy-peer-deps"
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "Next steps:"
    echo "1. Commit package-lock.json: git add package-lock.json && git commit -m 'Add package-lock.json'"
    echo "2. Push to git: git push origin main"
    echo "3. Redeploy on Vercel with 'Clear Build Cache' option"
else
    echo ""
    echo "❌ Installation failed. Try these alternatives:"
    echo ""
    echo "Option 1: Use yarn instead"
    echo "  brew install yarn"
    echo "  yarn install"
    echo ""
    echo "Option 2: Use nvm to switch Node version"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo "  npm install"
    echo ""
    echo "Option 3: Reinstall Node and npm"
    echo "  brew uninstall node"
    echo "  brew install node@20"
    echo "  npm install"
    echo ""
    echo "Option 4: Skip local install and deploy directly to Vercel"
    echo "  The vercel.json is configured correctly."
    echo "  Vercel will handle the installation on their servers."
fi