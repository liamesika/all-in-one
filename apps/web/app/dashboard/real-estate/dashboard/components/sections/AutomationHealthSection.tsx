'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface AutomationHealthData {
  automatedTasks: number;
  timeSaved: number;
  workflowsActive: number;
  errorRate: number;
  automationsByType: Array<{ label: string; value: number; color?: string }>;
  workflowPerformance: Array<{ label: string; value: number; color?: string }>;
}

interface AutomationHealthSectionProps {
  data: AutomationHealthData;
}

export function AutomationHealthSection({ data }: AutomationHealthSectionProps) {
  const { lang } = useLang();

  return (
    <section
      className="rounded-xl p-6 animate-fade-in"
      style={{
        background: 'var(--re-midnight-blue)',
        boxShadow: 'var(--re-shadow-md)',
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--re-white)' }}
      >
        {lang === 'he' ? 'בריאות אוטומציה' : 'Automation Health'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'משימות אוטומטיות' : 'Automated Tasks'}
          value={data.automatedTasks}
          delta="+45"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'זמן שנחסך' : 'Time Saved'}
          value={`${data.timeSaved}h`}
          delta="+12h"
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'תהליכים פעילים' : 'Workflows Active'}
          value={data.workflowsActive}
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'שיעור שגיאות' : 'Error Rate'}
          value={`${data.errorRate}%`}
          delta="-1.2%"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={data.automationsByType}
          title={lang === 'he' ? 'אוטומציות לפי סוג' : 'Automations by Type'}
        />
        <BarChart
          data={data.workflowPerformance}
          title={lang === 'he' ? 'ביצועי תהליכים' : 'Workflow Performance'}
        />
      </div>
    </section>
  );
}
