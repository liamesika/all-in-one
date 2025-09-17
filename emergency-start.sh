#!/bin/bash

echo "=== Emergency Web App Starter ==="
echo "This bypasses npm/yarn issues"
echo ""

cd /Users/liamesika/all-in-one/apps/web

echo "Current directory: $(pwd)"
echo ""

# Check if .next exists (pre-built app)
if [ -d ".next" ]; then
    echo "Found existing .next build directory"
    echo "Attempting to start pre-built app..."

    # Try to start with Node directly
    if [ -f ".next/standalone/server.js" ]; then
        echo "Starting standalone server..."
        cd .next/standalone
        PORT=3000 node server.js
    else
        echo "No standalone server found. Trying alternative methods..."

        # Look for Next.js binary
        if [ -f "node_modules/.bin/next" ]; then
            echo "Found local Next.js binary"
            ./node_modules/.bin/next start -p 3000
        else
            echo "No Next.js binary found."
            echo ""
            echo "❌ Cannot start the app without dependencies."
            echo ""
            echo "Your Node.js/npm environment is broken."
            echo "Let's fix it completely:"
            echo ""
            echo "1. First, completely remove Node:"
            echo "   sudo rm -rf /usr/local/bin/node"
            echo "   sudo rm -rf /usr/local/bin/npm"
            echo "   sudo rm -rf /usr/local/lib/node_modules"
            echo "   rm -rf ~/.npm"
            echo ""
            echo "2. Install Node via Homebrew:"
            echo "   brew install node@20"
            echo "   brew link node@20"
            echo ""
            echo "3. Verify installation:"
            echo "   node --version"
            echo "   npm --version"
            echo ""
            echo "4. Then install dependencies:"
            echo "   cd /Users/liamesika/all-in-one"
            echo "   npm install"
            echo "   cd apps/web"
            echo "   npm run dev"
            echo ""
            echo "Alternative: Use CodeSandbox or Stackblitz online IDE"
            echo "1. Go to https://codesandbox.io"
            echo "2. Import your GitHub repository"
            echo "3. It will install dependencies automatically"
        fi
    fi
else
    echo "No .next build directory found"
    echo "Need to build the app first, but npm/yarn not working"
    echo ""
    echo "🔧 EMERGENCY FIX NEEDED:"
    echo ""
    echo "Your package manager environment is completely broken."
    echo "Here's how to fix it:"
    echo ""
    echo "Option 1 - Complete Node.js reinstall:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.zshrc"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo "  cd /Users/liamesika/all-in-one"
    echo "  npm install"
    echo "  cd apps/web"
    echo "  npm run dev"
    echo ""
    echo "Option 2 - Use online IDE:"
    echo "  1. Push your code to GitHub (already done)"
    echo "  2. Go to https://github.dev/liamesika/all-in-one"
    echo "  3. Or use https://gitpod.io/#https://github.com/liamesika/all-in-one"
    echo "  4. Run 'npm install && cd apps/web && npm run dev' in terminal"
    echo ""
    echo "Option 3 - Use Docker:"
    echo "  (I can create a Dockerfile if needed)"
fi