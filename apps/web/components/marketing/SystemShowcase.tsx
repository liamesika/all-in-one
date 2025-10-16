'use client';

import { motion } from 'framer-motion';
import { Home, ShoppingCart, Video, Scale, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const systems = [
  {
    id: 'real-estate',
    title: 'Real Estate System',
    icon: Home,
    gradient: 'from-blue-500 to-blue-700',
    description: 'Property listings, lead management, AI search, and campaign tracking',
    features: ['15K+ Properties', '50K+ Leads', 'AI-Powered Search', 'Multi-Platform Campaigns'],
    screenshotPlaceholder: 'Real Estate Dashboard',
    href: '/dashboard/real-estate/dashboard'
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce System',
    icon: ShoppingCart,
    gradient: 'from-purple-500 to-purple-700',
    description: 'Product catalog, order management, marketing automation, and analytics',
    features: ['Product Management', 'Order Tracking', 'Marketing Automation', 'Revenue Analytics'],
    screenshotPlaceholder: 'E-Commerce Dashboard',
    href: '/dashboard/e-commerce/dashboard'
  },
  {
    id: 'productions',
    title: 'Productions System',
    icon: Video,
    gradient: 'from-orange-500 to-orange-700',
    description: 'Project management, budgets, timelines, and asset delivery',
    features: ['Project Management', 'Budget Tracking', 'Timeline Views', 'Asset Delivery'],
    screenshotPlaceholder: 'Productions Dashboard',
    href: '/dashboard/production/dashboard'
  },
  {
    id: 'law',
    title: 'Law System',
    icon: Scale,
    gradient: 'from-teal-500 to-teal-700',
    description: 'Case management, document automation, billing, and client portal',
    features: ['Case Management', 'Document Automation', 'Time & Billing', 'Client Portal'],
    screenshotPlaceholder: 'Law Dashboard',
    href: '/dashboard/law/dashboard'
  }
];

export function SystemShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white">
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
            See the Systems in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Each vertical is a complete, production-ready system with real data,
            live workflows, and proven results.
          </p>
        </motion.div>

        {/* Systems Grid */}
        <div className="space-y-16">
          {systems.map((system, index) => {
            const Icon = system.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}
              >
                {/* Content */}
                <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${system.gradient} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                      {system.title}
                    </h3>
                  </div>

                  <p className="text-base text-gray-600 mb-6 leading-relaxed">
                    {system.description}
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {system.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${system.gradient}`}></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={system.href}
                    className={`
                      inline-flex items-center gap-2 px-6 py-3 rounded-lg
                      bg-gradient-to-r ${system.gradient} text-white font-medium
                      transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                    `}
                  >
                    View Live System
                    <ExternalLink size={16} />
                  </Link>
                </div>

                {/* Screenshot Placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className={isEven ? 'lg:order-2' : 'lg:order-1'}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    {/* Aspect ratio container */}
                    <div className="aspect-video flex items-center justify-center p-12">
                      {/* Placeholder content */}
                      <div className="text-center space-y-4">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${system.gradient} mx-auto flex items-center justify-center shadow-lg`}>
                          <Icon size={40} className="text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 mb-2">
                            {system.screenshotPlaceholder}
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded w-48 mx-auto"></div>
                            <div className="h-3 bg-gray-300 rounded w-36 mx-auto"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${system.gradient} opacity-10 blur-3xl`}></div>
                    <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl ${system.gradient} opacity-10 blur-3xl`}></div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
