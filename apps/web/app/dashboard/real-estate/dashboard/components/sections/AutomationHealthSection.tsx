'use client';

/**
 * Automation Health Section - Redesigned with Design System 2.0
 */

import { Zap, Clock, GitBranch, CheckCircle } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
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
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg">
              <Zap className="w-6 h-6 text-[#2979FF]" />
            </div>
            <div>
              <h2 className="text-heading-3 text-gray-900 dark:text-white">
                {lang === 'he' ? 'בריאות אוטומציה' : 'Automation Health'}
              </h2>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'he' ? 'מעקב זרימות עבודה אוטומטיות' : 'Monitor automated workflows'}
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
            icon={<Zap className="w-5 h-5" />}
            label={lang === 'he' ? 'משימות אוטומטיות' : 'Automated Tasks'}
            value={data.automatedTasks}
            change={{ value: '+45 this month', trend: 'up' }}
          />
          <KPICard
            icon={<Clock className="w-5 h-5" />}
            label={lang === 'he' ? 'זמן שנחסך' : 'Time Saved'}
            value={`${data.timeSaved}h`}
            change={{ value: '+12h this week', trend: 'up' }}
          />
          <KPICard
            icon={<GitBranch className="w-5 h-5" />}
            label={lang === 'he' ? 'תהליכים פעילים' : 'Workflows Active'}
            value={data.workflowsActive}
            change={{ value: `${data.workflowsActive} running`, trend: 'neutral' }}
          />
          <KPICard
            icon={<CheckCircle className="w-5 h-5" />}
            label={lang === 'he' ? 'שיעור שגיאות' : 'Error Rate'}
            value={`${data.errorRate}%`}
            change={{ value: '-1.2% improved', trend: 'up' }}
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
      </CardBody>
    </UniversalCard>
  );
}
