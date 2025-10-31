'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Dashboard Router Page
 *
 * This page handles routing authenticated users to their correct vertical dashboard
 * based on their defaultVertical setting from the database.
 *
 * Flow:
 * 1. Check auth state
 * 2. Fetch user profile from /api/auth/me
 * 3. Redirect to appropriate vertical dashboard
 * 4. Fallback to e-commerce if vertical unknown
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, getToken } = useAuth();

  useEffect(() => {
    const redirectToUserDashboard = async () => {
      if (loading) {
        console.log('🔄 [DASHBOARD] Auth loading...');
        return;
      }

      if (!user) {
        console.log('❌ [DASHBOARD] No user, redirecting to login');
        router.replace('/login?next=/dashboard');
        return;
      }

      try {
        console.log('🔐 [DASHBOARD] Fetching user vertical from API...');
        const token = await getToken();

        if (!token) {
          console.error('❌ [DASHBOARD] No token available');
          router.replace('/login?next=/dashboard');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          console.error('❌ [DASHBOARD] Failed to fetch user data:', response.status);
          // Fallback to e-commerce
          router.replace('/dashboard/ecommerce');
          return;
        }

        const userData = await response.json();
        const vertical = userData.defaultVertical;

        console.log('👤 [DASHBOARD] User vertical:', vertical);

        const verticalMap: Record<string, string> = {
          'REAL_ESTATE': '/dashboard/real-estate/dashboard',
          'E_COMMERCE': '/dashboard/ecommerce',
          'LAW': '/dashboard/law/dashboard',
          'PRODUCTION': '/dashboard/production/dashboard',
        };

        const dashboardPath = verticalMap[vertical] || '/dashboard/ecommerce';
        console.log('➡️ [DASHBOARD] Redirecting to:', dashboardPath);

        router.replace(dashboardPath);
      } catch (error) {
        console.error('❌ [DASHBOARD] Error determining dashboard:', error);
        // Fallback to e-commerce on any error
        router.replace('/dashboard/ecommerce');
      }
    };

    redirectToUserDashboard();
  }, [user, loading, router, getToken]);

  // Loading spinner while determining dashboard
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        <p className="text-gray-400 text-sm">Determining your vertical...</p>
      </div>
    </div>
  );
}
