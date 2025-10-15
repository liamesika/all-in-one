'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  StatusBadge,
} from '@/components/shared';
import { useAuth } from '@/lib/auth-context';
import { AiCoachProvider } from '@/lib/ai-coach-context';
import AiCoachIntegration from '@/components/ai-coach/AiCoachIntegration';
import { Job } from '@/lib/types/job';
import { safeFetchJobs, safeFetchJobsSummary } from '@/lib/safe-fetch';

// ====== helpers: tiny charts (inline SVG, בלי תלות חיצונית) ======
function Sparkline({ points }: { points: number[] }) {
  const W = 120, H = 36;
  const max = Math.max(...points), min = Math.min(...points);
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * (W - 4) + 2;
      const y = H - 2 - ((v - min) / (max - min || 1)) * (H - 6);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80" />
    </svg>
  );
}

function Donut({ value, label }: { value: number; label: string }) {
  const R = 36, C = 2 * Math.PI * R, pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={R} stroke="currentColor" strokeWidth="10" className="opacity-15 fill-none" />
        <circle
          cx="45" cy="45" r={R} stroke="currentColor" strokeWidth="10" className="fill-none"
          strokeDasharray={`${(pct / 100) * C} ${C}`} strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" className="text-sm font-semibold fill-current">{pct}%</text>
      </svg>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}


