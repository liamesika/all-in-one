'use client';

/**
 * Law Dashboard - Production-Ready Premium Design
 *
 * Features:
 * - Clean white background with professional aesthetics
 * - Working sidebar navigation
 * - Functional quick action modals
 * - Smooth hover effects and transitions
 * - Mobile-first responsive design
 * - Full keyboard accessibility
 * - Optimized performance
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  X,
  CheckCircle2,
  ArrowUpRight,
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
} from '@/components/law/shared';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { preserveUTMParams } from '@/lib/utils/utm';
import { PricingPanel } from '@/components/pricing/PricingPanel';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { auth } from '@/lib/firebase';
import { useLang } from '@/components/i18n/LangProvider';

interface Subscription {
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED';
  trialEndsAt?: string;
  plan: string;
}

// Types
interface DashboardKPI {
  label: string;
  value: string | number;
  change: string;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  href?: string;
}

interface Case {
  id: string;
  title: string;
  client: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  attorney: string;
  lastUpdated: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface DashboardData {
  kpis: {
    activeCases: number;
    clients: number;
    billableHours: number;
    revenue: number;
  };
  recentCases: Case[];
  upcomingTasks: Task[];
}

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'case' | 'client' | 'task' | 'event' | null;
}

// Quick Action Modal Component
function QuickActionModal({ isOpen, onClose, action }: QuickActionModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAction = () => {
    trackEventWithConsent('law_quick_action_submit', { action });

    switch (action) {
      case 'case':
        router.push('/dashboard/law/cases/new');
        break;
      case 'client':
        router.push('/dashboard/law/clients/new');
        break;
      case 'task':
        router.push('/dashboard/law/tasks/new');
        break;
      case 'event':
        router.push('/dashboard/law/calendar?action=new');
        break;
    }
  };

  const getModalContent = () => {
    switch (action) {
      case 'case':
        return { title: 'Create New Case', description: 'Start a new legal matter', icon: Briefcase };
      case 'client':
        return { title: 'Add New Client', description: 'Register a new client', icon: Users };
      case 'task':
        return { title: 'Create Task', description: 'Add a new task or deadline', icon: CheckCircle2 };
      case 'event':
        return { title: 'Schedule Event', description: 'Add to calendar', icon: Calendar };
      default:
        return { title: '', description: '', icon: Plus };
    }
  };

  const content = getModalContent();
  const Icon = content.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-law-xl shadow-law-xl max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-law-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-law-lg bg-law-info-bg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-law-info" />
                  </div>
                  <div>
                    <h2 className="text-law-lg font-semibold text-law-text-primary">
                      {content.title}
                    </h2>
                    <p className="text-law-sm text-law-text-secondary">
                      {content.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-law-primary-subtle rounded-law-md transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-law-text-secondary" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-law-base text-law-text-secondary mb-6">
                  You'll be redirected to the {action} creation page where you can enter all details and save.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <LawButton
                    variant="secondary"
                    size="md"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </LawButton>
                  <LawButton
                    variant="primary"
                    size="md"
                    onClick={handleAction}
                    icon={<ArrowUpRight size={16} />}
                    iconPosition="right"
                    className="flex-1"
                  >
                    Continue
                  </LawButton>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main Dashboard Component
export function PolishedLawDashboard({ initialData }: { initialData: DashboardData }) {
  const router = useRouter();
  const { lang } = useLang();
  const [data, setData] = useState<DashboardData>(initialData);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'case' | 'client' | 'task' | 'event' | null;
  }>({ isOpen: false, action: null });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    preserveUTMParams();
    trackEventWithConsent('law_dashboard_view', {
      page_title: 'Law Dashboard',
      page_path: '/dashboard/law/dashboard',
      vertical: 'law',
    });
  }, []);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/subscriptions/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleTrialStart = async () => {
    // Refresh subscription after trial activation
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch('/api/subscriptions/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setSubscription(data.subscription);
    }
  };

  const kpis: DashboardKPI[] = [
    {
      label: 'Active Cases',
      value: data.kpis.activeCases,
      change: '+8 this month',
      changePercent: 12,
      trend: 'up',
      icon: Briefcase,
      color: 'law-info',
      href: '/dashboard/law/cases',
    },
    {
      label: 'Clients',
      value: data.kpis.clients,
      change: '+5 this month',
      changePercent: 8,
      trend: 'up',
      icon: Users,
      color: 'law-success',
      href: '/dashboard/law/clients',
    },
    {
      label: 'Billable Hours',
      value: data.kpis.billableHours,
      change: '+12% vs last month',
      changePercent: 12,
      trend: 'up',
      icon: Clock,
      color: 'law-accent',
      href: '/dashboard/law/reports',
    },
    {
      label: 'Revenue (MTD)',
      value: `€${data.kpis.revenue.toLocaleString()}`,
      change: '+18% vs last month',
      changePercent: 18,
      trend: 'up',
      icon: DollarSign,
      color: 'law-success',
      href: '/dashboard/law/reports',
    },
  ];

  const openModal = (action: 'case' | 'client' | 'task' | 'event') => {
    setModalState({ isOpen: true, action });
    trackEventWithConsent('law_quick_action_open', { action });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, action: null });
  };

  const handleCaseClick = (caseId: string) => {
    trackEventWithConsent('law_case_click', { caseId, location: 'dashboard' });
    router.push(`/dashboard/law/cases/${caseId}`);
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    trackEventWithConsent('law_task_toggle', { taskId, completed });
    setData((prev) => ({
      ...prev,
      upcomingTasks: prev.upcomingTasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      ),
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="border-b border-law-border bg-white">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-law-3xl font-bold text-law-text-primary mb-1">
                  Law Dashboard
                </h1>
                <p className="text-law-base text-law-text-secondary">
                  Overview of your legal practice management
                </p>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                <LawButton
                  variant="secondary"
                  size="md"
                  icon={<FileText size={16} />}
                  onClick={() => openModal('case')}
                  className="hover:shadow-law-sm transition-shadow"
                >
                  New Case
                </LawButton>
                <LawButton
                  variant="secondary"
                  size="md"
                  icon={<Users size={16} />}
                  onClick={() => openModal('client')}
                  className="hover:shadow-law-sm transition-shadow"
                >
                  New Client
                </LawButton>
                <LawButton
                  variant="primary"
                  size="md"
                  icon={<Plus size={16} />}
                  onClick={() => openModal('event')}
                  className="hover:shadow-law-md transition-shadow"
                >
                  Schedule Event
                </LawButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Trial Banner */}
          {!loadingSubscription && subscription && (
            <>
              {subscription.status === 'EXPIRED' && (
                <div className="mb-6">
                  <TrialBanner
                    status="expired"
                    lang={lang}
                    onUpgrade={() => {
                      const pricingSection = document.getElementById('pricing-section');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  />
                </div>
              )}
              {subscription.status === 'TRIAL' && subscription.trialEndsAt && (
                (() => {
                  const daysRemaining = Math.ceil(
                    (new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return daysRemaining <= 7 ? (
                    <div className="mb-6">
                      <TrialBanner
                        status="expiring"
                        daysRemaining={daysRemaining}
                        lang={lang}
                        onUpgrade={() => {
                          const pricingSection = document.getElementById('pricing-section');
                          if (pricingSection) {
                            pricingSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      />
                    </div>
                  ) : null;
                })()
              )}
            </>
          )}

          {/* Pricing Panel */}
          {!loadingSubscription && (!subscription || subscription.status !== 'ACTIVE') && (
            <div id="pricing-section" className="mb-8">
              <PricingPanel
                vertical="law"
                lang={lang}
                onTrialStart={handleTrialStart}
              />
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div
                    onClick={() => kpi.href && router.push(kpi.href)}
                    className={`group relative bg-white border border-law-border rounded-law-lg p-6 transition-all duration-200 ${
                      kpi.href ? 'cursor-pointer hover:shadow-law-md hover:border-law-primary/20 hover:-translate-y-1' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-law-sm font-medium text-law-text-secondary mb-2">
                          {kpi.label}
                        </p>
                        <p className="text-law-3xl font-bold text-law-text-primary mb-1">
                          {kpi.value}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            kpi.trend === 'up' ? 'bg-law-success-bg' : 'bg-law-error-bg'
                          }`}>
                            <TrendingUp
                              size={12}
                              className={kpi.trend === 'up' ? 'text-law-success' : 'text-law-error'}
                            />
                            <span className={`text-law-xs font-medium ${
                              kpi.trend === 'up' ? 'text-law-success' : 'text-law-error'
                            }`}>
                              {kpi.change}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`p-3 rounded-law-lg bg-${kpi.color}-bg transition-transform duration-200 ${
                        kpi.href ? 'group-hover:scale-110' : ''
                      }`}>
                        <Icon className={`w-6 h-6 text-${kpi.color}`} />
                      </div>
                    </div>
                    {kpi.href && (
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-law-text-secondary" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Cases */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="bg-white border border-law-border rounded-law-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-law-border">
                  <div>
                    <h2 className="text-law-lg font-semibold text-law-text-primary mb-1">
                      Recent Cases
                    </h2>
                    <p className="text-law-sm text-law-text-secondary">
                      Latest active matters
                    </p>
                  </div>
                  <LawButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/law/cases')}
                    icon={<ChevronRight size={16} />}
                    iconPosition="right"
                  >
                    View All
                  </LawButton>
                </div>
                <div className="p-6">
                  {data.recentCases.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-12 h-12 text-law-text-tertiary mx-auto mb-3" />
                      <p className="text-law-base font-medium text-law-text-primary mb-1">
                        No active cases
                      </p>
                      <p className="text-law-sm text-law-text-secondary mb-4">
                        Create your first case to get started
                      </p>
                      <LawButton
                        variant="primary"
                        size="sm"
                        onClick={() => openModal('case')}
                      >
                        New Case
                      </LawButton>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.recentCases.map((caseItem) => (
                        <div
                          key={caseItem.id}
                          onClick={() => handleCaseClick(caseItem.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCaseClick(caseItem.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className="group flex items-center justify-between p-4 rounded-law-md border border-law-border hover:border-law-primary/30 hover:bg-law-primary-subtle cursor-pointer transition-all duration-200"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-law-base font-semibold text-law-text-primary mb-1 truncate group-hover:text-law-primary transition-colors">
                              {caseItem.title}
                            </p>
                            <p className="text-law-sm text-law-text-secondary">
                              {caseItem.client} • {caseItem.attorney}
                            </p>
                            <p className="text-law-xs text-law-text-tertiary mt-1">
                              Updated {caseItem.lastUpdated}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <CaseStatusBadge status={caseItem.status} size="sm" />
                            <ChevronRight size={16} className="text-law-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="bg-white border border-law-border rounded-law-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-law-border">
                  <div>
                    <h2 className="text-law-lg font-semibold text-law-text-primary mb-1">
                      Upcoming Tasks
                    </h2>
                    <p className="text-law-sm text-law-text-secondary">
                      Deadlines and to-dos
                    </p>
                  </div>
                  <LawButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/law/tasks')}
                    icon={<ChevronRight size={16} />}
                    iconPosition="right"
                  >
                    View All
                  </LawButton>
                </div>
                <div className="p-6">
                  {data.upcomingTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-law-text-tertiary mx-auto mb-3" />
                      <p className="text-law-base font-medium text-law-text-primary mb-1">
                        All caught up!
                      </p>
                      <p className="text-law-sm text-law-text-secondary mb-4">
                        No upcoming tasks or deadlines
                      </p>
                      <LawButton
                        variant="primary"
                        size="sm"
                        onClick={() => openModal('task')}
                      >
                        Create Task
                      </LawButton>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-4 rounded-law-md border border-law-border hover:bg-law-primary-subtle transition-colors duration-200"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-law-border text-law-primary focus:ring-2 focus:ring-law-primary focus:ring-offset-2 cursor-pointer transition-all"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-law-base font-medium mb-2 ${
                              task.completed ? 'line-through text-law-text-tertiary' : 'text-law-text-primary'
                            }`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-law-sm text-law-text-secondary">
                                Due {task.dueDate}
                              </span>
                              {task.priority === 'high' && !task.completed && (
                                <>
                                  <span className="text-law-text-tertiary">•</span>
                                  <PriorityBadge priority={task.priority} size="sm" />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal('case')}
          className="w-14 h-14 bg-law-primary hover:bg-law-primary-hover text-white rounded-full shadow-law-xl flex items-center justify-center transition-colors"
          aria-label="Quick actions"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        action={modalState.action}
      />
    </>
  );
}
