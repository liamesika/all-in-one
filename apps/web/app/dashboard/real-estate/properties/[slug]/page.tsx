'use client';

import { useLanguage } from '@/lib/language-context';
import { useParams } from 'next/navigation';

export default function PropertyDetailPage() {
  const { language } = useLanguage();
  const params = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">🏘️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {language === 'he' ? 'בתחזוקה' : 'Under Maintenance'}
        </h1>
        <p className="text-gray-600 mb-4">
          {language === 'he'
            ? 'דף פרטי נכס בשדרוג. נחזור בקרוב!'
            : 'The property details page is being upgraded. We\'ll be back soon!'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Property ID: {params.slug}
        </p>
        <a
          href="/dashboard/real-estate/properties"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {language === 'he' ? 'חזרה לנכסים' : 'Back to Properties'}
        </a>
      </div>
    </div>
  );
}
