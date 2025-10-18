'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Scale,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Shield,
  Search,
  MessageSquare
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CTASection } from '@/components/marketing/CTASection';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { PageHead } from '@/components/seo/PageHead';
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

export default function LawPage() {
  useEffect(() => {
    preserveUTMParams();
    trackEventWithConsent('page_view', {
      page_title: 'Law Landing Page',
      page_path: '/industries/law',
      profession: 'law',
    });
  }, []);

  const handleCTAClick = (ctaType: 'primary' | 'secondary', location: 'hero' | 'bottom', position: number) => {
    trackEventWithConsent('cta_click', {
      cta_type: ctaType,
      cta_location: location,
      cta_position: position,
      cta_text: ctaType === 'primary' ? 'Start Free Trial' : 'Schedule Demo',
      page: 'law',
      profession: 'law',
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Law Practice Management Platform',
    description: 'Complete law practice management with automation. Save 12+ hours per week and capture 40% more billable hours.',
    url: 'https://effinity.co.il/industries/law',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://effinity.co.il' },
        { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://effinity.co.il/industries' },
        { '@type': 'ListItem', position: 3, name: 'Law' },
      ],
    },
    provider: { '@type': 'Organization', name: 'Effinity', url: 'https://effinity.co.il' },
  };

  const capabilities = [
    {
      icon: Briefcase,
      title: 'Case & Matter Management',
      description: 'Centralized case tracking with matter timelines, status updates, court deadlines, and collaborative task management for your entire legal team.',
      color: 'teal'
    },
    {
      icon: FileText,
      title: 'Document Automation',
      description: 'Template-based document generation, version control, e-signature integration, and secure client portals for document sharing.',
      color: 'blue'
    },
    {
      icon: Clock,
      title: 'Time Tracking & Billing',
      description: 'Automated time tracking, billable hours management, invoice generation, and detailed billing reports for transparent client communication.',
      color: 'orange'
    },
    {
      icon: Users,
      title: 'Client Portal & Communication',
      description: 'Secure client communication hub with document sharing, appointment scheduling, case updates, and encrypted messaging.',
      color: 'purple'
    },
    {
      icon: Calendar,
      title: 'Deadline & Calendar Management',
      description: 'Court date tracking, statute of limitations alerts, automated deadline reminders, and integrated calendar sync with Outlook/Google.',
      color: 'teal'
    },
    {
      icon: Shield,
      title: 'Compliance & Security',
      description: 'GDPR compliance, data encryption, audit trails, role-based access control, and attorney-client privilege protection.',
      color: 'blue'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      stat: '12 hours/week',
      label: 'Time Saved',
      description: 'Automated document generation, time tracking, and client communication eliminate repetitive administrative work.'
    },
    {
      icon: TrendingUp,
      stat: '40% more billable',
      label: 'Hours Captured',
      description: 'Automatic time tracking ensures no billable hour goes unrecorded. Capture every phone call, email, and document review.'
    },
    {
      icon: DollarSign,
      stat: '30% faster',
      label: 'Collections',
      description: 'Automated invoicing, payment reminders, and online payment options accelerate cash flow and reduce outstanding balances.'
    },
    {
      icon: Search,
      stat: 'Instant',
      label: 'Case Access',
      description: 'Find any case, document, or client communication in seconds with powerful search and AI-powered document organization.'
    }
  ];

  const features = [
    'Case & matter tracking with timelines',
    'Document templates & automation',
    'Time tracking & billable hours',
    'Invoice generation & payment tracking',
    'Client portal with secure messaging',
    'Court deadline & calendar management',
    'Task management & team collaboration',
    'Conflict checking & intake automation',
    'Document version control & e-signatures',
    'Trust accounting & IOLTA compliance',
    'Reporting & analytics dashboard',
    'Mobile app for attorneys on-the-go'
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHead
        title="Law Practice Management Platform | Effinity"
        description="Complete law practice management with automation. Save 12+ hours per week and capture 40% more billable hours. Case tracking, document automation, time tracking, and billing."
        canonical="https://effinity.co.il/industries/law"
        ogImage="https://effinity.co.il/og-law.jpg"
        keywords="law practice management, legal case management, time tracking, billing software, document automation"
        jsonLd={jsonLd}
      />
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Industries', href: '/industries' },
              { label: 'Law' },
            ]}
            className="mb-8"
          />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-teal-100 rounded-full">
              <Scale className="text-teal-700" size={20} />
              <span className="text-sm font-semibold text-teal-700">Law Practice Management</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              Law Practice Management{' '}
              <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                Built for Modern Firms
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From case intake to billing, manage your entire law practice with automation
              that saves 12+ hours per week and captures 40% more billable hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={appendUTMParams('/register')}
                onClick={() => handleCTAClick('primary', 'hero', 1)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                aria-label="Start your free trial of Effinity Law Practice Management platform"
              >
                Start Free Trial
              </Link>
              <Link
                href={appendUTMParams('/contact')}
                onClick={() => handleCTAClick('secondary', 'hero', 2)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all duration-200"
                aria-label="Schedule a demo of Effinity Law Practice Management platform"
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
              Law firms using Effinity report significant time savings,
              more captured billable hours, and faster collections.
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
                  <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-teal-700" size={28} />
                  </div>
                  <div className="text-3xl font-semibold text-teal-700 mb-2">
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
              Everything you need to run a modern law practice —
              from case management to billing, all in one unified platform.
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
              Everything included in your Law Practice Management subscription
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
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors duration-200"
              >
                <Zap className="text-teal-700 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-900">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Transform Your Law Practice?"
        subtext="Join hundreds of law firms that have automated their workflow and increased billable hours with Effinity."
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
