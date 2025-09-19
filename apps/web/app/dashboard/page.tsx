'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    const fetchUserAndRedirect = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          const vertical = userData.defaultVertical;

          // Redirect based on user's default vertical
          switch (vertical) {
            case 'REAL_ESTATE':
              router.replace('/dashboard/real-estate/dashboard');
              break;
            case 'LAW':
              router.replace('/dashboard/law/dashboard');
              break;
            case 'E_COMMERCE':
            default:
              router.replace('/dashboard/e-commerce/dashboard');
              break;
          }
        } else {
          // Default fallback
          router.replace('/dashboard/e-commerce/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user data for redirect:', error);
        router.replace('/dashboard/e-commerce/dashboard');
      }
    };

    fetchUserAndRedirect();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}