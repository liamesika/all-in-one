'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Video,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  Layers,
  Target,
  BarChart3
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CTASection } from '@/components/marketing/CTASection';
import { trackEvent } from '@/lib/analytics';

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

export default function ProductionsPage() {
  useEffect(() => {
    document.title = 'Creative Productions Management Platform | Effinity';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Project management for creative studios with automation. Save 18+ hours per week and increase margins by 30%. Budget tracking, timeline management, and asset delivery.');
    }
    trackEvent('page_view', {
      page_title: 'Productions Landing Page',
      page_path: '/industries/productions',
    });
  }, []);

  const handleCTAClick = (ctaType: 'primary' | 'secondary', location: 'hero' | 'bottom') => {
    trackEvent('cta_click', {
      cta_type: ctaType,
      cta_location: location,
      cta_text: ctaType === 'primary' ? 'Start Free Trial' : 'Schedule Demo',
      page: 'productions',
    });
  };

  const capabilities = [
    {
      icon: Target,
      title: 'Project & Task Management',
      description: 'Centralized project tracking with Kanban boards, task assignments, dependencies, and real-time progress monitoring for your entire production team.',
      color: 'orange'
    },
    {
      icon: DollarSign,
      title: 'Budget & Cost Tracking',
      description: 'Real-time budget monitoring, expense tracking, purchase orders, and financial forecasting to keep projects profitable.',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Timeline & Milestones',
      description: 'Visual production schedules, deadline tracking, milestone management, and automated alerts to keep projects on schedule.',
      color: 'purple'
    },
    {
      icon: Layers,
      title: 'Asset & File Delivery',
      description: 'Centralized media library, version control, client review portals, and automated delivery workflows for final assets.',
      color: 'teal'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time messaging, file sharing, task comments, and integrated communication tools for seamless team coordination.',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Project profitability analysis, team productivity metrics, budget vs. actual reporting, and custom dashboards.',
      color: 'blue'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      stat: '18 hours/week',
      label: 'Time Saved',
      description: 'Automated task tracking, file management, and client communication eliminate repetitive administrative overhead.'
    },
    {
      icon: TrendingUp,
      stat: '25% more projects',
      label: 'Capacity',
      description: 'Streamlined workflows and better resource allocation allow teams to handle more projects simultaneously.'
    },
    {
      icon: DollarSign,
      stat: '30% higher',
      label: 'Profit Margins',
      description: 'Real-time budget tracking and expense monitoring prevent cost overruns and improve project profitability.'
    },
    {
      icon: CheckCircle,
      stat: '95% on-time',
      label: 'Delivery',
      description: 'Automated deadline tracking and milestone alerts ensure projects finish on schedule and clients stay happy.'
    }
  ];

  const features = [
    'Kanban board & task management',
    'Budget tracking & expense management',
    'Timeline & milestone planning',
    'File storage & version control',
    'Client review & approval workflows',
    'Team collaboration & messaging',
    'Resource allocation & scheduling',
    'Invoice generation & time tracking',
    'Custom project templates',
    'Real-time analytics dashboard',
    'Automated delivery workflows',
    'Mobile app for on-set management'
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-orange-100 rounded-full">
              <Video className="text-orange-700" size={20} />
              <span className="text-sm font-semibold text-orange-700">Creative Productions Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              Project Management for{' '}
              <span className="bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent">
                Creative Studios
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From pre-production to delivery, manage your entire creative workflow with tools
              that save 18+ hours per week and increase profit margins by 30%.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                onClick={() => handleCTAClick('primary', 'hero')}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-orange-700 hover:bg-orange-800 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                aria-label="Start your free trial of Effinity Productions platform"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                onClick={() => handleCTAClick('secondary', 'hero')}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200"
                aria-label="Schedule a demo of Effinity Productions platform"
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
              Creative studios using Effinity report significant time savings,
              higher project capacity, and better profit margins.
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
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-orange-700" size={28} />
                  </div>
                  <div className="text-3xl font-semibold text-orange-700 mb-2">
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
              Everything you need to run a modern creative studio —
              from project kickoff to final delivery, all in one platform.
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
              Everything included in your Productions platform subscription
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
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors duration-200"
              >
                <Zap className="text-orange-700 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-900">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Streamline Your Creative Production?"
        subtext="Join leading creative studios that have automated their workflows and increased profitability with Effinity."
        primaryCTA={{
          text: "Start Free Trial",
          href: "/register",
          onClick: () => handleCTAClick('primary', 'bottom')
        }}
        secondaryCTA={{
          text: "Contact Sales",
          href: "/contact",
          onClick: () => handleCTAClick('secondary', 'bottom')
        }}
      />

      <MarketingFooter />
    </div>
  );
}
