'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  CheckSquare,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingTasks: number;
  upcomingEvents: number;
}

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  client?: { name: string };
  createdAt: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
  case?: { caseNumber: string };
}

interface RecentClient {
  id: string;
  name: string;
  email: string;
  clientType: string;
  createdAt: string;
}

export function DashboardPageClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingTasks: 0,
    upcomingEvents: 0,
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      // Fetch all data in parallel
      const [casesRes, clientsRes, tasksRes, eventsRes, invoicesRes] = await Promise.all([
        fetch('/api/law/cases?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/clients?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/calendar', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/billing?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (casesRes.ok) {
        const data = await casesRes.json();
        setRecentCases(data.cases);
        setStats(prev => ({
          ...prev,
          totalCases: data.pagination?.total || data.cases.length,
          activeCases: data.cases.filter((c: RecentCase) => c.status === 'active').length,
        }));
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setRecentClients(data.clients);
        setStats(prev => ({ ...prev, totalClients: data.pagination?.total || data.clients.length }));
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        const pendingCount = data.tasks?.filter((t: any) => t.status !== 'done').length || 0;
        setStats(prev => ({ ...prev, pendingTasks: pendingCount }));
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        const now = new Date();
        const upcoming = data.events?.filter((e: any) => new Date(e.eventDate) > now) || [];
        setUpcomingEvents(upcoming.slice(0, 5));
        setStats(prev => ({ ...prev, upcomingEvents: upcoming.length }));
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        const revenue = data.invoices?.reduce((sum: number, inv: any) =>
          inv.status === 'paid' ? sum + inv.amount : sum, 0) || 0;
        setStats(prev => ({
          ...prev,
          totalInvoices: data.pagination?.total || data.invoices?.length || 0,
          totalRevenue: revenue,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: lang === 'he' ? 'תיקים פעילים' : 'Active Cases',
      value: stats.activeCases,
      total: stats.totalCases,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      link: '/dashboard/law/cases',
    },
    {
      title: lang === 'he' ? 'לקוחות' : 'Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      link: '/dashboard/law/clients',
    },
    {
      title: lang === 'he' ? 'משימות ממתינות' : 'Pending Tasks',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
      link: '/dashboard/law/tasks',
    },
    {
      title: lang === 'he' ? 'אירועים קרובים' : 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: CalendarIcon,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      link: '/dashboard/law/calendar',
    },
    {
      title: lang === 'he' ? 'הכנסות (USD)' : 'Revenue (USD)',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
      link: '/dashboard/law/billing',
    },
    {
      title: lang === 'he' ? 'חשבוניות' : 'Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
      link: '/dashboard/law/billing',
    },
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-600',
      medium: 'text-amber-600',
      high: 'text-red-600',
    };
    return colors[priority] || colors.medium;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hearing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      deadline: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      consultation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[type] || colors.meeting;
  };

  return (
    <div className="p-8 lg:p-10 min-h-screen bg-gradient-to-br from-[#0f1a2c] to-[#17223c]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {lang === 'he' ? 'לוח בקרה' : 'Dashboard'}
        </h1>
        <p className="text-gray-300">
          {lang === 'he' ? 'מבט כללי על משרד עורכי הדין' : 'Law office overview'}
        </p>
      </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card) => (
                  <UniversalCard
                    key={card.title}
                    variant="elevated"
                    className="cursor-pointer bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
                    onClick={() => router.push(card.link)}
                  >
                    <CardBody className="p-5 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                          <p className="text-2xl font-bold text-white">
                            {typeof card.value === 'string' ? card.value : card.value}
                            {card.total && <span className="text-sm text-gray-400 ml-2">/ {card.total}</span>}
                          </p>
                        </div>
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.color}`}>
                          <card.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </CardBody>
                  </UniversalCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <UniversalCard variant="elevated" className="bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
                  <CardHeader className="p-5 sm:p-6 md:p-7 pb-0">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <h3 className="text-lg font-semibold text-white">{lang === 'he' ? 'תיקים אחרונים' : 'Recent Cases'}</h3>
                      <UniversalButton
                        variant="secondary"
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl px-4 py-2 transition-all ml-auto"
                        onClick={() => router.push('/dashboard/law/cases')}
                      >
                        {lang === 'he' ? 'הכל' : 'View All'}
                      </UniversalButton>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 sm:p-6 md:p-7">
                    {recentCases.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{lang === 'he' ? 'אין תיקים' : 'No cases'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {recentCases.map((caseItem) => (
                          <div
                            key={caseItem.id}
                            className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#2a4a7a]/30 cursor-pointer transition-all duration-300"
                            onClick={() => router.push(`/dashboard/law/cases/${caseItem.id}`)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-blue-400">
                                  {caseItem.caseNumber}
                                </span>
                                <AlertCircle className={`w-4 h-4 ${getPriorityColor(caseItem.priority)}`} />
                              </div>
                              <p className="font-medium text-sm text-white">{caseItem.title}</p>
                              {caseItem.client && (
                                <p className="text-xs text-gray-400">{caseItem.client.name}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="elevated" className="bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
                  <CardHeader className="p-5 sm:p-6 md:p-7 pb-0">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <h3 className="text-lg font-semibold text-white">{lang === 'he' ? 'אירועים קרובים' : 'Upcoming Events'}</h3>
                      <UniversalButton
                        variant="secondary"
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl px-4 py-2 transition-all ml-auto"
                        onClick={() => router.push('/dashboard/law/calendar')}
                      >
                        {lang === 'he' ? 'הכל' : 'View All'}
                      </UniversalButton>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 sm:p-6 md:p-7">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{lang === 'he' ? 'אין אירועים' : 'No events'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 p-4 border border-white/10 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#2a4a7a]/30 transition-all duration-300"
                          >
                            <div className="flex-shrink-0">
                              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${getEventTypeColor(event.eventType)}`}>
                                <CalendarIcon className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white">{event.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(event.eventDate).toLocaleString()}</span>
                              </div>
                              {event.case && (
                                <p className="text-xs text-blue-400 mt-1">
                                  {event.case.caseNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </UniversalCard>
              </div>

              <UniversalCard variant="elevated" className="bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
                <CardHeader className="p-5 sm:p-6 md:p-7 pb-0">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-lg font-semibold text-white">{lang === 'he' ? 'לקוחות אחרונים' : 'Recent Clients'}</h3>
                    <UniversalButton
                      variant="secondary"
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl px-4 py-2 transition-all ml-auto"
                      onClick={() => router.push('/dashboard/law/clients')}
                    >
                      {lang === 'he' ? 'הכל' : 'View All'}
                    </UniversalButton>
                  </div>
                </CardHeader>
                <CardBody className="p-5 sm:p-6 md:p-7">
                  {recentClients.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{lang === 'he' ? 'אין לקוחות' : 'No clients'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-3 p-4 border border-white/10 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#2a4a7a]/30 cursor-pointer transition-all duration-300"
                          onClick={() => router.push(`/dashboard/law/clients/${client.id}`)}
                        >
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-full">
                              <Users className="w-5 h-5 text-amber-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{client.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </UniversalCard>
            </>
          )}
    </div>
  );
}
