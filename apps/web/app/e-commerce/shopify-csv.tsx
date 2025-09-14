'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopifyCsvRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/e-commerce/shopify-csv');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to new Shopify CSV tool...</p>
      </div>
    </div>
  );
}
