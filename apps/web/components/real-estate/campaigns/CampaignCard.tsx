'use client';

import { useState } from 'react';
import { Edit, Pause, Play, FileText, Trash2, Facebook, Chrome, Linkedin, TrendingUp, MousePointer, Eye, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Campaign {
  id: string;
  name: string;
  status: string;
  platform: string;
  goal?: string;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onPauseResume: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
}

export function CampaignCard({ campaign, onEdit, onPauseResume, onDelete }: CampaignCardProps) {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const t = {
    impressions: language === 'he' ? 'חשיפות' : 'Impressions',
    clicks: language === 'he' ? 'קליקים' : 'Clicks',
    ctr: language === 'he' ? 'CTR' : 'CTR',
    leads: language === 'he' ? 'לידים' : 'Leads',
    cpl: language === 'he' ? 'עלות ללייד' : 'CPL',
    spent: language === 'he' ? 'הוצאו' : 'Spent',
    budget: language === 'he' ? 'תקציב' : 'Budget',
    edit: language === 'he' ? 'ערוך' : 'Edit',
    pause: language === 'he' ? 'השהה' : 'Pause',
    resume: language === 'he' ? 'המשך' : 'Resume',
    report: language === 'he' ? 'דוח' : 'Report',
    delete: language === 'he' ? 'מחק' : 'Delete',
    active: language === 'he' ? 'פעיל' : 'Active',
    paused: language === 'he' ? 'מושהה' : 'Paused',
    completed: language === 'he' ? 'הושלם' : 'Completed',
    draft: language === 'he' ? 'טיוטה' : 'Draft',
  };

  // Calculate metrics
  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : '0.00';

  const cpl = campaign.conversions > 0
    ? (campaign.spend / campaign.conversions).toFixed(2)
    : '0.00';

  const spentPercentage = campaign.budget
    ? Math.min((campaign.spend / campaign.budget) * 100, 100)
    : 0;

  // Status badge colors
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: { bg: '#10B98120', text: '#10B981', border: '#10B981' },
    PAUSED: { bg: '#F59E0B20', text: '#F59E0B', border: '#F59E0B' },
    COMPLETED: { bg: '#6B728020', text: '#6B7280', border: '#6B7280' },
    DRAFT: { bg: '#3B82F620', text: '#3B82F6', border: '#3B82F6' },
  };

  const statusColor = statusColors[campaign.status] || statusColors.DRAFT;
  const statusLabel = t[campaign.status.toLowerCase() as keyof typeof t] || campaign.status;

  // Platform icons and colors
  const platformConfig: Record<string, { icon: any; color: string; label: string }> = {
    META: { icon: Facebook, color: '#1877F2', label: 'Facebook' },
    GOOGLE: { icon: Chrome, color: '#4285F4', label: 'Google' },
    TIKTOK: { icon: TrendingUp, color: '#000000', label: 'TikTok' },
    LINKEDIN: { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
  };

  const platformData = platformConfig[campaign.platform] || platformConfig.META;
  const PlatformIcon = platformData.icon;

  return (
    <div
      className="rounded-xl p-6 transition-all duration-200 border"
      style={{
        background: '#1A2F4B',
        borderColor: isHovered ? '#2979FF' : '#374151',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Platform Icon */}
        <div
          className="p-2 rounded-lg"
          style={{ background: `${platformData.color}20` }}
        >
          <PlatformIcon className="w-6 h-6" style={{ color: platformData.color }} />
        </div>

        {/* Status Badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={{
            background: statusColor.bg,
            color: statusColor.text,
            borderColor: statusColor.border,
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Campaign Name */}
      <h3 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>
        {campaign.name}
      </h3>
      <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
        {platformData.label} • {campaign.goal || 'Campaign'}
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Impressions */}
        <div
          className="p-3 rounded-lg"
          style={{ background: '#0E1A2B' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {t.impressions}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            {campaign.impressions.toLocaleString()}
          </p>
        </div>

        {/* Clicks */}
        <div
          className="p-3 rounded-lg"
          style={{ background: '#0E1A2B' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <MousePointer className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {t.clicks}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            {campaign.clicks.toLocaleString()}
          </p>
        </div>

        {/* CTR */}
        <div
          className="p-3 rounded-lg"
          style={{ background: '#0E1A2B' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {t.ctr}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#10B981' }}>
            {ctr}%
          </p>
        </div>

        {/* Leads */}
        <div
          className="p-3 rounded-lg"
          style={{ background: '#0E1A2B' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {t.leads}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            {campaign.conversions.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: '#9CA3AF' }}>
            {t.spent}
          </span>
          <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            ${campaign.spend.toLocaleString()} {campaign.budget ? `/ $${campaign.budget.toLocaleString()}` : ''}
          </span>
        </div>
        {campaign.budget && (
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: '#0E1A2B' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${spentPercentage}%`,
                background: spentPercentage > 90 ? '#EF4444' : spentPercentage > 70 ? '#F59E0B' : '#10B981',
              }}
            />
          </div>
        )}
      </div>

      {/* CPL */}
      <div
        className="p-3 rounded-lg mb-4"
        style={{ background: '#0E1A2B' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span className="text-sm" style={{ color: '#9CA3AF' }}>
              {t.cpl}
            </span>
          </div>
          <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            ${cpl}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2">
        {/* Edit */}
        <button
          onClick={() => onEdit(campaign)}
          className="p-2 rounded-lg transition-colors flex items-center justify-center"
          style={{ background: '#0E1A2B', color: '#9CA3AF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#374151';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0E1A2B';
            e.currentTarget.style.color = '#9CA3AF';
          }}
          title={t.edit}
        >
          <Edit className="w-4 h-4" />
        </button>

        {/* Pause/Resume */}
        <button
          onClick={() => onPauseResume(campaign)}
          className="p-2 rounded-lg transition-colors flex items-center justify-center"
          style={{ background: '#0E1A2B', color: '#9CA3AF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#374151';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0E1A2B';
            e.currentTarget.style.color = '#9CA3AF';
          }}
          title={campaign.status === 'ACTIVE' ? t.pause : t.resume}
        >
          {campaign.status === 'ACTIVE' ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        {/* Report */}
        <button
          className="p-2 rounded-lg transition-colors flex items-center justify-center"
          style={{ background: '#0E1A2B', color: '#9CA3AF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#374151';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0E1A2B';
            e.currentTarget.style.color = '#9CA3AF';
          }}
          title={t.report}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(campaign.id)}
          className="p-2 rounded-lg transition-colors flex items-center justify-center"
          style={{ background: '#0E1A2B', color: '#9CA3AF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EF444420';
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0E1A2B';
            e.currentTarget.style.color = '#9CA3AF';
          }}
          title={t.delete}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
