'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ShoppingCart, Video, Scale } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

const industries = [
  {
    id: 'real-estate',
    icon: Home,
    title: 'Real Estate',
    description:
      'Complete property and lead management system with AI-powered search, campaign attribution, and automated follow-ups.',
    color: 'blue',
    href: '/industries/real-estate',
  },
  {
    id: 'e-commerce',
    icon: ShoppingCart,
    title: 'E-Commerce',
    description:
      'End-to-end e-commerce platform with product catalog, order management, marketing automation, and conversion analytics.',
    color: 'purple',
    href: '/industries/e-commerce',
  },
  {
    id: 'productions',
    icon: Video,
    title: 'Productions',
    description:
      'Project management for creative studios with budget tracking, timeline management, asset delivery, and team collaboration.',
    color: 'orange',
    href: '/industries/productions',
  },
  {
    id: 'law',
    icon: Scale,
    title: 'Law',
    description:
      'Practice management system for law firms with case tracking, document management, billing, and client communication.',
    color: 'teal',
    href: '/industries/law',
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              Solutions Built for{' '}
              <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                Your Industry
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore industry-specific platforms designed to automate workflows,
              save time, and drive growth.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <Link
                  key={industry.id}
                  href={industry.href}
                  className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className={`w-16 h-16 bg-${industry.color}-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    {industry.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {industry.description}
                  </p>
                  <div className="mt-6 text-blue-700 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
