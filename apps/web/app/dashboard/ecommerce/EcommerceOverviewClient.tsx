'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  GraduationCap,
  Upload,
  Sparkles,
  BarChart3,
  TrendingUp,
  Package,
  Image as ImageIcon,
  Target,
  Zap,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  KPICard,
} from '@/components/shared';
import { RealEstateHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface EcomStats {
  tutorialsCompleted: number;
  totalTutorials: number;
  productsUploaded: number;
  aiImagesGenerated: number;
  lastPerformanceScore: number | null;
  csvSessionsCompleted: number;
  campaignBriefsCreated: number;
  shopifyConnected: boolean;
}

export function EcommerceOverviewClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [stats, setStats] = useState<EcomStats>({
    tutorialsCompleted: 0,
    totalTutorials: 10,
    productsUploaded: 0,
    aiImagesGenerated: 0,
    lastPerformanceScore: null,
    csvSessionsCompleted: 0,
    campaignBriefsCreated: 0,
    shopifyConnected: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      id: 'tutorials',
      title: lang === 'he' ? 'הדרכות Shopify' : 'Shopify Tutorials',
      description: lang === 'he' ? 'למד כיצד ליצור ולנהל חנות' : 'Learn how to create and manage your store',
      icon: <GraduationCap className="w-6 h-6" />,
      color: '#2979FF',
      href: '/dashboard/ecommerce/tutorials',
    },
    {
      id: 'csv',
      title: lang === 'he' ? 'העלאת מוצרים' : 'Product CSV Builder',
      description: lang === 'he' ? 'יצירת מוצרים עם AI והעלאה ל-Shopify' : 'Create products with AI and upload to Shopify',
      icon: <Upload className="w-6 h-6" />,
      color: '#10B981',
      href: '/dashboard/ecommerce/products/csv',
    },
    {
      id: 'ai-images',
      title: lang === 'he' ? 'תמונות AI' : 'AI Image Studio',
      description: lang === 'he' ? 'יצירת תמונות למוצרים ופרסומות' : 'Generate images for products and ads',
      icon: <Sparkles className="w-6 h-6" />,
      color: '#F59E0B',
      href: '/dashboard/ecommerce/ai-images',
    },
    {
      id: 'structure',
      title: lang === 'he' ? 'מבנה החנות' : 'Store Structure',
      description: lang === 'he' ? 'ניהול קטגוריות ותפריטים' : 'Manage collections and menus',
      icon: <Package className="w-6 h-6" />,
      color: '#8B5CF6',
      href: '/dashboard/ecommerce/structure',
    },
    {
      id: 'layout',
      title: lang === 'he' ? 'תבנית העיצוב' : 'Layout Blueprint',
      description: lang === 'he' ? 'עיצוב סדר הסקשנים בדף הבית' : 'Design homepage section order',
      icon: <ImageIcon className="w-6 h-6" />,
      color: '#EC4899',
      href: '/dashboard/ecommerce/layout',
    },
    {
      id: 'campaigns',
      title: lang === 'he' ? 'עוזר קמפיינים' : 'Campaign Assistant',
      description: lang === 'he' ? 'תכנון קמפיינים ב-Meta' : 'Plan Meta campaigns',
      icon: <Target className="w-6 h-6" />,
      color: '#EF4444',
      href: '/dashboard/ecommerce/campaigns/assistant',
    },
    {
      id: 'performance',
      title: lang === 'he' ? 'בדיקת ביצועים' : 'Performance Check',
      description: lang === 'he' ? 'ניתוח ביצועים ו-SEO' : 'Audit performance and SEO',
      icon: <BarChart3 className="w-6 h-6" />,
      color: '#06B6D4',
      href: '/dashboard/ecommerce/performance',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <RealEstateHeader />

      <div className="pt-20 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-[#2979FF]" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'סוויטת מסחר אלקטרוני' : 'E-Commerce Suite'}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'he'
                ? 'כלים מקצועיים לבניה וניהול של חנות Shopify מצליחה'
                : 'Professional tools for building and managing a successful Shopify store'}
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10">
            <KPICard
              icon={<GraduationCap className="w-5 h-5" />}
              label={lang === 'he' ? 'הדרכות שהושלמו' : 'Tutorials Completed'}
              value={`${stats.tutorialsCompleted}/${stats.totalTutorials}`}
              change={{
                value: `${Math.round((stats.tutorialsCompleted / stats.totalTutorials) * 100)}%`,
                trend: stats.tutorialsCompleted > 0 ? 'up' : 'neutral',
              }}
            />
            <KPICard
              icon={<Upload className="w-5 h-5" />}
              label={lang === 'he' ? 'מוצרים שהועלו' : 'Products Uploaded'}
              value={stats.productsUploaded}
              change={{
                value: `${stats.csvSessionsCompleted} ${lang === 'he' ? 'סשנים' : 'sessions'}`,
                trend: stats.productsUploaded > 0 ? 'up' : 'neutral',
              }}
            />
            <KPICard
              icon={<Sparkles className="w-5 h-5" />}
              label={lang === 'he' ? 'תמונות AI שנוצרו' : 'AI Images Generated'}
              value={stats.aiImagesGenerated}
              change={{
                value: lang === 'he' ? 'מוכן לשימוש' : 'Ready to use',
                trend: 'neutral',
              }}
            />
            <KPICard
              icon={<BarChart3 className="w-5 h-5" />}
              label={lang === 'he' ? 'ציון ביצועים אחרון' : 'Last Performance Score'}
              value={stats.lastPerformanceScore || '-'}
              change={{
                value: stats.lastPerformanceScore ? '/100' : lang === 'he' ? 'טרם נבדק' : 'Not checked',
                trend: stats.lastPerformanceScore && stats.lastPerformanceScore >= 80 ? 'up' : 'neutral',
              }}
            />
          </div>

          {/* Quick Actions */}
          <UniversalCard variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-[#2979FF]" />
                <h2 className="text-heading-3 text-gray-900 dark:text-white">
                  {lang === 'he' ? 'פעולות מהירות' : 'Quick Actions'}
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => router.push(action.href)}
                    className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left transition-all duration-300 hover:border-[#2979FF] hover:shadow-lg hover:-translate-y-1"
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform duration-300 group-hover:scale-150"
                      style={{ backgroundColor: action.color }}
                    />
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <div style={{ color: action.color }}>{action.icon}</div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardBody>
          </UniversalCard>

          {/* Shopify Connection Status */}
          {!stats.shopifyConnected && (
            <UniversalCard variant="elevated" className="mt-6">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#2979FF]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lang === 'he' ? 'התחבר ל-Shopify' : 'Connect to Shopify'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'he'
                          ? 'חבר את חנות ה-Shopify שלך להעלאה ישירה של מוצרים'
                          : 'Connect your Shopify store for direct product uploads'}
                      </p>
                    </div>
                  </div>
                  <UniversalButton variant="primary">
                    {lang === 'he' ? 'התחבר עכשיו' : 'Connect Now'}
                  </UniversalButton>
                </div>
              </CardBody>
            </UniversalCard>
          )}
        </div>
      </div>
    </div>
  );
}
