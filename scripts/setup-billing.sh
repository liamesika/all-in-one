#!/bin/bash

# EFFINITY Billing System Setup Script
# This script helps set up the billing system after implementation

echo "======================================"
echo "EFFINITY Billing System Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Starting billing system setup..."
echo ""

# Step 1: Install dependencies
print_info "Step 1: Installing dependencies..."
if pnpm install; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Generate Prisma client
print_info "Step 2: Generating Prisma client..."
if pnpm prisma generate --schema packages/server/db/prisma/schema.prisma; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi
echo ""

# Step 3: Check environment variables
print_info "Step 3: Checking environment variables..."
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found"
    print_info "Creating .env.local from .env.example..."
    cp .env.example .env.local
    print_success ".env.local created"
    echo ""
    print_info "IMPORTANT: Please update .env.local with your Stripe keys:"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "  - STRIPE_WEBHOOK_SECRET"
    echo "  - STRIPE_PRICE_BASIC"
    echo "  - STRIPE_PRICE_PRO"
    echo "  - STRIPE_PRICE_AGENCY"
    echo ""
else
    print_success ".env.local exists"
fi
echo ""

# Step 4: Check if Stripe CLI is installed
print_info "Step 4: Checking for Stripe CLI..."
if command -v stripe &> /dev/null; then
    print_success "Stripe CLI is installed"
    STRIPE_VERSION=$(stripe --version)
    print_info "Version: $STRIPE_VERSION"
else
    print_error "Stripe CLI not found"
    print_info "Install with: brew install stripe/stripe-cli/stripe"
    print_info "Or visit: https://stripe.com/docs/stripe-cli"
fi
echo ""

# Step 5: Verify Prisma schema
print_info "Step 5: Verifying Prisma schema..."
if grep -q "model Subscription" packages/server/db/prisma/schema.prisma; then
    print_success "Subscription model found in schema"
else
    print_error "Subscription model not found in schema"
    exit 1
fi
echo ""

# Step 6: Check API routes
print_info "Step 6: Checking billing API routes..."
ROUTES=(
    "apps/web/app/api/billing/subscription/route.ts"
    "apps/web/app/api/billing/portal/route.ts"
    "apps/web/app/api/billing/webhooks/route.ts"
    "apps/web/app/api/billing/upgrade/route.ts"
    "apps/web/app/api/billing/usage/route.ts"
)

ALL_ROUTES_EXIST=true
for route in "${ROUTES[@]}"; do
    if [ -f "$route" ]; then
        print_success "$(basename $(dirname $route))/$(basename $route) exists"
    else
        print_error "$(basename $(dirname $route))/$(basename $route) missing"
        ALL_ROUTES_EXIST=false
    fi
done
echo ""

if [ "$ALL_ROUTES_EXIST" = false ]; then
    print_error "Some billing routes are missing"
    exit 1
fi

# Step 7: Check UI components
print_info "Step 7: Checking billing UI components..."
COMPONENTS=(
    "apps/web/components/billing/PricingCards.tsx"
    "apps/web/components/billing/UsageStats.tsx"
    "apps/web/components/billing/InvoicesList.tsx"
    "apps/web/components/billing/UpgradePrompt.tsx"
)

ALL_COMPONENTS_EXIST=true
for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        print_success "$(basename $component) exists"
    else
        print_error "$(basename $component) missing"
        ALL_COMPONENTS_EXIST=false
    fi
done
echo ""

if [ "$ALL_COMPONENTS_EXIST" = false ]; then
    print_error "Some billing components are missing"
    exit 1
fi

# Summary
echo "======================================"
echo "Setup Summary"
echo "======================================"
echo ""

print_success "Dependencies installed"
print_success "Prisma client generated"
print_success "Environment file checked"
print_success "API routes verified"
print_success "UI components verified"

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. Update .env.local with your Stripe keys"
echo ""
echo "2. Set up Stripe products and prices:"
echo "   - Go to https://dashboard.stripe.com/test/products"
echo "   - Create products for BASIC, PRO, and AGENCY plans"
echo "   - Copy price IDs to .env.local"
echo ""
echo "3. Configure Stripe webhooks:"
echo "   - Go to https://dashboard.stripe.com/test/webhooks"
echo "   - Add endpoint: https://yourdomain.com/api/billing/webhooks"
echo "   - Copy signing secret to .env.local"
echo ""
echo "4. Run database migration:"
echo "   pnpm prisma migrate dev --name add-billing-system"
echo ""
echo "5. Start development server:"
echo "   pnpm dev"
echo ""
echo "6. Test with Stripe CLI:"
echo "   stripe listen --forward-to localhost:3000/api/billing/webhooks"
echo ""
echo "For detailed instructions, see:"
echo "  - BILLING_IMPLEMENTATION.md"
echo "  - BILLING_SUMMARY.md"
echo ""
print_success "Setup complete!"
