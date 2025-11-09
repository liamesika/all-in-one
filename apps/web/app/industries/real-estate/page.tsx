'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Target,
  MessageSquare,
  Calendar,
  Search,
  DollarSign,
  Globe,
  Clock
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CTASection } from '@/components/marketing/CTASection';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { preserveUTMParams, appendUTMParams } from '@/lib/utils/utm';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function RealEstatePage() {
  // Preserve UTM parameters on mount
  useEffect(() => {
    preserveUTMParams();

    // Track page view with consent check
    trackEventWithConsent('page_view', {
      page_title: 'Real Estate Landing Page',
      page_path: '/industries/real-estate',
      profession: 'real-estate',
    });
  }, []);

  const handleCTAClick = (ctaType: 'primary' | 'secondary', location: 'hero' | 'bottom', position: number) => {
    trackEventWithConsent('cta_click', {
      cta_type: ctaType,
      cta_location: location,
      cta_position: position,
      cta_text: ctaType === 'primary' ? 'Start Free Trial' : 'Schedule Demo',
      page: 'real-estate',
      profession: 'real-estate',
    });
  };

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Real Estate Management Platform',
    description:
      'Complete real estate management with AI-powered automation. Save 15+ hours per week and increase conversions by 40%.',
    url: 'https://effinity.co.il/industries/real-estate',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://effinity.co.il',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Industries',
          item: 'https://effinity.co.il/industries',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Real Estate',
        },
      ],
    },
    provider: {
      '@type': 'Organization',
      name: 'Effinity',
      url: 'https://effinity.co.il',
    },
  };

  const capabilities = [
    {
      icon: Home,
      title: 'Property Management',
      description: 'Complete property listing system with AI-powered search, advanced filters, and automated property matching for buyers.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Lead Qualification',
      description: 'Intelligent lead scoring and qualification system that prioritizes high-value prospects and automates follow-up sequences.',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'Campaign Attribution',
      description: 'Track campaign performance across Meta, Google, TikTok, and LinkedIn with detailed ROI analytics and conversion tracking.',
      color: 'orange'
    },
    {
      icon: MessageSquare,
      title: 'Automated Follow-ups',
      description: 'Pre-built email sequences with smart triggers based on lead behavior, property views, and engagement patterns.',
      color: 'teal'
    },
    {
      icon: Search,
      title: 'AI Property Search',
      description: 'Natural language property search that understands buyer intent and automatically matches properties to requirements.',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Appointment Management',
      description: 'Integrated calendar system for property viewings, meetings, and automated reminders for both agents and clients.',
      color: 'purple'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      stat: '15 hours/week',
      label: 'Time Saved',
      description: 'Automation handles repetitive tasks like lead follow-ups, property matching, and appointment scheduling.'
    },
    {
      icon: TrendingUp,
      stat: '3x faster',
      label: 'Lead Response',
      description: 'Instant automated responses ensure no lead goes cold. Follow-up sequences trigger within seconds of inquiry.'
    },
    {
      icon: DollarSign,
      stat: '40% increase',
      label: 'Conversion Rate',
      description: 'AI-powered lead scoring and automated nurturing convert more prospects into active buyers and sellers.'
    },
    {
      icon: Globe,
      stat: 'Multi-platform',
      label: 'Campaign Integration',
      description: 'Unified dashboard for all advertising platforms. Track ROI across Meta, Google, TikTok, and LinkedIn in one place.'
    }
  ];

  const features = [
    'Property listings with advanced search & filters',
    'Lead capture forms with campaign attribution',
    'Automated email follow-up sequences',
    'Property matching algorithm (AI-powered)',
    'CRM with contact history & notes',
    'Calendar & appointment scheduling',
    'Campaign analytics & ROI tracking',
    'WhatsApp & SMS integration',
    'Document management & e-signatures',
    'Mobile app for agents on-the-go',
    'Custom property landing pages',
    'Multi-language support (EN/HE with RTL)'
  ];

  return (
    <div className="min-h-screen bg-white">

      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Industries', href: '/industries' },
              { label: 'Real Estate' },
            ]}
            className="mb-8"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-blue-100 rounded-full">
              <Home className="text-blue-700" size={20} />
              <span className="text-sm font-semibold text-blue-700">Real Estate Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              Complete Real Estate Management{' '}
              <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From property listings to lead conversion, manage your entire real estate operation
              with AI-powered automation that saves 15+ hours per week and increases conversions by 40%.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={appendUTMParams('/register')}
                onClick={() => handleCTAClick('primary', 'hero', 1)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                aria-label="Start your free trial of Effinity Real Estate platform"
              >
                Start Free Trial
              </Link>
              <Link
                href={appendUTMParams('/contact')}
                onClick={() => handleCTAClick('secondary', 'hero', 2)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                aria-label="Schedule a demo of Effinity Real Estate platform"
              >
                Schedule Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              What You Save
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real estate professionals using Effinity report significant time savings,
              higher conversion rates, and better campaign ROI.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.label}
                  variants={fadeInUp}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-blue-700" size={28} />
                  </div>
                  <div className="text-3xl font-semibold text-blue-700 mb-2">
                    {benefit.stat}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    {benefit.label}
                  </div>
                  <p className="text-sm text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Complete System Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to run a modern real estate business —
              from lead capture to closing, all in one unified platform.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <motion.div
                  key={capability.title}
                  variants={fadeInUp}
                  className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-${capability.color}-500 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {capability.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Full Feature Set
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything included in your Real Estate platform subscription
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
          >
            {features.map((feature) => (
              <motion.div
                key={feature}
                variants={fadeInUp}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
              >
                <Zap className="text-blue-700 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-900">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Transform Your Real Estate Business?"
        subtext="Join hundreds of agents and brokerages who have automated their workflow and increased conversions with Effinity."
        primaryCTA={{
          text: "Start Free Trial",
          href: appendUTMParams('/register'),
          onClick: () => handleCTAClick('primary', 'bottom', 3)
        }}
        secondaryCTA={{
          text: "Contact Sales",
          href: appendUTMParams('/contact'),
          onClick: () => handleCTAClick('secondary', 'bottom', 4)
        }}
      />

      <MarketingFooter />
    </div>
  );
}
