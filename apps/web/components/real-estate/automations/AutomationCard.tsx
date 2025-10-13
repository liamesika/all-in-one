'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';

export interface AutomationCardProps {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  trigger: {
    type: string;
    config: any;
  };
  actions: Array<{
    type: string;
    config: any;
    order: number;
  }>;
  stats: {
    totalRuns: number;
    successRate: number;
    lastRunAt?: string;
  };
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function AutomationCard({
  id,
  name,
  status,
  trigger,
  actions,
  stats,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
}: AutomationCardProps) {
  const { lang } = useLang();
  const [showMenu, setShowMenu] = useState(false);

  const isRtl = lang === 'he';

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, { en: string; he: string }> = {
      LEAD_CREATED: { en: 'Lead Created', he: 'ליד נוצר' },
      LEAD_STATUS_CHANGED: { en: 'Lead Status Changed', he: 'סטטוס ליד השתנה' },
      PROPERTY_ADDED: { en: 'Property Added', he: 'נכס נוסף' },
      PROPERTY_PRICE_CHANGED: { en: 'Price Changed', he: 'מחיר השתנה' },
      CAMPAIGN_LEAD_RECEIVED: { en: 'Campaign Lead', he: 'ליד מקמפיין' },
    };
    return labels[type]?.[lang] || type;
  };

  const getActionLabel = (type: string) => {
    const labels: Record<string, { en: string; he: string }> = {
      SEND_WHATSAPP: { en: 'Send WhatsApp', he: 'שלח וואטסאפ' },
      SEND_EMAIL: { en: 'Send Email', he: 'שלח מייל' },
      CREATE_TASK: { en: 'Create Task', he: 'צור משימה' },
      ASSIGN_AGENT: { en: 'Assign Agent', he: 'הקצה סוכן' },
      UPDATE_FIELD: { en: 'Update Field', he: 'עדכן שדה' },
      SEND_NOTIFICATION: { en: 'Notify', he: 'התראה' },
    };
    return labels[type]?.[lang] || type;
  };

  const formatLastRun = (date?: string) => {
    if (!date) return lang === 'he' ? 'מעולם לא רץ' : 'Never run';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${lang === 'he' ? ' ימים' : 'd'} ${lang === 'he' ? 'לפני' : 'ago'}`;
    if (hours > 0) return `${hours}${lang === 'he' ? ' שעות' : 'h'} ${lang === 'he' ? 'לפני' : 'ago'}`;
    return lang === 'he' ? 'לפני פחות משעה' : 'Less than 1h ago';
  };

  return (
    <div
      className="bg-[#1A2F4B] rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Toggle Switch */}
        <button
          onClick={() => onToggleStatus(id)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        {/* Content */}
        <div className="flex-1">
          {/* Name and Status */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400'
                  : status === 'PAUSED'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {status === 'ACTIVE'
                ? lang === 'he'
                  ? 'פעיל'
                  : 'Active'
                : status === 'PAUSED'
                ? lang === 'he'
                  ? 'מושהה'
                  : 'Paused'
                : lang === 'he'
                ? 'טיוטה'
                : 'Draft'}
            </span>
          </div>

          {/* Visual Flow */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {/* Trigger */}
            <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#2979FF]/20 border border-[#2979FF] text-[#2979FF] text-sm font-medium">
              {getTriggerLabel(trigger.type)}
            </div>

            {/* Arrow */}
            <div className="text-gray-500">→</div>

            {/* Actions */}
            {actions.slice(0, 3).map((action, idx) => (
              <div key={idx}>
                <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#10B981]/20 border border-[#10B981] text-[#10B981] text-sm font-medium">
                  {getActionLabel(action.type)}
                </div>
                {idx < Math.min(actions.length - 1, 2) && (
                  <span className="text-gray-500 mx-2">→</span>
                )}
              </div>
            ))}

            {actions.length > 3 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm">
                +{actions.length - 3}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              <span className="font-medium text-white">{stats.totalRuns}</span>{' '}
              {lang === 'he' ? 'ריצות' : 'runs'}
            </span>
            <span>
              <span className="font-medium text-green-400">{stats.successRate}%</span>{' '}
              {lang === 'he' ? 'הצלחה' : 'success'}
            </span>
            <span>
              {lang === 'he' ? 'ריצה אחרונה:' : 'Last:'}{' '}
              <span className="font-medium text-gray-300">{formatLastRun(stats.lastRunAt)}</span>
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-48 bg-[#0E1A2B] border border-gray-700 rounded-lg shadow-xl py-1">
                <button
                  onClick={() => {
                    onEdit(id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {lang === 'he' ? 'ערוך' : 'Edit'}
                </button>
                <button
                  onClick={() => {
                    onDuplicate(id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {lang === 'he' ? 'שכפל' : 'Duplicate'}
                </button>
                <button
                  onClick={() => {
                    // TODO: Open logs modal
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {lang === 'he' ? 'צפה בלוגים' : 'View Logs'}
                </button>
                <hr className="my-1 border-gray-700" />
                <button
                  onClick={() => {
                    if (confirm(lang === 'he' ? 'למחוק אוטומציה?' : 'Delete automation?')) {
                      onDelete(id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  {lang === 'he' ? 'מחק' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
