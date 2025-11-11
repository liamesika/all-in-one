'use client';

import { useLanguage } from '@/lib/language-context';
import { DashboardWidgets } from '@/components/real-estate/DashboardWidgets';
import { Plus, Calendar as CalendarIcon, ClipboardList, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManagementOverviewPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const t = language === 'he' ? {
    title: 'סקירה כללית',
    subtitle: 'סטטיסטיקות ומדדי ביצועים בזמן אמת',
    quickActions: 'פעולות מהירות',
    createLead: 'צור ליד חדש',
    scheduleMeeting: 'קבע פגישה',
    assignTask: 'הקצה משימה',
    addProperty: 'הוסף נכס'
  } : {
    title: 'Overview',
    subtitle: 'Real-time statistics and performance metrics',
    quickActions: 'Quick Actions',
    createLead: 'Create Lead',
    scheduleMeeting: 'Schedule Meeting',
    assignTask: 'Assign Task',
    addProperty: 'Add Property'
  };

  const quickActions = [
    {
      icon: Plus,
      label: t.createLead,
      color: 'from-blue-500 to-blue-600',
      action: () => router.push('/dashboard/real-estate/management/leads')
    },
    {
      icon: CalendarIcon,
      label: t.scheduleMeeting,
      color: 'from-purple-500 to-purple-600',
      action: () => router.push('/dashboard/real-estate/management/calendar')
    },
    {
      icon: ClipboardList,
      label: t.assignTask,
      color: 'from-orange-500 to-orange-600',
      action: () => router.push('/dashboard/real-estate/management/tasks')
    },
    {
      icon: Building2,
      label: t.addProperty,
      color: 'from-green-500 to-green-600',
      action: () => router.push('/dashboard/real-estate/management/properties')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Dashboard Widgets */}
      <DashboardWidgets language={language as 'en' | 'he'} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1A2F4B] p-6 border border-gray-200 dark:border-[#2979FF]/20 hover:shadow-lg transition-all duration-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
                <div className="relative flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-left">
                    {action.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
