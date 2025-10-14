/**
 * Stripe server-side integration
 * Server-side only - uses secret key
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key (server-side only)
// Use placeholder during build, will validate at runtime
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper to validate Stripe is properly configured
export function validateStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }
}

/**
 * Stripe Price IDs for each plan
 * These should match the prices created in your Stripe dashboard
 */
export const STRIPE_PRICE_IDS = {
  BASIC: process.env.STRIPE_PRICE_BASIC || 'price_basic',
  PRO: process.env.STRIPE_PRICE_PRO || 'price_pro',
  AGENCY: process.env.STRIPE_PRICE_AGENCY || 'price_agency',
  // ENTERPRISE plans are custom - no fixed price
} as const;

/**
 * Webhook signature verification helper
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    subscription_data: {
      metadata: params.metadata,
      trial_period_days: 14, // 14-day free trial
    },
  });

  return session;
}

/**
 * Create a Stripe billing portal session
 */
export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Update subscription plan
 */
export async function updateSubscription(params: {
  subscriptionId: string;
  newPriceId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);

  if (!subscription.items.data[0]) {
    throw new Error('Subscription has no items');
  }

  const updatedSubscription = await stripe.subscriptions.update(params.subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: params.newPriceId,
      },
    ],
    proration_behavior: 'always_invoice', // Charge immediately for upgrades
  });

  return updatedSubscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  } else {
    // Cancel at period end (doesn't take effect until current period ends)
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  });
}

/**
 * List invoices for a customer
 */
export async function listInvoices(customerId: string, limit = 10) {
  return stripe.invoices.list({
    customer: customerId,
    limit,
  });
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  // Try to find existing customer by email
  const customers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}
