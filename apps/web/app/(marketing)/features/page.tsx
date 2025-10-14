import { Metadata } from 'next';
import {
  Zap,
  Home,
  TrendingUp,
  Workflow,
  Link2,
  BarChart3,
  Users,
  Mail,
  Calendar,
  FileText,
  Shield,
  Smartphone,
} from 'lucide-react';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'Features - EFFINITY Real Estate Platform',
  description:
    'Explore all the powerful features of EFFINITY. Lead management, property listings, campaign tracking, automation, integrations, and more.',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: 'Smart Lead Management',
      description:
        'AI-powered lead qualification, scoring, and routing. Automatically categorize leads by interest level, budget, and timeline. Never miss a hot lead again.',
    },
    {
      icon: Home,
      title: 'Property Listings',
      description:
        'Create beautiful, SEO-optimized landing pages for each property in seconds. Include photos, videos, virtual tours, and lead capture forms.',
    },
    {
      icon: TrendingUp,
      title: 'Campaign Tracking',
      description:
        'Track ROI across Facebook, Google, LinkedIn, Instagram, and more. Know exactly which campaigns drive the most valuable leads.',
    },
    {
      icon: Workflow,
      title: 'Automation Engine',
      description:
        '50+ pre-built automation templates for follow-ups, notifications, and task assignments. Create custom workflows with our visual builder.',
    },
    {
      icon: Link2,
      title: 'CRM Integrations',
      description:
        'Seamlessly connect with HubSpot, Salesforce, Zoho, and 50+ other platforms. Two-way sync keeps your data consistent everywhere.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description:
        'Comprehensive dashboards show conversion rates, pipeline velocity, and revenue attribution. Export custom reports in seconds.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Assign leads, share notes, and track team performance. Role-based permissions keep your data secure while enabling collaboration.',
    },
    {
      icon: Mail,
      title: 'Email Campaigns',
      description:
        'Design beautiful email campaigns with our drag-and-drop builder. A/B test subject lines and track opens, clicks, and conversions.',
    },
    {
      icon: Calendar,
      title: 'Scheduling & Reminders',
      description:
        'Integrated calendar with automatic reminders for showings, follow-ups, and deadlines. Sync with Google Calendar and Outlook.',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description:
        'Store contracts, disclosures, and property documents securely. E-signature integration makes closing deals faster.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, SOC 2 Type II compliance, and regular security audits. Your data is always safe and private.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description:
        'iOS and Android apps let you manage leads and properties on the go. Offline mode ensures you never miss a beat.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white py-20 sm:py-24">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Everything you need to manage your real estate business
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed for real estate professionals. Manage leads,
              properties, campaigns, and close more deals with less effort.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {/* Lead Management Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
                  Never miss a lead again
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our AI-powered lead management system automatically scores,
                  categorizes, and routes every lead to the right agent. Get instant
                  notifications when hot leads come in.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Automatic lead scoring based on behavior and engagement
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Smart routing rules to assign leads based on location, price, or
                      agent availability
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Real-time notifications via email, SMS, and push notifications
                    </span>
                  </li>
                </ul>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl"></div>
            </div>

            {/* Analytics Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl order-2 lg:order-1"></div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
                  Data-driven insights that drive growth
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Make better decisions with comprehensive analytics. Track every
                  metric that matters and optimize your sales process for maximum ROI.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Conversion funnels show exactly where leads drop off
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Campaign attribution tracks ROI across all marketing channels
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                    </div>
                    <span className="text-base text-gray-700">
                      Custom reports and scheduled exports keep stakeholders informed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to experience all these features?"
        subtext="Start your 14-day free trial. No credit card required."
        primaryCTA={{ text: 'Start Free Trial', href: '/register' }}
        secondaryCTA={{ text: 'View Pricing', href: '/pricing' }}
      />
    </>
  );
}
