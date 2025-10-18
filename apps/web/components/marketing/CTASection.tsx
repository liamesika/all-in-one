'use client';

import Link from 'next/link';

interface CTASectionProps {
  headline: string;
  subtext: string;
  primaryCTA: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
}

export function CTASection({
  headline,
  subtext,
  primaryCTA,
  secondaryCTA,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
            {headline}
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            {subtext}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryCTA.href}
              onClick={primaryCTA.onClick}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              {primaryCTA.text}
            </Link>
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                onClick={secondaryCTA.onClick}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200"
              >
                {secondaryCTA.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
