'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { EffinityHeader } from '@/components/effinity-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { AiCoachProvider } from '@/lib/ai-coach-context';
import AiCoachIntegration from '@/components/ai-coach/AiCoachIntegration';

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

// ====== types ======
type Job = {
  id: string;
  type?: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  createdAt?: string;
  metrics?: { images?: number };
};

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
    fetch(`/api/jobs/summary?ownerUid=${ownerUid}`, { credentials: 'include' }).then(r => r.json()).then(setSummary).catch(() => {});
    fetch(`/api/jobs?limit=6&ownerUid=${ownerUid}`, { credentials: 'include' }).then(r => r.json()).then(setJobs).catch(() => {});
    
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-gray-50 animate-fade-in">
      {/* EFFINITY Header with Professional Gradient */}
      <EffinityHeader 
        variant="dashboard"
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl border-0"
      />
      
      {/* Professional Hero Section */}
      <section className="relative px-6 py-16 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4 animate-fade-in">
              {language === 'he' ? `שלום ${userName}!` : `Good morning, ${userName}!`}
            </h1>
            <p className="text-xl opacity-90 animate-fade-in max-w-3xl mx-auto">
              {language === 'he' 
                ? `יש לך ${summary?.csvsGenerated ?? 0} קבצי CSV שנוצרו ו-${summary?.success ?? 0} עבודות שהושלמו בהצלחה.`
                : `You have ${summary?.csvsGenerated ?? 0} CSVs generated and ${summary?.success ?? 0} successful jobs completed.`
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/e-commerce/shopify-csv" 
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              {language === 'he' ? 'סקירת CSVs' : 'Review CSVs'}
            </a>
            <a 
              href="/e-commerce/leads" 
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              {language === 'he' ? 'פתח לידים' : 'Open Leads'}
            </a>
            <a
              href="/e-commerce/shopify-csv"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              + {language === 'he' ? 'הוסף מוצרים' : 'Add Products'}
            </a>
          </div>
        </div>
      </section>
      
      {/* Main Content with Professional Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
        {/* ===== Professional Sidebar ===== */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-6 space-y-6">
            {/* Navigation Card */}
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white grid place-items-center font-semibold text-lg shadow-lg">
                    E
                  </div>
                  <CardTitle className="text-gray-900 text-lg">EFFINITY</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-2">
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg transform hover:-translate-y-1 transition-all duration-200" href="/e-commerce/dashboard">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    {language === 'he' ? 'דשבורד' : 'Dashboard'}
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1" href="/e-commerce/shopify-csv">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Shopify CSV
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1" href="/e-commerce/leads">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {language === 'he' ? 'לידים' : 'Leads'}
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1" href="/e-commerce/campaigns">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                    </svg>
                    {language === 'he' ? 'קמפיינים' : 'Campaigns'}
                  </a>
                </nav>
              </CardContent>
            </Card>
            
            {/* AI Tip Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-800 mb-2 text-sm">{language === 'he' ? 'טיפ AI' : 'AI Tip'}</div>
                    <div className="text-blue-700 text-sm leading-relaxed">
                      {language === 'he' 
                        ? 'העלה ZIP ויצרנו כותרות ותיאורים אוטומטית באמצעות AI'
                        : 'Upload a ZIP and auto-generate titles & descriptions with AI'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* ===== main ===== */}
        <main className="col-span-12 md:col-span-7">
          {/* top bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <input
                placeholder={language === 'he' ? 'חיפוש מוצרים, עבודות, לידים...' : 'Search products, jobs, leads…'}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <a href="/e-commerce/shopify-csv" className="h-11 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center">
              + {language === 'he' ? 'הוסף חדש' : 'Add New'}
            </a>
          </div>

          {/* hero */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 mb-8 shadow-xl">
            <div className="text-xl font-semibold">
              {language === 'he' ? `שלום ${userName}!` : `Good morning, ${userName}!`}
            </div>
            <p className="opacity-90 text-sm font-normal mt-2">
              {language === 'he' 
                ? `יש לך ${summary?.csvsGenerated ?? 0} קבצי CSV שנוצרו ו-${summary?.success ?? 0} עבודות שהושלמו בהצלחה.`
                : `You have ${summary?.csvsGenerated ?? 0} CSVs generated and ${summary?.success ?? 0} successful jobs.`
              }
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/e-commerce/shopify-csv" className="rounded-lg bg-white text-blue-700 px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">
                {language === 'he' ? 'סקירת CSVs' : 'Review CSVs'}
              </a>
              <a href="/e-commerce/leads" className="rounded-lg border-2 border-white/30 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors">
                {language === 'he' ? 'פתח לידים' : 'Open Leads'}
              </a>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-normal text-gray-500">{k.label}</div>
                <div className="text-2xl font-semibold mt-1 text-gray-900">{k.value}</div>
                <div className="mt-2 text-blue-600">
                  <Sparkline points={k.trend} />
                </div>
              </div>
            ))}
          </div>

          {/* quick actions */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <a href="/e-commerce/shopify-csv" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'העלאת ZIP → CSV' : 'Upload ZIP → CSV'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'כותרות ותגיות אוטומטיות באמצעות AI' : 'Auto titles/tags with AI'}</div>
            </a>
            <a href="/e-commerce/shopify-csv" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'יצירת תוכן' : 'Generate Copy'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'כותרות SEO ותיאורים' : 'SEO titles & descriptions'}</div>
            </a>
            <a href="/e-commerce/leads" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'תיבת לידים' : 'Leads Inbox'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'ציון + תיוג + מענה' : 'Score + tag + reply'}</div>
            </a>
            <a href="/e-commerce/jobs" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'היסטוריית עבודות' : 'Jobs History'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'סטטוס, לוגים, ניסיון נוסף' : 'Status, logs, retry'}</div>
            </a>
            <a href="/e-commerce/campaigns" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
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
          <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div className="font-semibold text-gray-900">{language === 'he' ? 'עבודות אחרונות' : 'Recent Jobs'}</div>
              <a href="/e-commerce/jobs" className="text-sm text-gray-600 hover:text-gray-900">{language === 'he' ? 'הצג הכל' : 'View all'}</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs opacity-60">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2">Images</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{r.id}</td>
                      <td className="px-4 py-2 text-gray-900">{r.type || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={
                          `text-xs px-2 py-1 rounded-full border font-medium ${
                            r.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' :
                            r.status === 'FAILED'  ? 'bg-red-50 text-red-700 border-red-200' :
                            r.status === 'RUNNING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                     'bg-gray-50 text-gray-700 border-gray-200'
                          }`
                        }>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
                      <td className="px-4 py-2 text-gray-600">{r.metrics?.images ?? ''}</td>
                      <td className="px-4 py-2">
                        {r.status === 'SUCCESS' && r.type === 'shopify_csv'
                          ? <a className="text-blue-600 hover:text-blue-700 hover:underline" href={`/api/jobs/${r.id}/output`}>{language === 'he' ? 'הורד CSV' : 'Download CSV'}</a>
                          : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                  {!jobs.length && (
                    <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                      {language === 'he' ? 'אין עדיין עבודות — העלה ZIP כדי להתחיל' : 'No jobs yet — upload a ZIP to get started'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leads Overview Widget */}
          {leadsStats && (
            <div className="mt-6 rounded-2xl bg-white border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="font-semibold text-gray-900">{language === 'he' ? 'סקירת לידים' : 'Leads Overview'}</div>
                <a href="/e-commerce/leads" className="text-sm text-gray-600 hover:text-gray-900">{language === 'he' ? 'הצג הכל' : 'View all'}</a>
              </div>
              
              <div className="p-4">
                {/* Score Distribution */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{language === 'he' ? 'חלוקה לפי ציון' : 'Score Distribution'}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <span className="text-red-600 font-semibold">{leadsStats.stats?.byScore?.HOT || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600">{language === 'he' ? 'חמים' : 'Hot'}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2">
                        <span className="text-orange-600 font-semibold">{leadsStats.stats?.byScore?.WARM || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600">{language === 'he' ? 'פושרים' : 'Warm'}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <span className="text-blue-600 font-semibold">{leadsStats.stats?.byScore?.COLD || 0}</span>
                      </div>
                      <div className="text-xs text-gray-600">{language === 'he' ? 'קרים' : 'Cold'}</div>
                    </div>
                  </div>
                </div>

                {/* Source Breakdown */}
                {leadsStats.stats?.bySource && Object.keys(leadsStats.stats.bySource).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{language === 'he' ? 'מקורות לידים' : 'Lead Sources'}</h4>
                    <div className="space-y-2">
                      {Object.entries(leadsStats.stats.bySource).map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {source === 'FACEBOOK' && 'Facebook'}
                            {source === 'INSTAGRAM' && 'Instagram'}
                            {source === 'WHATSAPP' && 'WhatsApp'}
                            {source === 'CSV_UPLOAD' && 'CSV Import'}
                            {source === 'GOOGLE_SHEETS' && 'Google Sheets'}
                            {source === 'MANUAL' && (language === 'he' ? 'ידני' : 'Manual')}
                            {source === 'OTHER' && (language === 'he' ? 'אחר' : 'Other')}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <a 
                    href="/e-commerce/leads" 
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center"
                  >
                    {language === 'he' ? 'נהל לידים' : 'Manage Leads'}
                  </a>
                  <a 
                    href="/e-commerce/leads/intake" 
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 text-center"
                  >
                    {language === 'he' ? 'ייבא לידים' : 'Import Leads'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ===== right rail ===== */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userName}</div>
                  <div className="text-xs text-gray-500">{language === 'he' ? 'בעל חנות' : 'Store owner'}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-red-50 p-3">
                  <div className="text-xs text-gray-600">{language === 'he' ? 'חמים' : 'Hot'}</div>
                  <div className="font-semibold text-red-600">{leadsStats?.stats?.byScore?.HOT || 0}</div>
                </div>
                <div className="rounded-xl bg-orange-50 p-3">
                  <div className="text-xs text-gray-600">{language === 'he' ? 'פושרים' : 'Warm'}</div>
                  <div className="font-semibold text-orange-600">{leadsStats?.stats?.byScore?.WARM || 0}</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="text-xs text-gray-600">{language === 'he' ? 'קרים' : 'Cold'}</div>
                  <div className="font-semibold text-blue-600">{leadsStats?.stats?.byScore?.COLD || 0}</div>
                </div>
                <div className="rounded-xl bg-green-50 p-3">
                  <div className="text-xs text-gray-600">{language === 'he' ? 'מוכשרים' : 'Qualified'}</div>
                  <div className="font-semibold text-green-600">{leadsStats?.stats?.byStatus?.QUALIFIED || 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">{language === 'he' ? 'יעילות' : 'Efficiency'}</div>
              </div>
              <Donut value={68} label={language === 'he' ? 'מגמת שוליים (הערכה)' : 'Contribution margin trend (est.)'} />
            </div>

            <div className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">{language === 'he' ? 'פעילות אחרונה' : 'Recent activities'}</div>
              </div>
              <ul className="text-sm space-y-2">
                {leadsStats?.stats?.byStatus?.NEW > 0 && (
                  <li className="flex items-center justify-between text-gray-700">
                    <span>{language === 'he' ? `${leadsStats.stats.byStatus.NEW} לידים חדשים` : `${leadsStats.stats.byStatus.NEW} new leads`}</span>
                    <span className="text-gray-500">{language === 'he' ? 'היום' : 'Today'}</span>
                  </li>
                )}
                {leadsStats?.stats?.byScore?.HOT > 0 && (
                  <li className="flex items-center justify-between text-gray-700">
                    <span>{language === 'he' ? `${leadsStats.stats.byScore.HOT} לידים חמים זמינים` : `${leadsStats.stats.byScore.HOT} hot leads available`}</span>
                    <span className="text-gray-500">{language === 'he' ? 'לפעולה' : 'Action needed'}</span>
                  </li>
                )}
                {leadsStats?.stats?.summary?.conversionRate && parseFloat(leadsStats.stats.summary.conversionRate) > 0 && (
                  <li className="flex items-center justify-between text-gray-700">
                    <span>{language === 'he' ? `${leadsStats.stats.summary.conversionRate}% שיעור המרה` : `${leadsStats.stats.summary.conversionRate}% conversion rate`}</span>
                    <span className="text-gray-500">{language === 'he' ? 'כללי' : 'Overall'}</span>
                  </li>
                )}
                <li className="flex items-center justify-between text-gray-700">
                  <span>{language === 'he' ? 'ייצוא CSV הושלם' : 'CSV export completed'}</span>
                  <span className="text-gray-500">{language === 'he' ? 'לפני 3 דקות' : '3m ago'}</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
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
