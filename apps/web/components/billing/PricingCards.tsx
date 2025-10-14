'use client';

/**
 * Pricing cards component
 * Displays available subscription plans with features and pricing
 */

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PRICING, PricingPlan, formatPrice } from '@/config/pricing';

interface PricingCardsProps {
  currentPlan?: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
  loading?: boolean;
}

export default function PricingCards({ currentPlan, onSelectPlan, loading = false }: PricingCardsProps) {
  const [selectedInterval] = useState<'month' | 'year'>('month');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {(Object.keys(PRICING) as PricingPlan[]).map((planKey) => {
        const plan = PRICING[planKey];
        const isCurrentPlan = currentPlan === planKey;
        const isHighlighted = plan.highlighted;

        return (
          <div
            key={planKey}
            className={`relative rounded-lg border-2 p-6 flex flex-col ${
              isHighlighted
                ? 'border-blue-500 shadow-lg scale-105'
                : isCurrentPlan
                ? 'border-green-500'
                : 'border-gray-200'
            }`}
          >
            {isHighlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            {isCurrentPlan && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  Current Plan
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
            </div>

            <div className="mb-6">
              {plan.price === null ? (
                <div className="text-3xl font-bold text-gray-900">Custom</div>
              ) : (
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/{selectedInterval}</span>
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(planKey)}
              disabled={loading || isCurrentPlan}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                isCurrentPlan
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isHighlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Loading...' : isCurrentPlan ? 'Current Plan' : plan.ctaText}
            </button>
          </div>
        );
      })}
    </div>
  );
}
