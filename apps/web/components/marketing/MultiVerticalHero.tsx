'use client';

import { useState, forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Home,
  ShoppingCart,
  Video,
  Scale,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Vertical {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  href: string;
  features: string[];
}

const verticals: Vertical[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: Home,
    color: '#2979FF',
    gradient: 'from-blue-500 to-blue-700',
    description: 'Property management, lead tracking, and campaign attribution',
    href: '/dashboard/real-estate/dashboard',
    features: ['Properties', 'Leads', 'Campaigns', 'AI Search']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: ShoppingCart,
    color: '#9C27B0',
    gradient: 'from-purple-500 to-purple-700',
    description: 'Product catalog, orders, marketing automation, and analytics',
    href: '/dashboard/e-commerce/dashboard',
    features: ['Products', 'Orders', 'Campaigns', 'Analytics']
  },
  {
    id: 'productions',
    name: 'Productions',
    icon: Video,
    color: '#FF6F00',
    gradient: 'from-orange-500 to-orange-700',
    description: 'Project management, budgets, timelines, and asset delivery',
    href: '/dashboard/production/dashboard',
    features: ['Projects', 'Budget', 'Timeline', 'Assets']
  },
  {
    id: 'law',
    name: 'Law',
    icon: Scale,
    color: '#00897B',
    gradient: 'from-teal-500 to-teal-700',
    description: 'Case management, documents, billing, and client communication',
    href: '/dashboard/law/dashboard',
    features: ['Cases', 'Documents', 'Billing', 'Clients']
  }
];

export const MultiVerticalHero = forwardRef<HTMLElement>((props, ref) => {
  const [hoveredVertical, setHoveredVertical] = useState<string | null>(null);

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#0E1A2B] text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        {/* Header Content */}
        <div className="text-center mb-16 space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/logo/logo-silver.png"
              alt="Effinity Logo"
              width={200}
              height={60}
              priority
              className="h-12 sm:h-16 w-auto"
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
          >
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold">One Platform — Four Complete Systems</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-semibold leading-tight tracking-tight max-w-5xl mx-auto"
          >
            The Intelligent Platform
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              Built for Growth
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Effinity powers Real Estate agencies, E-Commerce businesses, Production studios,
            and Law firms with AI-driven automation, unified analytics, and professional tools.
          </motion.p>
        </div>

        {/* Vertical Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {verticals.map((vertical, index) => {
            const Icon = vertical.icon;
            const isHovered = hoveredVertical === vertical.id;

            return (
              <motion.div
                key={vertical.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onHoverStart={() => setHoveredVertical(vertical.id)}
                onHoverEnd={() => setHoveredVertical(null)}
                className="group relative"
              >
                <Link href={vertical.href}>
                  <div className={`
                    relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
                    transition-all duration-300
                    hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-2
                    ${isHovered ? 'ring-2 ring-white/30' : ''}
                  `}>
                    {/* Icon */}
                    <div className={`
                      w-14 h-14 rounded-xl bg-gradient-to-br ${vertical.gradient}
                      flex items-center justify-center mb-4
                      transition-transform duration-300 group-hover:scale-110
                    `}>
                      <Icon size={28} className="text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {vertical.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {vertical.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-1 mb-4">
                      {vertical.features.map((feature) => (
                        <li key={feature} className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      Explore System
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>

                    {/* Hover Glow */}
                    <div
                      className={`
                        absolute inset-0 rounded-2xl bg-gradient-to-br ${vertical.gradient}
                        opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none
                      `}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Free Trial
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200"
          >
            View Pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

MultiVerticalHero.displayName = 'MultiVerticalHero';
