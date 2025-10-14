import { Metadata } from 'next';
import {
  Zap,
  Home,
  TrendingUp,
  Workflow,
  Link2,
  BarChart3,
  Users,
  Building2,
  DollarSign,
  Award,
} from 'lucide-react';
import { Hero } from '@/components/marketing/Hero';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { PricingCard } from '@/components/marketing/PricingCard';
import { Testimonial } from '@/components/marketing/Testimonial';
import { FAQ } from '@/components/marketing/FAQ';
import { CTASection } from '@/components/marketing/CTASection';
import { IntegrationGrid } from '@/components/marketing/IntegrationGrid';
import { StatsCounter } from '@/components/marketing/StatsCounter';
import { PRICING } from '@/config/pricing';

export const metadata: Metadata = {
  title: 'EFFINITY - Real Estate Management Platform',
  description:
    'All-in-one platform for real estate professionals. Manage leads, properties, campaigns, and automate your workflow with AI-powered tools.',
  keywords:
    'real estate CRM, property management, lead tracking, real estate automation, property listings',
  openGraph: {
    title: 'EFFINITY - Transform Your Real Estate Business',
    description: 'AI-powered real estate management platform',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EFFINITY - Real Estate Management',
    description: 'All-in-one platform for real estate professionals',
    images: ['/twitter-image.png'],
  },
};

export default function MarketingHomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Smart Lead Management',
      description:
        'AI-powered lead qualification and routing. Automatically score, categorize, and assign leads to the right agents.',
    },
    {
      icon: Home,
      title: 'Property Listings',
      description:
        'Beautiful landing pages auto-generated for each property. Complete with SEO optimization and lead capture forms.',
    },
    {
      icon: TrendingUp,
      title: 'Campaign Tracking',
      description:
        'Multi-platform attribution across Facebook, Google, LinkedIn, and more. Know exactly where your leads come from.',
    },
    {
      icon: Workflow,
      title: 'Automation Engine',
      description:
        'Workflow automation with 50+ pre-built templates. Set up follow-ups, notifications, and tasks automatically.',
    },
    {
      icon: Link2,
      title: 'Integrations',
      description:
        'Connect with HubSpot, Zoho, Salesforce, and 50+ other tools. Sync data seamlessly across your tech stack.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description:
        'Comprehensive reports and insights. Track performance, conversion rates, and ROI in real-time dashboards.',
    },
  ];

  const stats = [
    { icon: Building2, value: '10K+', label: 'Properties Managed' },
    { icon: Users, value: '50K+', label: 'Leads Tracked' },
    { icon: DollarSign, value: '$50M+', label: 'Sales Attributed' },
    { icon: Award, value: '95%', label: 'Customer Satisfaction' },
  ];

  const testimonials = [
    {
      quote:
        'EFFINITY transformed how we manage our properties. Lead response time dropped from hours to minutes, and our conversion rate doubled.',
      author: 'Sarah Johnson',
      title: 'Managing Broker',
      company: 'Elite Realty Group',
    },
    {
      quote:
        'The automation features saved us 20+ hours per week. We can now focus on closing deals instead of manual data entry.',
      author: 'Michael Chen',
      title: 'Team Lead',
      company: 'Metro Properties',
    },
    {
      quote:
        'Best investment we made this year. The ROI was clear within the first month. Highly recommend to any serious real estate professional.',
      author: 'Jennifer Martinez',
      title: 'CEO',
      company: 'Prestige Real Estate',
    },
  ];

  const faqItems = [
    {
      question: 'Do I need a credit card for the trial?',
      answer:
        'No! Start your 14-day free trial with no credit card required. You can explore all features and decide if EFFINITY is right for you before paying.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes, you can cancel your subscription at any time with no penalties or fees. If you cancel, you will have access until the end of your billing period.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer:
        'Your data is yours forever. You can export all your data before canceling, and we keep your data for 30 days after cancellation in case you want to reactivate.',
    },
    {
      question: 'Do you offer training?',
      answer:
        'Yes! All plans include access to our comprehensive help center, video tutorials, and live onboarding sessions. Pro and Agency plans also include dedicated training sessions.',
    },
    {
      question: 'What integrations are supported?',
      answer:
        'We integrate with 50+ platforms including HubSpot, Salesforce, Zoho, Google Calendar, Facebook, Instagram, Mailchimp, Zapier, and more. Check our integrations page for the full list.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use bank-level encryption (AES-256), SOC 2 Type II compliance, and regular security audits. Your data is stored in secure data centers with 99.9% uptime.',
    },
    {
      question: 'Can I import existing data?',
      answer:
        'Yes! We support CSV imports, direct integrations with major CRMs, and offer white-glove data migration services for Agency and Enterprise plans.',
    },
    {
      question: 'Do you offer custom plans?',
      answer:
        'Yes, our Enterprise plan is fully customizable based on your needs. Contact our sales team to discuss custom features, integrations, and pricing.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Social Proof Stats */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatsCounter stats={stats} />
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Everything you need to grow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for real estate professionals
              to manage leads, properties, and campaigns.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href="/features"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From signup to closing deals in minutes, not days
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                1
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-base text-gray-600">
                Create your account in 60 seconds. No credit card required for your
                free trial.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                2
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                Import Data
              </h3>
              <p className="text-base text-gray-600">
                Connect your CRM or upload a CSV. We'll help migrate your existing
                data seamlessly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                3
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                Grow
              </h3>
              <p className="text-base text-gray-600">
                Track, automate, and close more deals. Watch your business grow with
                real-time insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Loved by real estate professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about EFFINITY
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Testimonial
                key={testimonial.author}
                quote={testimonial.quote}
                author={testimonial.author}
                title={testimonial.title}
                company={testimonial.company}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include a
              14-day free trial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard plan={PRICING.BASIC} />
            <PricingCard plan={PRICING.PRO} highlighted={true} />
            <PricingCard plan={PRICING.AGENCY} />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <IntegrationGrid
        title="Connect with your favorite tools"
        subtitle="Seamlessly integrate with 50+ platforms to sync your data and streamline your workflow"
      />

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-gray-600">
              Have a question? We've got answers.
            </p>
          </div>
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        headline="Ready to transform your real estate business?"
        subtext="Join 500+ professionals already using EFFINITY to close more deals and save time"
        primaryCTA={{ text: 'Start Your Free Trial', href: '/register' }}
        secondaryCTA={{ text: 'Schedule a Demo', href: '/demo' }}
      />
    </>
  );
}
