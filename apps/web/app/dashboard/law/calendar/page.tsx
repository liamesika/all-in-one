'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

const mockEvents = [
  { id: '1', title: 'Court Hearing - Tech Corp Case', type: 'hearing', date: '2025-11-15 10:00', location: 'District Court Room 3', case: 'LAW-2025-001' },
  { id: '2', title: 'Client Meeting', type: 'meeting', date: '2025-11-10 14:00', location: 'Office', case: 'LAW-2025-002' },
  { id: '3', title: 'Filing Deadline', type: 'deadline', date: '2025-11-12 17:00', location: 'Online', case: 'LAW-2025-001' },
];

export default function LawCalendarPage() {
  const { language } = useLanguage();
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('agenda');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'יומן' : 'Calendar'}
        </h1>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
            {(['month', 'week', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm ${view === v ? 'bg-[#2979FF] text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <UniversalButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            {language === 'he' ? 'אירוע חדש' : 'New Event'}
          </UniversalButton>
        </div>
      </div>

      <div className="grid gap-4">
        {mockEvents.map((event) => (
          <UniversalCard key={event.id} hoverable>
            <div className="p-4 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2979FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-6 h-6 text-[#2979FF]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.date} • {event.location}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{language === 'he' ? 'תיק' : 'Case'}: {event.case}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                {event.type}
              </span>
            </div>
          </UniversalCard>
        ))}
      </div>
    </div>
  );
}
