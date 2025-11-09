'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  Target,
  MessageSquare,
  Package,
  DollarSign,
  BarChart3,
  Clock,
  Repeat,
  Smartphone
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

export default function EcommercePage() {
  useEffect(() => {
    preserveUTMParams();
    trackEventWithConsent('page_view', {
      page_title: 'E-Commerce Landing Page',
      page_path: '/industries/e-commerce',
      profession: 'e-commerce',
    });
  }, []);

  const handleCTAClick = (ctaType: 'primary' | 'secondary', location: 'hero' | 'bottom', position: number) => {
    trackEventWithConsent('cta_click', {
      cta_type: ctaType,
      cta_location: location,
      cta_position: position,
      cta_text: ctaType === 'primary' ? 'Start Free Trial' : 'Schedule Demo',
      page: 'e-commerce',
      profession: 'e-commerce',
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'E-Commerce Management Platform',
    description: 'Complete e-commerce management with marketing automation. Save 20+ hours per week and grow revenue by 50%.',
    url: 'https://effinity.co.il/industries/e-commerce',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://effinity.co.il' },
        { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://effinity.co.il/industries' },
        { '@type': 'ListItem', position: 3, name: 'E-Commerce' },
      ],
    },
    provider: { '@type': 'Organization', name: 'Effinity', url: 'https://effinity.co.il' },
  };

  const capabilities = [
    {
      icon: Package,
      title: 'Product & Inventory Management',
      description: 'Centralized catalog management with real-time inventory tracking, automated restock alerts, and multi-warehouse support.',
      color: 'purple'
    },
    {
      icon: ShoppingCart,
      title: 'Order Tracking & Fulfillment',
      description: 'End-to-end order management from placement to delivery with automated status updates and shipping integrations.',
      color: 'blue'
    },
    {
      icon: Target,
      title: 'Marketing Automation',
      description: 'Cart abandonment recovery, personalized email campaigns, and behavioral triggers that convert browsers into buyers.',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Revenue Analytics',
      description: 'Deep insights into sales trends, customer lifetime value, product performance, and campaign attribution across channels.',
      color: 'teal'
    },
    {
      icon: Users,
      title: 'Customer Segmentation',
      description: 'Intelligent customer grouping based on behavior, purchase history, and engagement for targeted marketing.',
      color: 'purple'
    },
    {
      icon: Repeat,
      title: 'Subscription Management',
      description: 'Recurring billing, subscription lifecycle management, and automated renewal reminders for subscription-based products.',
      color: 'blue'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      stat: '20 hours/week',
      label: 'Time Saved',
      description: 'Automated order processing, inventory sync, and customer follow-ups eliminate manual data entry and repetitive tasks.'
    },
    {
      icon: TrendingUp,
      stat: '50% more revenue',
      label: 'From Automation',
      description: 'Cart recovery emails, personalized recommendations, and automated upsells drive additional revenue without extra effort.'
    },
    {
      icon: DollarSign,
      stat: '35% higher',
      label: 'Customer Retention',
      description: 'Automated post-purchase sequences and loyalty programs keep customers engaged and coming back for more.'
    },
    {
      icon: Smartphone,
      stat: 'Omnichannel',
      label: 'Selling',
      description: 'Sell across web, mobile, social media, and marketplaces — all inventory and orders synced in real-time.'
    }
  ];

  const features = [
    'Product catalog with variants & bundles',
    'Inventory tracking across warehouses',
    'Shopping cart abandonment recovery',
    'Email & SMS marketing automation',
    'Order management & fulfillment tracking',
    'Customer segmentation & analytics',
    'Campaign attribution (Meta, Google, TikTok)',
    'Subscription & recurring billing',
    'Multi-currency & multi-language support',
    'Payment gateway integrations',
    'Shipping carrier integrations',
    'Returns & refund management'
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Industries', href: '/industries' },
              { label: 'E-Commerce' },
            ]}
            className="mb-8"
          />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-purple-100 rounded-full">
              <ShoppingCart className="text-purple-700" size={20} />
              <span className="text-sm font-semibold text-purple-700">E-Commerce Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              E-Commerce Management{' '}
              <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                That Sells While You Sleep
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From product catalog to checkout, run your entire e-commerce operation with
              marketing automation that recovers abandoned carts, increases repeat purchases, and grows revenue by 50%.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={appendUTMParams('/register')}
                onClick={() => handleCTAClick('primary', 'hero', 1)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                aria-label="Start your free trial of Effinity E-Commerce platform"
              >
                Start Free Trial
              </Link>
              <Link
                href={appendUTMParams('/contact')}
                onClick={() => handleCTAClick('secondary', 'hero', 2)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200"
                aria-label="Schedule a demo of Effinity E-Commerce platform"
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
              E-commerce businesses using Effinity report dramatic time savings,
              higher conversion rates, and increased customer lifetime value.
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
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-purple-700" size={28} />
                  </div>
                  <div className="text-3xl font-semibold text-purple-700 mb-2">
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
              Everything you need to run a modern e-commerce business —
              from inventory to checkout to post-purchase automation.
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
              Everything included in your E-Commerce platform subscription
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
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors duration-200"
              >
                <Zap className="text-purple-700 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-900">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Automate Your E-Commerce Operations?"
        subtext="Join thousands of online stores that have increased revenue and reduced manual work with Effinity's automation platform."
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
