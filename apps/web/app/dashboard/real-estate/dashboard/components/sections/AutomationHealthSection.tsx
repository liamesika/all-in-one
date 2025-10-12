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
      className="rounded-xl p-8 mb-6 border border-gray-800 shadow-2xl animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, #1A2F4B 0%, #0E1A2B 100%)',
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2979FF 0%, #6EA8FE 100%)' }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{lang === 'he' ? 'בריאות אוטומציה' : 'Automation Health'}</h2>
          <p className="text-sm" style={{ color: '#9EA7B3' }}>{lang === 'he' ? 'מעקב זרימות עבודה אוטומטיות' : 'Monitor automated workflows'}</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-white transition-all" style={{ background: '#2979FF' }}>{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</button>
      </div>

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
