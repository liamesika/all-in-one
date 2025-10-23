'use client';

/**
 * Law Dashboard - Redesigned with premium legal aesthetic
 * Features: KPIs, Active Cases, Tasks, Client Activity, Quick Actions
 * Mobile-first, accessible, performant
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  Clock,
  DollarSign,
  Plus,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  LawCard,
  LawCardHeader,
  LawCardTitle,
  LawCardDescription,
  LawCardContent,
  LawButton,
  CaseStatusBadge,
  PriorityBadge,
  LawDashboardKPISkeleton,
  LawEmptyState,
} from '@/components/law/shared';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { preserveUTMParams } from '@/lib/utils/utm';

interface DashboardKPI {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  attorney: string;
}

interface Task {
  id: string;
  title: string;
  caseId: string;
  caseName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface DashboardData {
  kpis: {
    activeCases: number;
    activeClients: number;
    billableHours: number;
    revenue: number;
  };
  recentCases: Case[];
  upcomingTasks: Task[];
  loading?: boolean;
}

export function NewLawDashboard({ initialData }: { initialData: DashboardData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Preserve UTM parameters
    preserveUTMParams();

    // Track page view
    trackEventWithConsent('law_dashboard_view', {
      page_title: 'Law Dashboard',
      page_path: '/dashboard/law/dashboard',
      vertical: 'law',
    });
  }, []);

  const kpis: DashboardKPI[] = [
    {
      label: 'Active Cases',
      value: data.kpis.activeCases,
      change: '+8 this month',
      trend: 'up',
      icon: Briefcase,
      color: 'law-info',
    },
    {
      label: 'Active Clients',
      value: data.kpis.activeClients,
      change: '+5 this month',
      trend: 'up',
      icon: Users,
      color: 'law-success',
    },
    {
      label: 'Billable Hours',
      value: data.kpis.billableHours,
      change: '+12% vs last month',
      trend: 'up',
      icon: Clock,
      color: 'law-accent',
    },
    {
      label: 'Revenue (MTD)',
      value: `$${data.kpis.revenue.toLocaleString()}`,
      change: '+18% vs last month',
      trend: 'up',
      icon: DollarSign,
      color: 'law-success',
    },
  ];

  const handleQuickAction = (action: string) => {
    trackEventWithConsent('law_quick_action', {
      action,
      location: 'dashboard',
    });

    switch (action) {
      case 'new_case':
        router.push('/dashboard/law/cases/new');
        break;
      case 'new_client':
        router.push('/dashboard/law/clients/new');
        break;
      case 'new_task':
        router.push('/dashboard/law/tasks/new');
        break;
      case 'schedule_event':
        router.push('/dashboard/law/calendar?action=new');
        break;
    }
  };

  const handleCaseClick = (caseId: string) => {
    trackEventWithConsent('law_case_click', {
      caseId,
      location: 'dashboard',
    });
    router.push(`/dashboard/law/cases/${caseId}`);
  };

  return (
    <div className="law-page min-h-screen">
      {/* Page Header */}
      <div className="law-page-header mb-law-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="law-page-title">Law Dashboard</h1>
            <p className="law-page-subtitle">
              Overview of your legal practice management
            </p>
          </div>

          {/* Quick Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <LawButton
              variant="secondary"
              size="md"
              icon={<FileText size={16} />}
              onClick={() => handleQuickAction('new_case')}
            >
              New Case
            </LawButton>
            <LawButton
              variant="secondary"
              size="md"
              icon={<Users size={16} />}
              onClick={() => handleQuickAction('new_client')}
            >
              New Client
            </LawButton>
            <LawButton
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => handleQuickAction('schedule_event')}
            >
              Schedule Event
            </LawButton>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-law-4 mb-law-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <LawDashboardKPISkeleton key={i} />
            ))}
          </>
        ) : (
          kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LawCard padding="md" shadow="md" hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-law-sm text-law-text-secondary font-medium mb-1">
                      {kpi.label}
                    </p>
                    <p className="text-law-3xl font-bold text-law-text-primary mb-1">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1 text-law-xs">
                      <TrendingUp
                        size={12}
                        className={`text-${kpi.trend === 'up' ? 'law-success' : 'law-error'}`}
                      />
                      <span className="text-law-text-tertiary">{kpi.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-law-lg bg-${kpi.color}-bg`}>
                    <kpi.icon className={`w-6 h-6 text-${kpi.color}`} />
                  </div>
                </div>
              </LawCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-law-6">
        {/* Recent Cases */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LawCard padding="none" shadow="md">
            <LawCardHeader className="px-law-6 pt-law-6">
              <div>
                <LawCardTitle>Recent Cases</LawCardTitle>
                <LawCardDescription>Latest active matters</LawCardDescription>
              </div>
              <LawButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/law/cases')}
              >
                View All
              </LawButton>
            </LawCardHeader>
            <LawCardContent className="px-law-6 pb-law-6">
              {data.recentCases.length === 0 ? (
                <LawEmptyState
                  title="No active cases"
                  description="Create your first case to get started"
                  action={{
                    label: 'New Case',
                    onClick: () => handleQuickAction('new_case'),
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {data.recentCases.slice(0, 5).map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="flex items-center justify-between p-3 rounded-law-md border border-law-border hover:bg-law-primary-subtle cursor-pointer transition-colors"
                      onClick={() => handleCaseClick(caseItem.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCaseClick(caseItem.id);
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-law-sm font-semibold text-law-text-primary truncate">
                            {caseItem.title}
                          </span>
                          {caseItem.priority === 'high' && (
                            <AlertCircle size={14} className="text-law-error flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-law-xs text-law-text-secondary">
                          {caseItem.client} • {caseItem.attorney}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <CaseStatusBadge status={caseItem.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LawCardContent>
          </LawCard>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LawCard padding="none" shadow="md">
            <LawCardHeader className="px-law-6 pt-law-6">
              <div>
                <LawCardTitle>Upcoming Tasks</LawCardTitle>
                <LawCardDescription>Deadlines and to-dos</LawCardDescription>
              </div>
              <LawButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/law/tasks')}
              >
                View All
              </LawButton>
            </LawCardHeader>
            <LawCardContent className="px-law-6 pb-law-6">
              {data.upcomingTasks.length === 0 ? (
                <LawEmptyState
                  title="No upcoming tasks"
                  description="All caught up! Create a task when needed"
                  action={{
                    label: 'New Task',
                    onClick: () => handleQuickAction('new_task'),
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {data.upcomingTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-law-md border border-law-border hover:bg-law-primary-subtle transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          // Handle task completion
                        }}
                        className="mt-1 w-4 h-4 rounded border-law-border text-law-primary focus:ring-law-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-law-sm font-medium text-law-text-primary mb-1">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-law-xs text-law-text-secondary">
                            {task.caseName}
                          </span>
                          <span className="text-law-xs text-law-text-tertiary">•</span>
                          <span className="text-law-xs text-law-text-secondary">
                            Due {task.dueDate}
                          </span>
                          {task.priority === 'high' && (
                            <>
                              <span className="text-law-xs text-law-text-tertiary">•</span>
                              <PriorityBadge priority={task.priority} size="sm" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LawCardContent>
          </LawCard>
        </motion.div>
      </div>

      {/* Quick Actions - Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <LawButton
          variant="primary"
          size="lg"
          icon={<Plus size={20} />}
          className="rounded-full w-14 h-14 p-0 shadow-law-xl"
          onClick={() => {
            // Show mobile quick action menu
            alert('Quick actions menu (to be implemented)');
          }}
          aria-label="Quick actions"
        />
      </div>
    </div>
  );
}
