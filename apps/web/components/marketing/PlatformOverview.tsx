'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  ShoppingCart,
  Video,
  Scale,
  TrendingUp,
  Users,
  Zap,
  BarChart3
} from 'lucide-react';

const verticals = [
  {
    id: 'real-estate',
    icon: Home,
    title: 'Real Estate',
    description: 'Complete property and lead management system with AI-powered search, campaign attribution, and automated follow-ups.',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-700/20',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500',
    features: [
      'Property listings & search',
      'Lead qualification & scoring',
      'Multi-platform campaigns',
      'Automated email sequences'
    ],
    href: '/industries/real-estate'
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'End-to-end e-commerce platform with product catalog, order management, marketing automation, and conversion analytics.',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-700/20',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500',
    features: [
      'Product & inventory management',
      'Order tracking & fulfillment',
      'Marketing automation',
      'Revenue analytics'
    ],
    href: '/industries/e-commerce'
  },
  {
    id: 'productions',
    icon: Video,
    title: 'Productions',
    description: 'Project management for creative studios with budget tracking, timeline management, asset delivery, and team collaboration.',
    color: 'orange',
    gradient: 'from-orange-500/20 to-orange-700/20',
    borderColor: 'border-orange-500/30',
    iconBg: 'bg-orange-500',
    features: [
      'Project & task management',
      'Budget & cost tracking',
      'Timeline & milestones',
      'Asset & file delivery'
    ],
    href: '/dashboard/production/dashboard'
  },
  {
    id: 'law',
    icon: Scale,
    title: 'Law',
    description: 'Practice management system for law firms with case tracking, document management, billing, and client communication.',
    color: 'teal',
    gradient: 'from-teal-500/20 to-teal-700/20',
    borderColor: 'border-teal-500/30',
    iconBg: 'bg-teal-500',
    features: [
      'Case & matter management',
      'Document automation',
      'Time tracking & billing',
      'Client portal & communication'
    ],
    href: '/industries/law'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
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

export function PlatformOverview() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Four Complete Systems — One Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Each vertical is a full-featured system built for its industry, sharing a unified
            infrastructure, AI engine, and analytics backbone.
          </p>
        </motion.div>

        {/* Vertical Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {verticals.map((vertical) => {
            const Icon = vertical.icon;

            return (
              <motion.div
                key={vertical.id}
                variants={cardVariants}
                className="group"
              >
                <Link href={vertical.href}>
                  <div className={`
                    h-full p-6 rounded-2xl border ${vertical.borderColor}
                    bg-gradient-to-br ${vertical.gradient}
                    backdrop-blur-sm transition-all duration-300
                    hover:shadow-xl hover:-translate-y-2
                  `}>
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 ${vertical.iconBg} rounded-xl
                      flex items-center justify-center mb-4
                      transition-transform duration-300 group-hover:scale-110
                    `}>
                      <Icon size={24} className="text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {vertical.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {vertical.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {vertical.features.map((feature) => (
                        <li key={feature} className="text-xs text-gray-700 flex items-start gap-2">
                          <Zap size={12} className={`${vertical.iconBg.replace('bg-', 'text-')} mt-0.5 flex-shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                      Explore System
                      <TrendingUp size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Unified Infrastructure Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-1">Unified CRM</h4>
              <p className="text-sm text-white/80">
                Shared customer data across all verticals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-1">AI Automation</h4>
              <p className="text-sm text-white/80">
                Same powerful engine for all workflows
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-1">Cross-Vertical Analytics</h4>
              <p className="text-sm text-white/80">
                Unified reporting and insights dashboard
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
