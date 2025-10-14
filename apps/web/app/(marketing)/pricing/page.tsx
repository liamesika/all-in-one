import { Metadata } from 'next';
import { PricingCard } from '@/components/marketing/PricingCard';
import { FAQ } from '@/components/marketing/FAQ';
import { CTASection } from '@/components/marketing/CTASection';
import { PRICING } from '@/config/pricing';

export const metadata: Metadata = {
  title: 'Pricing - EFFINITY Real Estate Platform',
  description:
    'Simple, transparent pricing for real estate professionals. Choose the plan that fits your business. 14-day free trial, no credit card required.',
};

export default function PricingPage() {
  const faqItems = [
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH bank transfers for annual plans.',
    },
    {
      question: 'Can I change plans later?',
      answer:
        'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer:
        'We\'ll notify you when you approach your limits. You can either upgrade to a higher plan or purchase additional capacity as needed.',
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer:
        'Yes! Save 15% by choosing annual billing. For example, the Pro plan is $1,009/year instead of $1,188/year when billed monthly.',
    },
    {
      question: 'Is there a setup fee?',
      answer:
        'No setup fees for any plan. We believe in transparent pricing with no hidden charges.',
    },
    {
      question: 'What support do I get with each plan?',
      answer:
        'Basic includes email support. Pro includes priority email and chat support. Agency and Enterprise include phone support and dedicated account managers.',
    },
    {
      question: 'Can I get a custom Enterprise plan?',
      answer:
        'Yes! Our Enterprise plan is fully customizable based on your needs. Contact our sales team to discuss custom features, volume discounts, and on-premise deployment options.',
    },
    {
      question: 'Do you offer non-profit or educational discounts?',
      answer:
        'Yes, we offer 20% discounts for registered non-profits and educational institutions. Contact our sales team with your documentation.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white py-20 sm:py-24">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free
              trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PricingCard plan={PRICING.BASIC} />
            <PricingCard plan={PRICING.PRO} highlighted={true} />
            <PricingCard plan={PRICING.AGENCY} />
            <PricingCard plan={PRICING.ENTERPRISE} />
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Compare plans
            </h2>
            <p className="text-lg text-gray-600">
              See what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded-xl">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Basic
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Agency
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">User seats</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">1</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    5
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Leads per month</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">100</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    1,000
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Properties</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">50</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    500
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Automations</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">5</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    50
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    API access
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    Basic
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Full
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Full + Custom
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Support</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Email
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 bg-blue-50">
                    Priority
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    Dedicated
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    24/7 Premium
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Pricing FAQs
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about billing and plans
            </p>
          </div>
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to get started?"
        subtext="Start your 14-day free trial today. No credit card required."
        primaryCTA={{ text: 'Start Free Trial', href: '/register' }}
        secondaryCTA={{ text: 'Contact Sales', href: '/contact' }}
      />
    </>
  );
}
