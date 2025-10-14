/**
 * Stripe Webhooks Handler
 * Processes Stripe events for subscription lifecycle management
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { getPlanLimits } from '@/config/pricing';
import Stripe from 'stripe';


// Disable body parsing, we need raw body for signature verification
export const runtime = 'nodejs';

/**
 * POST /api/billing/webhooks
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Activates subscription after successful payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Processing checkout.session.completed');

  const { orgId, plan } = session.metadata || {};

  if (!orgId || !plan) {
    console.error('[Webhook] Missing metadata in checkout session');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) {
    console.error('[Webhook] Missing customer or subscription ID');
    return;
  }

  // Get plan limits
  const limits = getPlanLimits(plan as SubscriptionPlan);

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      plan: plan as SubscriptionPlan,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: session.metadata?.priceId,
      billingEmail: session.customer_email || undefined,
      userSeats: limits.users,
      leadLimit: limits.leads,
      propertyLimit: limits.properties,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
    update: {
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan: plan as SubscriptionPlan,
      userSeats: limits.users,
      leadLimit: limits.leads,
      propertyLimit: limits.properties,
    },
  });

  console.log(`[Webhook] Subscription activated for org: ${orgId}`);
}

/**
 * Handle invoice.paid
 * Records successful payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing invoice.paid');

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('[Webhook] Invoice not associated with subscription, skipping');
    return;
  }

  // Find subscription by Stripe subscription ID
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Record invoice
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status || 'paid',
      pdfUrl: invoice.invoice_pdf || undefined,
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      paidAt: new Date(),
    },
    update: {
      status: invoice.status || 'paid',
      paidAt: new Date(),
      amount: invoice.amount_paid,
    },
  });

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      stripeCurrentPeriodEnd: new Date(invoice.period_end * 1000),
      nextBillingDate: new Date(invoice.period_end * 1000),
    },
  });

  console.log(`[Webhook] Invoice recorded for subscription: ${subscription.id}`);
}

/**
 * Handle invoice.payment_failed
 * Updates subscription status on failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing invoice.payment_failed');

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Update subscription status to PAST_DUE
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
    },
  });

  // Record failed invoice
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
    },
    update: {
      status: 'open',
    },
  });

  console.log(`[Webhook] Payment failed for subscription: ${subscription.id}`);

  // TODO: Send notification email to customer
}

/**
 * Handle customer.subscription.updated
 * Syncs subscription changes from Stripe
 */
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  console.log('[Webhook] Processing customer.subscription.updated');

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found for Stripe ID: ${stripeSubscription.id}`);
    return;
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus = 'ACTIVE';
  switch (stripeSubscription.status) {
    case 'active':
      status = 'ACTIVE';
      break;
    case 'past_due':
      status = 'PAST_DUE';
      break;
    case 'canceled':
      status = 'CANCELED';
      break;
    case 'trialing':
      status = 'TRIALING';
      break;
    case 'incomplete':
      status = 'INCOMPLETE';
      break;
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
    },
  });

  console.log(`[Webhook] Subscription updated: ${subscription.id}, status: ${status}`);
}

/**
 * Handle customer.subscription.deleted
 * Cancels subscription
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  console.log('[Webhook] Processing customer.subscription.deleted');

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found for Stripe ID: ${stripeSubscription.id}`);
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELED',
    },
  });

  console.log(`[Webhook] Subscription canceled: ${subscription.id}`);

  // TODO: Send cancellation confirmation email
}

/**
 * Handle customer.subscription.trial_will_end
 * Notifies customer that trial is ending soon
 */
async function handleTrialWillEnd(stripeSubscription: Stripe.Subscription) {
  console.log('[Webhook] Processing customer.subscription.trial_will_end');

  // Find subscription
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
    include: {
      organization: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!subscription) {
    console.error(`[Webhook] Subscription not found for Stripe ID: ${stripeSubscription.id}`);
    return;
  }

  console.log(`[Webhook] Trial ending soon for org: ${subscription.orgId}`);

  // TODO: Send trial ending notification email
}
