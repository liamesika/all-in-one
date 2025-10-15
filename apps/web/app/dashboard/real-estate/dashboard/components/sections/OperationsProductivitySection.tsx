'use client';

/**
 * Operations & Productivity Section - Redesigned with Design System 2.0
 */

import { CheckSquare, Clock, Calendar, FileText } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
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
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg">
              <CheckSquare className="w-6 h-6 text-[#2979FF]" />
            </div>
            <div>
              <h2 className="text-heading-3 text-gray-900 dark:text-white">
                {lang === 'he' ? 'תפעול ופרודוקטיביות' : 'Operations & Productivity'}
              </h2>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'he' ? 'נהל משימות ופעילות צוות' : 'Manage tasks and team activity'}
              </p>
            </div>
          </div>
          <UniversalButton variant="primary" size="sm">
            {lang === 'he' ? 'צפה בפרטים' : 'View Details'}
          </UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">
        {/* KPIs Row - Updated with Unified KPICard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<CheckSquare className="w-5 h-5" />}
            label={lang === 'he' ? 'משימות שהושלמו' : 'Tasks Completed'}
            value={data.tasksCompleted}
            change={{ value: '+23 today', trend: 'up' }}
          />
          <KPICard
            icon={<Clock className="w-5 h-5" />}
            label={lang === 'he' ? 'זמן תגובה ממוצע' : 'Avg Response Time'}
            value={`${data.avgResponseTime}h`}
            change={{ value: '-0.5h improved', trend: 'up' }}
          />
          <KPICard
            icon={<Calendar className="w-5 h-5" />}
            label={lang === 'he' ? 'פגישות היום' : 'Appointments Today'}
            value={data.appointmentsToday}
            change={{ value: `${data.appointmentsToday} scheduled`, trend: 'neutral' }}
          />
          <KPICard
            icon={<FileText className="w-5 h-5" />}
            label={lang === 'he' ? 'מסמכים ממתינים' : 'Documents Pending'}
            value={data.documentsPending}
            change={{ value: `${data.documentsPending} pending`, trend: 'neutral' }}
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
      </CardBody>
    </UniversalCard>
  );
}
