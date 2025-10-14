'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { PlanConfig } from '@/config/pricing';

interface PricingCardProps {
  plan: PlanConfig;
  highlighted?: boolean;
}

export function PricingCard({ plan, highlighted = false }: PricingCardProps) {
  return (
    <div
      className={`relative p-8 bg-white border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        highlighted
          ? 'border-blue-700 shadow-xl'
          : 'border-gray-200 hover:border-blue-700'
      }`}
    >
      {/* Most Popular Badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-700 text-white text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6">
        <h3 className="text-[1.5rem] font-semibold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-sm font-normal text-gray-600">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        {plan.price === null ? (
          <div className="text-4xl font-semibold text-gray-900">Custom</div>
        ) : (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-semibold text-gray-900">$</span>
              <span className="text-5xl font-semibold text-gray-900">{plan.price}</span>
              <span className="text-lg font-normal text-gray-600">/{plan.interval}</span>
            </div>
          </>
        )}
      </div>

      {/* Features List */}
      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-base font-normal text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={plan.price === null ? '/contact' : '/register'}
        className={`block w-full text-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
          highlighted
            ? 'text-white bg-blue-700 hover:bg-blue-800 shadow-lg hover:shadow-xl'
            : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
        }`}
      >
        {plan.ctaText}
      </Link>

      {/* Trial Info */}
      {plan.price !== null && (
        <p className="text-center text-sm font-normal text-gray-500 mt-4">
          14-day free trial, no credit card required
        </p>
      )}
    </div>
  );
}
