'use client';

// Root homepage - Public landing page with lead form
import { useRef } from 'react';
import { MultiVerticalHero } from '@/components/marketing/MultiVerticalHero';
import { PlatformOverview } from '@/components/marketing/PlatformOverview';
import { CoreCapabilities } from '@/components/marketing/CoreCapabilities';
import { PublicLeadForm } from '@/components/public/PublicLeadForm';

// Note: Metadata must be exported from layout.tsx when page is a client component
// See apps/web/app/layout.tsx for metadata configuration

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <>
      {/* Hero Section - Multi-Vertical */}
      <MultiVerticalHero ref={heroRef} />

      {/* Platform Overview - 4 Verticals */}
      <PlatformOverview />

      {/* Core Capabilities - Shared Infrastructure */}
      <CoreCapabilities />

      {/* Public Lead Form */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PublicLeadForm />
        </div>
      </section>
    </>
  );
}
