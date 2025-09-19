// apps/web/app/(dashboard)/layout.tsx
import React from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';

export const metadata = {
  title: {
    default: 'Dashboard - EFFINITY',
    template: '%s | Dashboard - EFFINITY'
  },
  description: 'EFFINITY Dashboard - Manage your business efficiently',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="pt-0">
        {children}
      </main>
    </div>
  );
}