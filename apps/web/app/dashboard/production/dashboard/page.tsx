'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { EffinityHeader } from '@/components/effinity-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

// Mini chart component for KPIs
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

function ProductionDashboardContent() {
  const { t, language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    // Only fetch data if user is authenticated and ownerUid is available
    if (!ownerUid || authLoading) return;

    // Fetch production stats (mock data for now)
    setStats({
      totalProjects: 3,
      activeProjects: 2,
      completedTasks: 24,
      upcomingDeadlines: 5,
      teamMembers: 4,
      totalBudget: 85000,
      usedBudget: 62000
    });
  }, [ownerUid, authLoading]);

  // Dynamic KPIs for Production
  const kpis = [
    {
      label: language === 'he' ? 'פרויקטים פעילים' : 'Active Projects',
      value: String(stats?.activeProjects || 0),
      trend: [1, 2, 3, 2, 2, 3, stats?.activeProjects || 0]
    },
    {
      label: language === 'he' ? 'משימות הושלמו' : 'Tasks Completed',
      value: String(stats?.completedTasks || 0),
      trend: [15, 18, 20, 22, 23, 24, stats?.completedTasks || 0]
    },
    {
      label: language === 'he' ? 'דדליינים קרובים' : 'Upcoming Deadlines',
      value: String(stats?.upcomingDeadlines || 0),
      trend: [8, 7, 6, 5, 5, 4, stats?.upcomingDeadlines || 0]
    },
    {
      label: language === 'he' ? 'תקציב בשימוש' : 'Budget Used',
      value: `${Math.round(((stats?.usedBudget || 0) / (stats?.totalBudget || 1)) * 100)}%`,
      trend: [45, 52, 58, 63, 68, 72, Math.round(((stats?.usedBudget || 0) / (stats?.totalBudget || 1)) * 100)]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-gray-50 animate-fade-in">
      {/* EFFINITY Header with Production Gradient */}
      <EffinityHeader
        variant="dashboard"
        className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-xl border-0"
      />

      {/* Professional Hero Section */}
      <section className="relative px-6 py-16 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-80 h-80 bg-purple-200 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4 animate-fade-in">
              {language === 'he' ? `שלום ${userName}!` : `Good morning, ${userName}!`}
            </h1>
            <p className="text-xl opacity-90 animate-fade-in max-w-3xl mx-auto">
              {language === 'he'
                ? `יש לך ${stats?.activeProjects || 0} פרויקטים פעילים ו-${stats?.upcomingDeadlines || 0} דדליינים קרובים.`
                : `You have ${stats?.activeProjects || 0} active projects and ${stats?.upcomingDeadlines || 0} upcoming deadlines.`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard/production/projects"
              className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              {language === 'he' ? 'נהל פרויקטים' : 'Manage Projects'}
            </a>
            <a
              href="/dashboard/production/suppliers"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              {language === 'he' ? 'ספקים' : 'Suppliers'}
            </a>
            <a
              href="/dashboard/production/projects"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              + {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
        {/* ===== Professional Sidebar ===== */}
        <aside className="hidden lg:block col-span-3">
          <div className="sticky top-6 space-y-6">
            {/* Navigation Card */}
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white grid place-items-center font-semibold text-lg shadow-lg">
                    P
                  </div>
                  <CardTitle className="text-gray-900 text-lg">PRODUCTION</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-2">
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg transform hover:-translate-y-1 transition-all duration-200" href="/dashboard/production/dashboard">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    {language === 'he' ? 'דשבורד' : 'Dashboard'}
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 transform hover:translate-x-1" href="/dashboard/production/projects">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {language === 'he' ? 'פרויקטים' : 'Projects'}
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 transform hover:translate-x-1" href="/dashboard/production/suppliers">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {language === 'he' ? 'ספקים' : 'Suppliers'}
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-normal hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 transform hover:translate-x-1" href="/dashboard/production/team">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    {language === 'he' ? 'צוות' : 'Team'}
                  </a>
                </nav>
              </CardContent>
            </Card>

            {/* Production Tip Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-800 mb-2 text-sm">{language === 'he' ? 'טיפ הפקה' : 'Production Tip'}</div>
                    <div className="text-purple-700 text-sm leading-relaxed">
                      {language === 'he'
                        ? 'השתמש בתבניות משימות כדי לזרז הקמת פרויקטים חדשים'
                        : 'Use task templates to speed up new project setup'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* ===== main ===== */}
        <main className="col-span-12 lg:col-span-9">
          {/* Search bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <input
                placeholder={language === 'he' ? 'חיפוש פרויקטים, משימות, ספקים...' : 'Search projects, tasks, suppliers…'}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors"
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <a href="/dashboard/production/projects" className="h-11 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center">
              + {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </a>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-normal text-gray-500">{k.label}</div>
                <div className="text-2xl font-semibold mt-1 text-gray-900">{k.value}</div>
                <div className="mt-2 text-purple-600">
                  <Sparkline points={k.trend} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <a href="/dashboard/production/projects" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-purple-600/10 text-purple-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'ניהול פרויקטים' : 'Manage Projects'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'צפה וערוך פרויקטים פעילים' : 'View and edit active projects'}</div>
            </a>

            <a href="/dashboard/production/suppliers" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'ספקים' : 'Suppliers'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'נהל רשימת ספקים ודירוגים' : 'Manage supplier list and ratings'}</div>
            </a>

            <a href="/dashboard/production/team" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'צוות' : 'Team'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'נהל חברי צוות והרשאות' : 'Manage team members and permissions'}</div>
            </a>

            <a href="/dashboard/production/projects" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 grid place-items-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="font-medium">{language === 'he' ? 'תקציב' : 'Budget'}</div>
              <div className="text-xs opacity-70">{language === 'he' ? 'מעקב תקציב ועלויות' : 'Track budget and costs'}</div>
            </a>
          </div>

          {/* Recent Projects */}
          <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div className="font-semibold text-gray-900">{language === 'he' ? 'פרויקטים אחרונים' : 'Recent Projects'}</div>
              <a href="/dashboard/production/projects" className="text-sm text-gray-600 hover:text-gray-900">{language === 'he' ? 'הצג הכל' : 'View all'}</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs opacity-60">
                    <th className="px-4 py-2">{language === 'he' ? 'פרויקט' : 'Project'}</th>
                    <th className="px-4 py-2">{language === 'he' ? 'סוג' : 'Type'}</th>
                    <th className="px-4 py-2">{language === 'he' ? 'סטטוס' : 'Status'}</th>
                    <th className="px-4 py-2">{language === 'he' ? 'דדליין' : 'Deadline'}</th>
                    <th className="px-4 py-2">{language === 'he' ? 'תקציב' : 'Budget'}</th>
                    <th className="px-4 py-2">{language === 'he' ? 'פעולות' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900 font-medium">Tech Conference 2024</td>
                    <td className="px-4 py-2 text-gray-600">CONFERENCE</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">ACTIVE</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">Dec 15, 2024</td>
                    <td className="px-4 py-2 text-gray-600">$35,000</td>
                    <td className="px-4 py-2">
                      <a className="text-purple-600 hover:text-purple-700 hover:underline" href="/dashboard/production/projects/1">{language === 'he' ? 'צפה' : 'View'}</a>
                    </td>
                  </tr>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900 font-medium">Product Launch Event</td>
                    <td className="px-4 py-2 text-gray-600">SHOW</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">PLANNING</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">Jan 20, 2025</td>
                    <td className="px-4 py-2 text-gray-600">$50,000</td>
                    <td className="px-4 py-2">
                      <a className="text-purple-600 hover:text-purple-700 hover:underline" href="/dashboard/production/projects/2">{language === 'he' ? 'צפה' : 'View'}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductionDashboard() {
  return (
    <LanguageProvider>
      <ProductionDashboardContent />
    </LanguageProvider>
  );
}