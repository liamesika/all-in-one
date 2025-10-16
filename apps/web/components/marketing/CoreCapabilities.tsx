'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  BarChart3,
  Users,
  Lock,
  Palette,
  Zap
} from 'lucide-react';

const capabilities = [
  {
    icon: Brain,
    title: 'AI Automation Engine',
    description: 'Intelligent workflows, lead scoring, and predictive analytics powered by machine learning across all verticals.'
  },
  {
    icon: BarChart3,
    title: 'Unified Analytics',
    description: 'Real-time dashboards, custom reports, and cross-vertical insights to track performance and ROI.'
  },
  {
    icon: Users,
    title: 'CRM & Lead Management',
    description: 'Centralized customer data, interaction tracking, and automated follow-ups for every business type.'
  },
  {
    icon: Lock,
    title: 'Multi-Tenant Security',
    description: 'Enterprise-grade data isolation, role-based access, and SOC 2 compliance for every user.'
  },
  {
    icon: Palette,
    title: 'Design System 2.0',
    description: 'Professional UI components, dark mode, animations, and consistent branding across all systems.'
  },
  {
    icon: Zap,
    title: 'Performance & Scale',
    description: 'Sub-500ms API response times, 99.9% uptime, and infrastructure built to handle millions of requests.'
  }
];

const connectionLines = [
  { from: 0, to: 1, delay: 0.2 },
  { from: 1, to: 2, delay: 0.4 },
  { from: 2, to: 3, delay: 0.6 },
  { from: 3, to: 4, delay: 0.8 },
  { from: 4, to: 5, delay: 1.0 },
  { from: 5, to: 0, delay: 1.2 }
];

export function CoreCapabilities() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold mb-4">
            Shared Infrastructure — Unified Power
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Every vertical runs on the same enterprise-grade foundation, ensuring consistency,
            security, and performance across your entire business ecosystem.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;

            return (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                className="group relative"
              >
                <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl">
                  {/* Icon with Glow */}
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon size={28} className="text-white" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2">
                    {capability.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {capability.description}
                  </p>
                </div>

                {/* Connecting Lines (visible on larger screens) */}
                {connectionLines
                  .filter(line => line.from === index)
                  .map((line, lineIndex) => (
                    <motion.svg
                      key={lineIndex}
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.3 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: line.delay,
                        ease: 'easeInOut'
                      }}
                      className="hidden lg:block absolute top-1/2 left-full w-8 h-1 pointer-events-none"
                      style={{ zIndex: -1 }}
                    >
                      <motion.path
                        d="M 0 0 L 32 0"
                        stroke="rgba(99, 102, 241, 0.3)"
                        strokeWidth="2"
                        fill="none"
                      />
                    </motion.svg>
                  ))}
              </motion.div>
            );
          })}
        </div>

        {/* Ecosystem Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-sm font-semibold">
              One ecosystem. Infinite possibilities.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
