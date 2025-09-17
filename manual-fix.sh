#!/bin/bash

echo "=== Manual Fix for Broken npm Environment ==="
echo ""

# Go to project root
cd /Users/liamesika/all-in-one

echo "Step 1: Clean any corrupted npm files..."
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf ~/.npm

echo "Step 2: Try multiple npm alternatives..."

# Try yarn
if command -v yarn >/dev/null 2>&1; then
    echo "Trying yarn..."
    yarn install
    if [ $? -eq 0 ]; then
        echo "✅ Yarn worked! Starting web app..."
        cd apps/web
        yarn dev
        exit 0
    fi
fi

# Try pnpm
if command -v pnpm >/dev/null 2>&1; then
    echo "Trying pnpm..."
    pnpm install
    if [ $? -eq 0 ]; then
        echo "✅ pnpm worked! Starting web app..."
        cd apps/web
        pnpm dev
        exit 0
    fi
fi

# Try corepack
echo "Trying corepack..."
corepack enable 2>/dev/null
corepack prepare npm@latest --activate 2>/dev/null
npm install
if [ $? -eq 0 ]; then
    echo "✅ corepack worked! Starting web app..."
    cd apps/web
    npm run dev
    exit 0
fi

# Try direct npx
echo "Trying npx..."
npx --package npm@latest npm install
if [ $? -eq 0 ]; then
    echo "✅ npx worked! Starting web app..."
    cd apps/web
    npx next dev
    exit 0
fi

echo ""
echo "❌ All attempts failed. You need to completely reinstall Node.js:"
echo ""
echo "Option 1: Complete Node.js reinstall"
echo "  brew uninstall --ignore-dependencies node"
echo "  brew install node@20"
echo "  brew link --force --overwrite node@20"
echo ""
echo "Option 2: Use nvm (Node Version Manager)"
echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
echo "  source ~/.zshrc"
echo "  nvm install 20"
echo "  nvm use 20"
echo "  npm install"
echo ""
echo "After fixing Node/npm, run:"
echo "  cd /Users/liamesika/all-in-one"
echo "  npm install"
echo "  cd apps/web"
echo "  npm run dev"