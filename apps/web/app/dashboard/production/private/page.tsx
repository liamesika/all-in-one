'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function ProductionPrivateDashboardContent() {
  const { t, language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [freelancerStats, setFreelancerStats] = useState<any>(null);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Freelancer';

  useEffect(() => {
    if (!ownerUid || authLoading) return;

    // Fetch freelancer-specific stats (mock data for now)
    setFreelancerStats({
      activeProjects: 3,
      completedProjects: 12,
      totalEarnings: 85000,
      monthlyEarnings: 12000,
      upcomingDeadlines: 4,
      hoursThisMonth: 120,
      avgHourlyRate: 100,
      clientRating: 4.9,
      tasksCompleted: 45,
      pendingInvoices: 2
    });
  }, [ownerUid, authLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-gray-50">
      {/* Header */}

      {/* Freelancer Overview Hero */}
      <section className="relative px-6 py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-80 h-80 bg-indigo-200 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              {language === 'he' ? `דשבורד עצמאי - ${userName}` : `Freelancer Dashboard - ${userName}`}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {language === 'he'
                ? `${freelancerStats?.activeProjects || 0} פרויקטים פעילים, הכנסה חודשית של $${freelancerStats?.monthlyEarnings?.toLocaleString() || 0} ודירוג לקוח של ${freelancerStats?.clientRating || 0}/5`
                : `${freelancerStats?.activeProjects || 0} active projects, monthly earnings of $${freelancerStats?.monthlyEarnings?.toLocaleString() || 0} with ${freelancerStats?.clientRating || 0}/5 client rating`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard/production/projects"
              className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {language === 'he' ? 'הפרויקטים שלי' : 'My Projects'}
            </a>
            <a
              href="/dashboard/production/suppliers"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {language === 'he' ? 'הספקים שלי' : 'My Suppliers'}
            </a>
            <a
              href="/dashboard/production/projects"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              + {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Freelancer KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'הכנסה חודשית' : 'Monthly Earnings'}</p>
                  <p className="text-2xl font-semibold text-gray-900">${freelancerStats?.monthlyEarnings?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'פרויקטים פעילים' : 'Active Projects'}</p>
                  <p className="text-2xl font-semibold text-gray-900">{freelancerStats?.activeProjects || 0}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'שעות החודש' : 'Hours This Month'}</p>
                  <p className="text-2xl font-semibold text-gray-900">{freelancerStats?.hoursThisMonth || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'דירוג לקוח' : 'Client Rating'}</p>
                  <p className="text-2xl font-semibold text-gray-900">{freelancerStats?.clientRating || 0}/5</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Freelancer Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Projects */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{language === 'he' ? 'הפרויקטים שלי' : 'My Projects'}</CardTitle>
                <a href="/dashboard/production/projects" className="text-indigo-600 text-sm hover:underline">{language === 'he' ? 'הצג הכל' : 'View All'}</a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Tech Conference 2024</p>
                    <p className="text-sm text-gray-600">CONFERENCE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">Dec 15</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">ACTIVE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Product Launch Event</p>
                    <p className="text-sm text-gray-600">SHOW</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">Jan 20</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">PLANNING</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Corporate Video</p>
                    <p className="text-sm text-gray-600">FILMING</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">Nov 30</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">ON_HOLD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings & Finance */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{language === 'he' ? 'הכנסות וכספים' : 'Earnings & Finance'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'סה"כ הכנסות השנה' : 'Total Earnings This Year'}</span>
                  <span className="text-lg font-semibold text-gray-900">${freelancerStats?.totalEarnings?.toLocaleString() || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'תעריף ממוצע לשעה' : 'Average Hourly Rate'}</span>
                  <span className="text-lg font-semibold text-gray-900">${freelancerStats?.avgHourlyRate || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'חשבוניות ממתינות' : 'Pending Invoices'}</span>
                  <span className="text-lg font-semibold text-orange-600">{freelancerStats?.pendingInvoices || 0}</span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">{language === 'he' ? 'פרויקטים הושלמו' : 'Completed Projects'}</p>
                      <p className="text-xl font-semibold text-green-600">{freelancerStats?.completedProjects || 0}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">{language === 'he' ? 'משימות הושלמו' : 'Tasks Completed'}</p>
                      <p className="text-xl font-semibold text-blue-600">{freelancerStats?.tasksCompleted || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for Freelancers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="/dashboard/production/projects" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-700 grid place-items-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="font-medium">{language === 'he' ? 'פרויקט חדש' : 'New Project'}</div>
            <div className="text-xs opacity-70">{language === 'he' ? 'צור פרויקט חדש' : 'Create a new project'}</div>
          </a>

          <a href="/dashboard/production/suppliers" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-700 grid place-items-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="font-medium">{language === 'he' ? 'ספקים' : 'Suppliers'}</div>
            <div className="text-xs opacity-70">{language === 'he' ? 'נהל רשימת ספקים' : 'Manage supplier list'}</div>
          </a>

          <a href="#" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-700 grid place-items-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-medium">{language === 'he' ? 'חשבוניות' : 'Invoicing'}</div>
            <div className="text-xs opacity-70">{language === 'he' ? 'צור ושלח חשבוניות' : 'Create and send invoices'}</div>
          </a>

          <a href="#" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 grid place-items-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-medium">{language === 'he' ? 'מעקב זמן' : 'Time Tracking'}</div>
            <div className="text-xs opacity-70">{language === 'he' ? 'עקוב אחר שעות עבודה' : 'Track working hours'}</div>
          </a>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{language === 'he' ? 'דדליינים קרובים' : 'Upcoming Deadlines'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-800">Tech Conference Setup</p>
                  <p className="text-sm text-orange-600">{language === 'he' ? 'תאריך: 15 בדצמבר - בעוד 3 ימים' : 'Due: Dec 15 - in 3 days'}</p>
                </div>
                <div className="text-orange-700 font-medium text-sm">
                  {language === 'he' ? 'דחוף' : 'Urgent'}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Product Launch Planning</p>
                  <p className="text-sm text-blue-600">{language === 'he' ? 'תאריך: 20 בינואר - בעוד 5 שבועות' : 'Due: Jan 20 - in 5 weeks'}</p>
                </div>
                <div className="text-blue-700 font-medium text-sm">
                  {language === 'he' ? 'תכנון' : 'Planning'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductionPrivateDashboard() {
  return (
    <LanguageProvider>
      <ProductionPrivateDashboardContent />
    </LanguageProvider>
  );
}