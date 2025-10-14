/**
 * Stripe client-side integration
 * For use in browser components
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance
 * This is safe to call on the client side
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
