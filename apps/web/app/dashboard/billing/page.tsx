'use client';

/**
 * Billing Dashboard Page
 * Manage subscription, view usage, and access billing history
 */

import { useEffect, useState } from 'react';
import { CreditCard, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import PricingCards from '@/components/billing/PricingCards';
import UsageStats from '@/components/billing/UsageStats';
import InvoicesList from '@/components/billing/InvoicesList';
import { PricingPlan } from '@/config/pricing';

interface SubscriptionData {
  subscription: {
    id: string;
    plan: PricingPlan;
    status: string;
    currentPeriodEnd: Date | null;
    trialEndsAt: Date | null;
    nextBillingDate: Date | null;
  } | null;
  usage: any;
  billingPeriod: any;
  recentInvoices: any[];
  onTrial?: boolean;
  needsSubscription?: boolean;
}

export default function BillingDashboard() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/subscription', {
        headers: {
          'x-org-id': 'demo-org', // TODO: Get from auth context
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setData(data);

      // Show pricing if no subscription
      if (data.needsSubscription) {
        setShowPricing(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    try {
      setActionLoading(true);

      if (plan === 'ENTERPRISE') {
        // Redirect to contact sales
        window.location.href = 'mailto:sales@effinity.co.il?subject=Enterprise Plan Inquiry';
        return;
      }

      // Create checkout session
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': 'demo-org', // TODO: Get from auth context
          'x-owner-uid': 'demo-user', // TODO: Get from auth context
        },
        body: JSON.stringify({
          plan,
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': 'demo-org', // TODO: Get from auth context
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();

      // Redirect to Stripe billing portal
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Billing</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your plan, usage, and billing information</p>
        </div>
        {data?.subscription && (
          <button
            onClick={handleManageBilling}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            Manage Billing
          </button>
        )}
      </div>

      {/* Current Plan Card */}
      {data?.subscription && !showPricing && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {data.subscription.plan} Plan
                </h2>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{data.subscription.status}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              {showPricing ? 'Hide Plans' : 'View All Plans'}
            </button>
          </div>

          {data.subscription.trialEndsAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Your trial ends on{' '}
                <strong>
                  {new Date(data.subscription.trialEndsAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </p>
            </div>
          )}

          {data.subscription.nextBillingDate && (
            <p className="text-sm text-gray-600">
              Next billing date:{' '}
              <strong>
                {new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* Pricing Cards (conditional) */}
      {showPricing && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            {data?.subscription && (
              <button
                onClick={() => setShowPricing(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Hide Plans
              </button>
            )}
          </div>
          <PricingCards
            currentPlan={data?.subscription?.plan}
            onSelectPlan={handleSelectPlan}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Usage Statistics */}
      {data?.usage && (
        <div>
          <UsageStats usage={data.usage} />
        </div>
      )}

      {/* Invoices */}
      {data?.recentInvoices && data.recentInvoices.length > 0 && (
        <div>
          <InvoicesList invoices={data.recentInvoices} />
        </div>
      )}
    </div>
  );
}
