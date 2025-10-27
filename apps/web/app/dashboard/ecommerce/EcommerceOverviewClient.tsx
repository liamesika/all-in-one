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
  ListTodo,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  KPICard,
} from '@/components/shared';
import { EcommerceHeader } from '@/components/dashboard/EcommerceHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';
import { TaskProgressModal, type TutorialTask } from '@/components/ecommerce/TaskProgressModal';

interface EcomStats {
  tutorialsCompleted: number;
  totalTutorials: number;
  productsUploaded: number;
  aiImagesGenerated: number;
  lastPerformanceScore: number | null;
  csvSessionsCompleted: number;
  campaignBriefsCreated: number;
  shopifyConnected: boolean;
  tutorialTasks?: TutorialTask[];
}

const DEFAULT_TASKS: TutorialTask[] = [
  { id: 1, title: 'Getting Started with Shopify', titleHe: 'תחילת העבודה עם Shopify', status: 'not_started' },
  { id: 2, title: 'Store Theme Selection', titleHe: 'בחירת ערכת עיצוב', status: 'not_started' },
  { id: 3, title: 'Product Management', titleHe: 'ניהול מוצרים', status: 'not_started' },
  { id: 4, title: 'Collections & Categories', titleHe: 'קטגוריות ואוספים', status: 'not_started' },
  { id: 5, title: 'Payment Gateway Setup', titleHe: 'הגדרת שער תשלום', status: 'not_started' },
  { id: 6, title: 'Shipping Configuration', titleHe: 'הגדרת משלוח', status: 'not_started' },
  { id: 7, title: 'Marketing Tools', titleHe: 'כלי שיווק', status: 'not_started' },
  { id: 8, title: 'SEO Optimization', titleHe: 'אופטימיזציה ל-SEO', status: 'not_started' },
  { id: 9, title: 'Analytics Dashboard', titleHe: 'לוח בקרה אנליטי', status: 'not_started' },
  { id: 10, title: 'Advanced Customization', titleHe: 'התאמה אישית מתקדמת', status: 'not_started' },
];

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
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState<TutorialTask[]>(DEFAULT_TASKS);

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
          if (data.stats.tutorialTasks && Array.isArray(data.stats.tutorialTasks)) {
            setTasks(data.stats.tutorialTasks);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleUpdateTask = async (taskId: number, status: TutorialTask['status']) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));

      const response = await fetch('/api/ecommerce/tutorials/update-task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, status, allTasks: updatedTasks }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(updatedTasks);
        setStats((prev) => ({ ...prev, tutorialsCompleted: data.completed }));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

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
      <EcommerceHeader />

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
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {lang === 'he'
                ? 'כלים מקצועיים לבניה וניהול של חנות Shopify מצליחה'
                : 'Professional tools for building and managing a successful Shopify store'}
            </p>

            {/* Educational Overview Section */}
            <UniversalCard variant="elevated" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-[#2979FF]/20">
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2979FF] flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {lang === 'he' ? 'מהו Effinity E-Commerce Suite?' : 'What is Effinity E-Commerce Suite?'}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {lang === 'he'
                        ? 'Effinity E-Commerce Suite היא פלטפורמת עסקית וקורס דיגיטלי אינטראקטיבי המדריך אותך שלב אחר שלב — מהעלאת המוצרים הראשונים שלך וכתיבת תיאורי AI מושלמים, דרך יצירת תמונות והשקת קמפיינים פרסומיים משלך — הכל במערכת אחת.'
                        : 'The Effinity E-Commerce Suite is an interactive digital course and business platform guiding you step-by-step — from uploading your first products and writing perfect AI descriptions, to generating images and launching your own ad campaigns — all within one system.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Sparkles className="w-4 h-4 text-[#2979FF]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang === 'he' ? 'תוכן AI' : 'AI Content'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <ImageIcon className="w-4 h-4 text-[#2979FF]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang === 'he' ? 'יצירת תמונות' : 'Image Generation'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Target className="w-4 h-4 text-[#2979FF]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang === 'he' ? 'קמפיינים' : 'Campaigns'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </UniversalCard>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10">
            <button
              onClick={() => setShowTaskModal(true)}
              className="group cursor-pointer"
            >
              <KPICard
                icon={<GraduationCap className="w-5 h-5" />}
                label={lang === 'he' ? 'הדרכות שהושלמו' : 'Tutorials Completed'}
                value={`${stats.tutorialsCompleted}/${stats.totalTutorials}`}
                change={{
                  value: `${Math.round((stats.tutorialsCompleted / stats.totalTutorials) * 100)}%`,
                  trend: stats.tutorialsCompleted > 0 ? 'up' : 'neutral',
                }}
              />
            </button>
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

      {/* Task Progress Modal */}
      <TaskProgressModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        lang={lang}
      />
    </div>
  );
}
