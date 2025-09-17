#!/bin/bash

echo "=== Final npm Fix Script ==="
echo ""

# First, let's make Node@20 the default
echo "Setting up Node@20 as default..."

# Add to shell profile
if [ -f ~/.zshrc ]; then
    # Remove any existing node paths to avoid conflicts
    grep -v "node@20" ~/.zshrc > /tmp/zshrc_clean
    mv /tmp/zshrc_clean ~/.zshrc

    # Add Node@20 paths
    echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
    echo 'export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"' >> ~/.zshrc
    echo 'export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"' >> ~/.zshrc

    echo "Added Node@20 paths to ~/.zshrc"
else
    echo "Creating ~/.zshrc with Node@20 paths"
    echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' > ~/.zshrc
    echo 'export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"' >> ~/.zshrc
    echo 'export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"' >> ~/.zshrc
fi

# Apply the paths for this session
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"

echo "Current paths:"
echo "Node: $(which node) - Version: $(node --version)"

# Check if npm works now
if command -v npm >/dev/null 2>&1; then
    echo "npm: $(which npm) - Version: $(npm --version)"
    echo ""
    echo "✅ npm is working! You can now run:"
    echo "  npm install"
    echo "  npm run build"
    echo ""
    echo "🔄 Please close this terminal and open a new one, then:"
    echo "  cd /Users/liamesika/all-in-one"
    echo "  npm install --legacy-peer-deps"
else
    echo "❌ npm still not working. Let's try alternatives:"
    echo ""
    echo "Option 1: Use corepack (Node's built-in package manager)"
    echo "  corepack enable"
    echo "  corepack prepare npm@latest --activate"
    echo ""
    echo "Option 2: Reinstall Node@20 completely"
    echo "  brew reinstall node@20"
    echo ""
    echo "Option 3: Skip local development and use Vercel"
    echo "  The deployment should work on Vercel's servers"
fi

echo ""
echo "🚀 IMPORTANT: Vercel deployment should work regardless!"
echo "   Just redeploy with 'Clear Build Cache' option."