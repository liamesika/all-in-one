import React from 'react';

export const metadata = {
  title: {
    default: 'Organization Admin - EFFINITY',
    template: '%s | Organization Admin - EFFINITY'
  },
  description: 'EFFINITY Organization Administration - Manage your team and settings',
};

export default function OrgAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {children}
      </main>
    </div>
  );
}