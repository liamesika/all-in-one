'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { EffinityHeader } from '@/components/effinity-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function ProductionCompanyDashboardContent() {
  const { t, language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [companyStats, setCompanyStats] = useState<any>(null);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    if (!ownerUid || authLoading) return;

    // Fetch company-specific stats (mock data for now)
    setCompanyStats({
      totalProjects: 12,
      activeProjects: 8,
      teamMembers: 15,
      totalRevenue: 450000,
      monthlyRevenue: 75000,
      completedProjects: 4,
      avgProjectValue: 37500,
      clientSatisfaction: 4.8,
      upcomingDeadlines: 7,
      overdueTask: 2
    });
  }, [ownerUid, authLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-gray-50">
      {/* Header */}
      <EffinityHeader
        variant="dashboard"
        className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-xl border-0"
      />

      {/* Company Overview Hero */}
      <section className="relative px-6 py-16 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-80 h-80 bg-purple-200 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              {language === 'he' ? `דשבורד חברה - ${userName}` : `Company Dashboard - ${userName}`}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {language === 'he'
                ? `ניהול ${companyStats?.teamMembers || 0} עובדים, ${companyStats?.activeProjects || 0} פרויקטים פעילים והכנסה חודשית של $${companyStats?.monthlyRevenue?.toLocaleString() || 0}`
                : `Managing ${companyStats?.teamMembers || 0} team members, ${companyStats?.activeProjects || 0} active projects with monthly revenue of $${companyStats?.monthlyRevenue?.toLocaleString() || 0}`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard/production/team"
              className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {language === 'he' ? 'נהל צוות' : 'Manage Team'}
            </a>
            <a
              href="/dashboard/production/projects"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {language === 'he' ? 'כל הפרויקטים' : 'All Projects'}
            </a>
            <a
              href="/dashboard/production/projects"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              + {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Company KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'הכנסה חודשית' : 'Monthly Revenue'}</p>
                  <p className="text-2xl font-semibold text-gray-900">${companyStats?.monthlyRevenue?.toLocaleString() || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{companyStats?.activeProjects || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600">{language === 'he' ? 'חברי צוות' : 'Team Members'}</p>
                  <p className="text-2xl font-semibold text-gray-900">{companyStats?.teamMembers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'he' ? 'שביעות רצון לקוח' : 'Client Satisfaction'}</p>
                  <p className="text-2xl font-semibold text-gray-900">{companyStats?.clientSatisfaction || 0}/5</p>
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

        {/* Company Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Team Overview */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{language === 'he' ? 'סקירת צוות' : 'Team Overview'}</CardTitle>
                <a href="/dashboard/production/team" className="text-purple-600 text-sm hover:underline">{language === 'he' ? 'הצג הכל' : 'View All'}</a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-600">{language === 'he' ? 'מנהל פרויקטים' : 'Project Manager'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">3 {language === 'he' ? 'פרויקטים' : 'Projects'}</p>
                    <p className="text-xs text-green-600">{language === 'he' ? 'פעיל' : 'Active'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 font-semibold text-sm">JS</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Jane Smith</p>
                      <p className="text-sm text-gray-600">{language === 'he' ? 'מעצבת' : 'Designer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">5 {language === 'he' ? 'פרויקטים' : 'Projects'}</p>
                    <p className="text-xs text-green-600">{language === 'he' ? 'פעיל' : 'Active'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-700 font-semibold text-sm">MB</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mike Brown</p>
                      <p className="text-sm text-gray-600">{language === 'he' ? 'טכנאי' : 'Technician'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">2 {language === 'he' ? 'פרויקטים' : 'Projects'}</p>
                    <p className="text-xs text-yellow-600">{language === 'he' ? 'עמוס' : 'Busy'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Performance */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{language === 'he' ? 'ביצועי פרויקטים' : 'Project Performance'}</CardTitle>
                <a href="/dashboard/production/projects" className="text-purple-600 text-sm hover:underline">{language === 'he' ? 'הצג הכל' : 'View All'}</a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'פרויקטים הושלמו בזמן' : 'Projects Completed On Time'}</span>
                  <span className="text-sm font-semibold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'פרויקטים בתקציב' : 'Projects Within Budget'}</span>
                  <span className="text-sm font-semibold text-blue-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'he' ? 'שביעות רצון לקוח' : 'Client Satisfaction'}</span>
                  <span className="text-sm font-semibold text-yellow-600">96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Notifications */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{language === 'he' ? 'התראות ועדכונים' : 'Alerts & Updates'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyStats?.overdueTask > 0 && (
                <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5C2.962 18.833 4.422 20.5 5.732 20.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      {language === 'he' ? `${companyStats.overdueTask} משימות פגועות` : `${companyStats.overdueTask} Overdue Tasks`}
                    </p>
                    <p className="text-sm text-red-600">
                      {language === 'he' ? 'נדרשת התערבות מיידית' : 'Immediate attention required'}
                    </p>
                  </div>
                  <a href="/dashboard/production/projects" className="text-red-700 font-medium text-sm hover:underline">
                    {language === 'he' ? 'צפה' : 'View'}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800">
                    {language === 'he' ? `${companyStats?.upcomingDeadlines || 0} דדליינים קרובים` : `${companyStats?.upcomingDeadlines || 0} Upcoming Deadlines`}
                  </p>
                  <p className="text-sm text-blue-600">
                    {language === 'he' ? 'בשבועיים הקרובים' : 'In the next 2 weeks'}
                  </p>
                </div>
                <a href="/dashboard/production/projects" className="text-blue-700 font-medium text-sm hover:underline">
                  {language === 'he' ? 'צפה' : 'View'}
                </a>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    {language === 'he' ? 'הכנסה חודשית גדלה ב-12%' : 'Monthly revenue increased by 12%'}
                  </p>
                  <p className="text-sm text-green-600">
                    {language === 'he' ? 'לעומת החודש הקודם' : 'Compared to last month'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductionCompanyDashboard() {
  return (
    <LanguageProvider>
      <ProductionCompanyDashboardContent />
    </LanguageProvider>
  );
}