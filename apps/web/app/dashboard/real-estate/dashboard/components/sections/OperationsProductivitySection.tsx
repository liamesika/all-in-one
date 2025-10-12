'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface OperationsProductivityData {
  tasksCompleted: number;
  avgResponseTime: number;
  appointmentsToday: number;
  documentsPending: number;
  tasksByPriority: Array<{ label: string; value: number; color?: string }>;
  agentActivity: Array<{ label: string; value: number; color?: string }>;
}

interface OperationsProductivitySectionProps {
  data: OperationsProductivityData;
}

export function OperationsProductivitySection({ data }: OperationsProductivitySectionProps) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{lang === 'he' ? 'תפעול ופרודוקטיביות' : 'Operations & Productivity'}</h2>
          <p className="text-sm" style={{ color: '#9EA7B3' }}>{lang === 'he' ? 'נהל משימות ופעילות צוות' : 'Manage tasks and team activity'}</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-white transition-all" style={{ background: '#2979FF' }}>{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</button>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'משימות שהושלמו' : 'Tasks Completed'}
          value={data.tasksCompleted}
          delta="+23"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'זמן תגובה ממוצע' : 'Avg Response Time'}
          value={`${data.avgResponseTime}h`}
          delta="-0.5h"
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
          title={lang === 'he' ? 'פגישות היום' : 'Appointments Today'}
          value={data.appointmentsToday}
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'מסמכים ממתינים' : 'Documents Pending'}
          value={data.documentsPending}
          color="#FFB347"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={data.tasksByPriority}
          title={lang === 'he' ? 'משימות לפי עדיפות' : 'Tasks by Priority'}
        />
        <BarChart
          data={data.agentActivity}
          title={lang === 'he' ? 'פעילות סוכנים' : 'Agent Activity'}
        />
      </div>
    </section>
  );
}
