'use client';

// Root homepage - Multi-vertical Effinity platform
import { useRef } from 'react';
import { MultiVerticalHero } from '@/components/marketing/MultiVerticalHero';
import { PlatformOverview } from '@/components/marketing/PlatformOverview';
import { CoreCapabilities } from '@/components/marketing/CoreCapabilities';
import { SystemShowcase } from '@/components/marketing/SystemShowcase';
import { MultiVerticalTestimonials } from '@/components/marketing/MultiVerticalTestimonials';
import { IntegrationGrid } from '@/components/marketing/IntegrationGrid';
import { FAQ } from '@/components/marketing/FAQ';
import { CTASection } from '@/components/marketing/CTASection';
import { StickyHeader } from '@/components/marketing/StickyHeader';

// Note: Metadata must be exported from layout.tsx when page is a client component
// See apps/web/app/layout.tsx for metadata configuration

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const faqItems = [
    {
      question: 'Can I use multiple verticals in one account?',
      answer:
        'Yes! Many businesses use Effinity for multiple operations. For example, a real estate agency might use both Real Estate and Law verticals. You only pay for what you use.',
    },
    {
      question: 'Do all verticals share the same data?',
      answer:
        'Yes, all verticals run on a unified CRM and database. Customer data, analytics, and team members are shared across verticals, giving you a complete view of your business.',
    },
    {
      question: 'Can I migrate from my current system?',
      answer:
        'Absolutely. We support CSV imports, API integrations with major platforms, and offer white-glove migration services for Enterprise plans. Our team will help you transition smoothly.',
    },
    {
      question: 'Is each vertical a separate product?',
      answer:
        'No. Effinity is one unified platform with four specialized systems. They share the same infrastructure, AI engine, analytics, and user management. You get all the power of integration without complexity.',
    },
    {
      question: 'What happens if I only need one vertical?',
      answer:
        'That\'s perfectly fine! You can start with a single vertical (e.g., Real Estate) and add more as your business grows. Pricing is flexible and scales with your needs.',
    },
    {
      question: 'How secure is my data across verticals?',
      answer:
        'Enterprise-grade security with bank-level encryption (AES-256), SOC 2 Type II compliance, multi-tenant isolation, and role-based access control. Your data is protected at every level.',
    },
    {
      question: 'Do you offer training for each vertical?',
      answer:
        'Yes! Each vertical includes comprehensive documentation, video tutorials, and live onboarding. Pro and Agency plans include dedicated training sessions for each system you use.',
    },
    {
      question: 'Can I customize workflows per vertical?',
      answer:
        'Absolutely. Each vertical has its own automation engine, custom fields, and workflow templates. You can tailor every system to match your specific business processes.',
    },
  ];

  return (
    <>
      {/* Sticky Header - appears on scroll */}
      <StickyHeader heroRef={heroRef} />

      {/* Hero Section - Multi-Vertical */}
      <MultiVerticalHero ref={heroRef} />

      {/* Platform Overview - 4 Verticals */}
      <PlatformOverview />

      {/* Core Capabilities - Shared Infrastructure */}
      <CoreCapabilities />

      {/* System Showcase - Live Previews */}
      <SystemShowcase />

      {/* Testimonials - Multi-Vertical */}
      <MultiVerticalTestimonials />

      {/* Integrations */}
      <IntegrationGrid
        title="Connect with your favorite tools"
        subtitle="Seamlessly integrate with 50+ platforms across all verticals to sync data and streamline workflows"
      />

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Learn more about Effinity's multi-vertical platform
            </p>
          </div>
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        headline="Ready to transform your business with Effinity?"
        subtext="Join 500+ professionals already managing Real Estate, E-Commerce, Productions, and Law with one intelligent platform"
        primaryCTA={{ text: 'Start Free Trial', href: '/register' }}
        secondaryCTA={{ text: 'View Pricing', href: '/pricing' }}
      />
    </>
  );
}
