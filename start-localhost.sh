#!/bin/bash

echo "=== Starting Web App on Localhost ==="
echo ""

# Set up nvm environment
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
fi

# Make sure we're using Node 20
if command -v nvm >/dev/null 2>&1; then
    nvm use 20 2>/dev/null || echo "Node 20 not available via nvm, using system node"
fi

cd /Users/liamesika/all-in-one/apps/web

echo "Current directory: $(pwd)"
echo "Node version: $(node --version 2>/dev/null || echo 'Node not found')"

# Check if .next directory exists (pre-built app)
if [ -d ".next" ]; then
    echo ""
    echo "✅ Found existing .next build directory"
    echo "Attempting to start the app..."
    echo ""

    # Try to start the built app
    if command -v npm >/dev/null 2>&1; then
        echo "Starting with: npm start"
        npm start
    else
        echo "npm not available, trying with node directly..."

        # Try to find and run the built app
        if [ -f ".next/standalone/server.js" ]; then
            echo "Running standalone server..."
            cd .next/standalone
            node server.js
        elif [ -f "node_modules/.bin/next" ]; then
            echo "Running with local next binary..."
            ./node_modules/.bin/next start
        else
            echo "❌ Cannot start the app - missing dependencies"
            echo ""
            echo "Solutions:"
            echo "1. Install dependencies first: npm install"
            echo "2. Or try running the dev server: npm run dev"
            echo "3. Or build first: npm run build && npm start"
        fi
    fi
else
    echo ""
    echo "⚠️  No .next build directory found"
    echo "Trying to start development server..."
    echo ""

    if command -v npm >/dev/null 2>&1; then
        echo "Starting with: npm run dev"
        npm run dev
    else
        echo "❌ npm not available and no pre-built app found"
        echo ""
        echo "You need to either:"
        echo "1. Fix npm installation first"
        echo "2. Or build the app with working npm"
        echo ""
        echo "Try these commands in your terminal:"
        echo "  cd /Users/liamesika/all-in-one/apps/web"
        echo "  npm install"
        echo "  npm run dev"
    fi
fi