// ====== page ======
function EcomDashboardContent() {
  const { t, language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leadsStats, setLeadsStats] = useState<any>(null);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    // Only fetch data if user is authenticated and ownerUid is available
    if (!ownerUid || authLoading) return;

    // Fetch jobs and summary with ownerUid
    safeFetchJobsSummary(`/api/jobs/summary?ownerUid=${ownerUid}`, { credentials: 'include' }).then(setSummary);
    safeFetchJobs(`/api/jobs?limit=6&ownerUid=${ownerUid}`, { credentials: 'include' }).then(setJobs);
    
    // Fetch comprehensive leads statistics
    if (ownerUid) {
      fetch(`/api/leads/stats?ownerUid=${ownerUid}`, { credentials: 'include' })
        .then(r => r.json())
        .then(setLeadsStats)
        .catch(err => {
          console.error('Failed to fetch lead stats:', err);
          // Fallback to basic count
          fetch('/webapi/leads/list?limit=1', { credentials: 'include' })
            .then(r => r.json())
            .then(data => setLeadsStats({ totalLeads: data?.totalCount || data?.items?.length || 0 }))
            .catch(() => {});
        });
    }
    
    // Try to get user info (simplified approach)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // userName is already computed from user object, no need to set it separately
      } catch {}
    }
  }, [ownerUid, authLoading]);

  // Dynamic KPIs with real lead data
  const kpis = [
    {
      label: language === 'he' ? 'לידים חמים' : 'Hot Leads',
      value: String(leadsStats?.stats?.byScore?.HOT || 0),
      trend: [5, 8, 12, 15, 18, 22, leadsStats?.stats?.byScore?.HOT || 0]
    },
    {
      label: language === 'he' ? 'לידים חדשים' : 'New Leads',
      value: String(leadsStats?.stats?.byStatus?.NEW || 0),
      trend: [10, 12, 9, 15, 18, 20, leadsStats?.stats?.byStatus?.NEW || 0]
    },
    {
      label: language === 'he' ? 'סה"כ לידים' : 'Total Leads',
      value: String(leadsStats?.stats?.summary?.total || 0),
      trend: [45, 52, 58, 63, 68, 72, leadsStats?.stats?.summary?.total || 0]
    },
    {
      label: language === 'he' ? 'שיעור הכשרה' : 'Conversion Rate',
      value: `${leadsStats?.stats?.summary?.conversionRate || '0.0'}%`,
      trend: [1.2, 1.8, 2.1, 2.4, 2.8, 3.2, parseFloat(leadsStats?.stats?.summary?.conversionRate || '0')]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] animate-fade-in">
      
      {/* Enhanced Professional Hero Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />
        {/* Enhanced background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-8 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="container-lg relative z-10">
          <div className="text-center stack-lg">
            <div className="stack-md">
              <h1 className="text-display-2 md:text-display-1 text-white font-bold animate-fade-in">
                {language === 'he' ? `שלום ${userName}!` : `Good morning, ${userName}!`}
              </h1>
              <p className="text-body-large text-white/90 animate-fade-in max-w-4xl mx-auto leading-relaxed">
                {language === 'he'
                  ? `יש לך ${summary?.csvsGenerated ?? 0} קבצי CSV שנוצרו ו-${summary?.success ?? 0} עבודות שהושלמו בהצלחה.`
                  : `You have ${summary?.csvsGenerated ?? 0} CSVs generated and ${summary?.success ?? 0} successful jobs completed.`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <a
              href="/dashboard/e-commerce/shopify-csv"
              className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 animate-fade-in hover-lift btn-ripple relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {language === 'he' ? 'סקירת CSVs' : 'Review CSVs'}
              </span>
            </a>
            <a
              href="/dashboard/e-commerce/leads"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 animate-fade-in hover-lift btn-ripple relative overflow-hidden hover:bg-white/10"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {language === 'he' ? 'פתח לידים' : 'Open Leads'}
              </span>
            </a>
            <a
              href="/dashboard/e-commerce/shopify-csv"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 animate-fade-in hover-lift btn-ripple relative overflow-hidden hover:from-blue-700 hover:to-blue-800"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {language === 'he' ? 'הוסף מוצרים' : 'Add Products'}
              </span>
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700" />
            </a>
          </div>
        </div>
      </section>
      
      {/* Enhanced Main Content with Professional Layout */}
      <div className="section-lg relative z-10">
        <div className="container-lg">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* ===== Enhanced Professional Sidebar ===== */}
            <aside className="hidden lg:block col-span-3">
              <div className="sticky top-8 stack-lg">
                {/* Enhanced Navigation Card */}
                <UniversalCard variant="default" className="card-floating bg-white/98 backdrop-blur-md border border-gray-200/60 hover:border-blue-200/60 transition-all duration-500 dark:bg-[#1A2942] dark:border-[#2979FF]/20">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white grid place-items-center font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
                        E
                      </div>
                      <div className="stack-sm">
                        <h3 className="text-heading-4 text-gray-900 dark:text-white">EFFINITY</h3>
                        <p className="text-caption text-gray-500 dark:text-gray-400">All-in-One Platform</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="px-6 pb-6">
                    <nav className="stack-sm">
                      <a className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300" href="/dashboard/e-commerce/dashboard">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        {language === 'he' ? 'דשבורד' : 'Dashboard'}
                      </a>
                      <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-700 hover:shadow-md transition-all duration-300 transform hover:translate-x-2 hover:scale-105" href="/dashboard/e-commerce/shopify-csv">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Shopify CSV
                      </a>
                      <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1" href="/dashboard/e-commerce/leads">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {language === 'he' ? 'לידים' : 'Leads'}
                      </a>
                      <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1" href="/dashboard/e-commerce/campaigns">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                        </svg>
                        {language === 'he' ? 'קמפיינים' : 'Campaigns'}
                      </a>
                    </nav>
                  </CardBody>
                </UniversalCard>

                {/* Enhanced AI Tip Card */}
                <UniversalCard variant="default" className="card-elevated bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border border-blue-200/80 hover:border-blue-300/80 hover:shadow-xl transition-all duration-500 group dark:from-blue-900/20 dark:via-blue-900/20 dark:to-blue-900/30 dark:border-[#2979FF]/30">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="stack-sm">
                        <div className="text-heading-6 text-blue-800 group-hover:text-blue-900 transition-colors dark:text-blue-300 dark:group-hover:text-blue-200">
                          {language === 'he' ? 'טיפ AI' : 'AI Tip'}
                        </div>
                        <div className="text-body-small text-blue-700 group-hover:text-blue-800 leading-relaxed transition-colors dark:text-blue-400 dark:group-hover:text-blue-300">
                          {language === 'he'
                            ? 'העלה ZIP ויצרנו כותרות ותיאורים אוטומטית באמצעות AI'
                            : 'Upload a ZIP and auto-generate titles & descriptions with AI'
                          }
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </UniversalCard>
              </div>
            </aside>

            {/* ===== Enhanced Main Content ===== */}
            <main className="col-span-12 lg:col-span-7">
              {/* Enhanced top bar */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                  <input
                placeholder={language === 'he' ? 'חיפוש מוצרים, עבודות, לידים...' : 'Search products, jobs, leads…'}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <a href="/dashboard/e-commerce/shopify-csv" className="h-11 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center">
              + {language === 'he' ? 'הוסף חדש' : 'Add New'}
            </a>
          </div>

          {/* Enhanced hero card */}
          <div className="card-hero bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-8 mb-10 relative overflow-hidden group">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-blue-300 rounded-full blur-2xl animate-float" />
            </div>

            <div className="relative z-10 stack-md">
              <div className="text-heading-3 font-bold group-hover:scale-105 transition-transform duration-300">
                {language === 'he' ? `שלום ${userName}!` : `Good morning, ${userName}!`}
              </div>
              <p className="text-body-base text-white/90 leading-relaxed">
                {language === 'he'
                  ? `יש לך ${summary?.csvsGenerated ?? 0} קבצי CSV שנוצרו ו-${summary?.success ?? 0} עבודות שהושלמו בהצלחה.`
                  : `You have ${summary?.csvsGenerated ?? 0} CSVs generated and ${summary?.success ?? 0} successful jobs.`
                }
              </p>
              <div className="flex gap-4 pt-2">
                <a href="/dashboard/e-commerce/shopify-csv" className="btn-secondary bg-white text-blue-700 hover:bg-gray-50 font-semibold">
                  {language === 'he' ? 'סקירת CSVs' : 'Review CSVs'}
                </a>
                <a href="/dashboard/e-commerce/leads" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                  {language === 'he' ? 'פתח לידים' : 'Open Leads'}
                </a>
              </div>
            </div>
          </div>

          {/* Enhanced KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((k, index) => (
              <UniversalCard
                key={k.label}
                variant="default"
                hoverable
                className="group shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardBody className="p-6 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors dark:text-gray-400">{k.label}</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold mt-1 text-gray-900 group-hover:text-blue-700 transition-colors dark:text-white dark:group-hover:text-blue-400">{k.value}</div>
                  <div className="mt-3 text-blue-600 group-hover:text-blue-700 transition-colors">
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <Sparkline points={k.trend} />
                    </div>
                  </div>
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10 dark:from-blue-900/20 dark:to-transparent" />
                </CardBody>
              </UniversalCard>
            ))}
          </div>

          {/* Enhanced quick actions */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <a href="/dashboard/e-commerce/shopify-csv" className="group rounded-2xl bg-white border border-black/5 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 card-hover animate-fade-in">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 text-blue-700 group-hover:text-blue-800 grid place-items-center mb-2 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="font-medium group-hover:text-blue-700 transition-colors">{language === 'he' ? 'העלאת ZIP → CSV' : 'Upload ZIP → CSV'}</div>
              <div className="text-xs opacity-70 group-hover:opacity-90 transition-opacity">{language === 'he' ? 'כותרות ותגיות אוטומטיות באמצעות AI' : 'Auto titles/tags with AI'}</div>
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10" />
            </a>
            <a href="/dashboard/e-commerce/shopify-csv" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'יצירת תוכן' : 'Generate Copy'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'כותרות SEO ותיאורים' : 'SEO titles & descriptions'}</div>
            </a>
            <a href="/dashboard/e-commerce/leads" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'תיבת לידים' : 'Leads Inbox'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'ציון + תיוג + מענה' : 'Score + tag + reply'}</div>
            </a>
            <a href="/dashboard/e-commerce/jobs" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'היסטוריית עבודות' : 'Jobs History'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'סטטוס, לוגים, ניסיון נוסף' : 'Status, logs, retry'}</div>
            </a>
            <a href="/dashboard/e-commerce/campaigns" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-pink-600/10 text-pink-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'קמפיינים' : 'Campaigns'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'יצירה וניהול קמפיינים פרסומיים' : 'Create & manage ad campaigns'}</div>
            </a>
          </div>

          {/* progress / jobs table */}
          <UniversalCard variant="default">
            <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2979FF]/20">
              <div className="font-semibold text-gray-900 dark:text-white">{language === 'he' ? 'עבודות אחרונות' : 'Recent Jobs'}</div>
              <a href="/dashboard/e-commerce/jobs" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{language === 'he' ? 'הצג הכל' : 'View all'}</a>
            </CardHeader>
            <CardBody className="overflow-hidden">
              <div className="overflow-x-auto">
                <UniversalTable>
                  <UniversalTableHeader>
                    <UniversalTableRow>
                      <UniversalTableHead>ID</UniversalTableHead>
                      <UniversalTableHead>Type</UniversalTableHead>
                      <UniversalTableHead>Status</UniversalTableHead>
                      <UniversalTableHead>Created</UniversalTableHead>
                      <UniversalTableHead>Images</UniversalTableHead>
                      <UniversalTableHead>Action</UniversalTableHead>
                    </UniversalTableRow>
                  </UniversalTableHeader>
                  <UniversalTableBody>
                    {Array.isArray(jobs) ? jobs.map((r) => (
                      <UniversalTableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2942]/50">
                        <UniversalTableCell className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{r.id}</UniversalTableCell>
                        <UniversalTableCell className="text-gray-900 dark:text-gray-100">{r.type ?? '-'}</UniversalTableCell>
                        <UniversalTableCell>
                          <StatusBadge
                            status={
                              r.status === 'SUCCESS' || r.status === 'COMPLETED' ? 'completed' :
                              r.status === 'FAILED' ? 'failed' :
                              r.status === 'RUNNING' ? 'active' :
                              r.status === 'PENDING' ? 'pending' : 'pending'
                            }
                          />
                        </UniversalTableCell>
                        <UniversalTableCell className="text-gray-600 dark:text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</UniversalTableCell>
                        <UniversalTableCell className="text-gray-600 dark:text-gray-400">{r.metrics?.images ?? ''}</UniversalTableCell>
                        <UniversalTableCell>
                          {(r.status === 'SUCCESS' || r.status === 'COMPLETED') && r.type === 'shopify_csv'
                            ? <a className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300" href={`/api/jobs/${r.id}/output`}>{language === 'he' ? 'הורד CSV' : 'Download CSV'}</a>
                            : <span className="text-gray-400">—</span>}
                        </UniversalTableCell>
                      </UniversalTableRow>
                    )) : []}
                    {!Array.isArray(jobs) || jobs.length === 0 ? (
                      <UniversalTableRow>
                        <UniversalTableCell className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                          {language === 'he' ? 'אין עדיין עבודות — העלה ZIP כדי להתחיל' : 'No jobs yet — upload a ZIP to get started'}
                        </UniversalTableCell>
                      </UniversalTableRow>
                    ) : null}
                  </UniversalTableBody>
                </UniversalTable>
              </div>
            </CardBody>
          </UniversalCard>

          {/* Leads Overview Widget */}
          {leadsStats && (
            <UniversalCard variant="default" className="mt-6">
              <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2979FF]/20">
                <div className="font-semibold text-gray-900 dark:text-white">{language === 'he' ? 'סקירת לידים' : 'Leads Overview'}</div>
                <a href="/dashboard/e-commerce/leads" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{language === 'he' ? 'הצג הכל' : 'View all'}</a>
              </CardHeader>

              <CardBody className="p-4">
                {/* Score Distribution */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{language === 'he' ? 'חלוקה לפי ציון' : 'Score Distribution'}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <span className="text-red-600 font-semibold">{leadsStats.stats?.byScore?.HOT || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'חמים' : 'Hot'}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2">
                        <span className="text-orange-600 font-semibold">{leadsStats.stats?.byScore?.WARM || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'פושרים' : 'Warm'}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <span className="text-blue-600 font-semibold">{leadsStats.stats?.byScore?.COLD || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'קרים' : 'Cold'}</div>
                    </div>
                  </div>
                </div>

                {/* Source Breakdown */}
                {leadsStats.stats?.bySource && Object.keys(leadsStats.stats.bySource).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{language === 'he' ? 'מקורות לידים' : 'Lead Sources'}</h4>
                    <div className="space-y-2">
                      {Object.entries(leadsStats.stats.bySource).map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {source === 'FACEBOOK' && 'Facebook'}
                            {source === 'INSTAGRAM' && 'Instagram'}
                            {source === 'WHATSAPP' && 'WhatsApp'}
                            {source === 'CSV_UPLOAD' && 'CSV Import'}
                            {source === 'GOOGLE_SHEETS' && 'Google Sheets'}
                            {source === 'MANUAL' && (language === 'he' ? 'ידני' : 'Manual')}
                            {source === 'OTHER' && (language === 'he' ? 'אחר' : 'Other')}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <UniversalButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = '/dashboard/e-commerce/leads'}
                  >
                    {language === 'he' ? 'נהל לידים' : 'Manage Leads'}
                  </UniversalButton>
                  <UniversalButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    onClick={() => window.location.href = '/dashboard/e-commerce/leads/intake'}
                  >
                    {language === 'he' ? 'ייבא לידים' : 'Import Leads'}
                  </UniversalButton>
                </div>
              </CardBody>
            </UniversalCard>
              )}
            </main>

            {/* ===== right rail ===== */}
            <aside className="col-span-12 md:col-span-3">
              <div className="sticky top-6 space-y-4">
                <UniversalCard variant="default">
                  <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{userName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'בעל חנות' : 'Store owner'}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'חמים' : 'Hot'}</div>
                      <div className="font-semibold text-red-600 dark:text-red-400">{leadsStats?.stats?.byScore?.HOT || 0}</div>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-3 dark:bg-orange-900/20">
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'פושרים' : 'Warm'}</div>
                      <div className="font-semibold text-orange-600 dark:text-orange-400">{leadsStats?.stats?.byScore?.WARM || 0}</div>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'קרים' : 'Cold'}</div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">{leadsStats?.stats?.byScore?.COLD || 0}</div>
                    </div>
                    <div className="rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'he' ? 'מוכשרים' : 'Qualified'}</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{leadsStats?.stats?.byStatus?.QUALIFIED || 0}</div>
                    </div>
                  </div>
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="default">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{language === 'he' ? 'יעילות' : 'Efficiency'}</div>
                    </div>
                    <Donut value={68} label={language === 'he' ? 'מגמת שוליים (הערכה)' : 'Contribution margin trend (est.)'} />
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="default">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{language === 'he' ? 'פעילות אחרונה' : 'Recent activities'}</div>
                    </div>
                    <ul className="text-sm space-y-2">
                      {leadsStats?.stats?.byStatus?.NEW > 0 && (
                        <li className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                          <span>{language === 'he' ? `${leadsStats.stats.byStatus.NEW} לידים חדשים` : `${leadsStats.stats.byStatus.NEW} new leads`}</span>
                          <span className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'היום' : 'Today'}</span>
                        </li>
                      )}
                      {leadsStats?.stats?.byScore?.HOT > 0 && (
                        <li className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                          <span>{language === 'he' ? `${leadsStats.stats.byScore.HOT} לידים חמים זמינים` : `${leadsStats.stats.byScore.HOT} hot leads available`}</span>
                          <span className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'לפעולה' : 'Action needed'}</span>
                        </li>
                      )}
                      {leadsStats?.stats?.summary?.conversionRate && parseFloat(leadsStats.stats.summary.conversionRate) > 0 && (
                        <li className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                          <span>{language === 'he' ? `${leadsStats.stats.summary.conversionRate}% שיעור המרה` : `${leadsStats.stats.summary.conversionRate}% conversion rate`}</span>
                          <span className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'כללי' : 'Overall'}</span>
                        </li>
                      )}
                      <li className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                        <span>{language === 'he' ? 'ייצוא CSV הושלם' : 'CSV export completed'}</span>
                        <span className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'לפני 3 דקות' : '3m ago'}</span>
                      </li>
                    </ul>
                  </CardBody>
                </UniversalCard>
          </div>
        </aside>
      </div>
    </div>
  </div>

      {/* AI Personal Coach Integration */}
      {ownerUid && (
        <AiCoachIntegration
          ownerUid={ownerUid}
          organizationId={ownerUid}
          enableProactive={true}
          enableChat={true}
        />
      )}
    </div>
  );
}

export default function EcomDashboard() {
  return (
    <LanguageProvider>
      <AiCoachProvider>
        <EcomDashboardContent />
      </AiCoachProvider>
    </LanguageProvider>
  );
}
