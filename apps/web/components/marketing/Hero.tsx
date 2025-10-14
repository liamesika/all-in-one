'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, CheckCircle } from 'lucide-react';
import { VideoModal } from './VideoModal';

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-semibold">Trusted by 500+ real estate professionals</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                Transform Your Real Estate Business with AI-Powered Management
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl">
                All-in-one platform for leads, properties, campaigns, and automation.
                Close more deals, save time, and grow your business.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start Free Trial
                </Link>
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200"
                >
                  <Play size={20} />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="text-sm text-gray-400">
                  <div className="text-2xl font-semibold text-white">10K+</div>
                  <div>Properties Managed</div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="text-2xl font-semibold text-white">50K+</div>
                  <div>Leads Tracked</div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="text-2xl font-semibold text-white">$50M+</div>
                  <div>Sales Attributed</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                {/* Placeholder for dashboard preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-xl mx-auto animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </>
  );
}
