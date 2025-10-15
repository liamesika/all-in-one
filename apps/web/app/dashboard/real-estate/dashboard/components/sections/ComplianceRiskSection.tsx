'use client';

import { Shield, AlertCircle, FileWarning, CheckCircle } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface ComplianceRiskData {
  complianceScore: number;
  openIssues: number;
  documentsExpiring: number;
  auditsThisMonth: number;
  issuesByType: Array<{ label: string; value: number; color?: string }>;
  alerts?: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>;
}

interface ComplianceRiskSectionProps {
  data: ComplianceRiskData;
}

export function ComplianceRiskSection({ data }: ComplianceRiskSectionProps) {
  const { lang } = useLang();

  return (
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2979FF 0%, #6EA8FE 100%)' }}>
            <Shield className="w-6 h-6 text-[#2979FF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-3 font-bold text-white">{lang === 'he' ? 'ציות וסיכונים' : 'Compliance & Risk'}</h2>
            <p className="text-body-sm" style={{ color: '#9EA7B3' }}>{lang === 'he' ? 'ניהול תאימות ומניעת סיכונים' : 'Manage compliance and mitigate risks'}</p>
          </div>
          <UniversalButton variant="primary" size="sm">{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title={lang === 'he' ? 'ציון ציות' : 'Compliance Score'}
            value={`${data.complianceScore}%`}
            delta="+2%"
            color="#10B981"
            icon={<Shield className="w-5 h-5" />}
          />
          <KPICard
            title={lang === 'he' ? 'בעיות פתוחות' : 'Open Issues'}
            value={data.openIssues}
            color="#EF4444"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <KPICard
            title={lang === 'he' ? 'מסמכים פגי תוקף' : 'Documents Expiring'}
            value={data.documentsExpiring}
            color="#FFB347"
            icon={<FileWarning className="w-5 h-5" />}
          />
          <KPICard
            title={lang === 'he' ? 'ביקורות החודש' : 'Audits This Month'}
            value={data.auditsThisMonth}
            color="#2979FF"
            icon={<CheckCircle className="w-5 h-5" />}
          />
        </div>

        {/* Charts and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={data.issuesByType}
            title={lang === 'he' ? 'בעיות לפי סוג' : 'Issues by Type'}
          />
          <div>
            {data.alerts && data.alerts.length > 0 ? (
              <div>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--re-white)' }}
                >
                  {lang === 'he' ? 'התראות ציות' : 'Compliance Alerts'}
                </h3>
                <AlertCard alerts={data.alerts} />
              </div>
            ) : (
              <div
                className="rounded-xl p-6 flex items-center justify-center h-full"
                style={{
                  background: 'var(--re-deep-navy)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p style={{ color: 'var(--re-steel-gray)' }}>
                  {lang === 'he' ? 'אין התראות ציות' : 'No compliance alerts'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </UniversalCard>
  );
}
