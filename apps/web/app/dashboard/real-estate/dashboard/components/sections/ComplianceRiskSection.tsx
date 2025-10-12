'use client';

import { KPICard } from '@/components/dashboard/KPICard';
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
    <section
      className="rounded-xl p-8 mb-6 border border-gray-800 shadow-2xl animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, #1A2F4B 0%, #0E1A2B 100%)',
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2979FF 0%, #6EA8FE 100%)' }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{lang === 'he' ? 'ציות וסיכונים' : 'Compliance & Risk'}</h2>
          <p className="text-sm" style={{ color: '#9EA7B3' }}>{lang === 'he' ? 'ניהול תאימות ומניעת סיכונים' : 'Manage compliance and mitigate risks'}</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-white transition-all" style={{ background: '#2979FF' }}>{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</button>
      </div>
      <h2
        className="text-2xl font-bold mb-6 hidden"
        style={{ color: 'var(--re-white)' }}
      >
        {lang === 'he' ? 'ציות וניהול סיכונים' : 'Compliance & Risk'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'ציון ציות' : 'Compliance Score'}
          value={`${data.complianceScore}%`}
          delta="+2%"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'בעיות פתוחות' : 'Open Issues'}
          value={data.openIssues}
          color="#EF4444"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'מסמכים פגי תוקף' : 'Documents Expiring'}
          value={data.documentsExpiring}
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
        <KPICard
          title={lang === 'he' ? 'ביקורות החודש' : 'Audits This Month'}
          value={data.auditsThisMonth}
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
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
    </section>
  );
}
