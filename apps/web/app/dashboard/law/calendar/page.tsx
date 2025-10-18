'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { EventModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'hearing' | 'meeting' | 'deadline' | 'submission' | 'consultation';
  eventDate: string;
  duration?: number;
  location?: string;
  case?: { id: string; caseNumber: string };
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

const eventTypeColors = {
  hearing: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  deadline: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  submission: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  consultation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function LawCalendarPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, eventTypeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 1000, sortBy: 'eventDate', sortOrder: 'asc' };

      // Set date range based on view
      const startDate = getStartDate();
      const endDate = getEndDate();

      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();

      if (eventTypeFilter !== 'all') {
        params.eventType = eventTypeFilter;
      }

      const response = await lawApi.events.list(params);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת אירועים' : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const start = getStartDate();
      const end = getEndDate();
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return language === 'he' ? 'כל האירועים' : 'All Events';
  };

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
                className={`px-4 py-2 text-sm transition-colors ${
                  view === v
                    ? 'bg-[#2979FF] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <UniversalButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
          >
            {language === 'he' ? 'אירוע חדש' : 'New Event'}
          </UniversalButton>
        </div>
      </div>

      {/* Navigation and Filters */}
      <UniversalCard>
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {language === 'he' ? 'היום' : 'Today'}
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
              {formatDateHeader()}
            </div>
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
          >
            <option value="all">{language === 'he' ? 'כל הסוגים' : 'All Types'}</option>
            <option value="hearing">{language === 'he' ? 'דיון' : 'Hearing'}</option>
            <option value="meeting">{language === 'he' ? 'פגישה' : 'Meeting'}</option>
            <option value="deadline">{language === 'he' ? 'מועד אחרון' : 'Deadline'}</option>
            <option value="submission">{language === 'he' ? 'הגשה' : 'Submission'}</option>
            <option value="consultation">{language === 'he' ? 'ייעוץ' : 'Consultation'}</option>
          </select>
        </div>
      </UniversalCard>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <UniversalCard key={i}>
              <div className="p-4 flex items-start gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}

      {/* Events List */}
      {!loading && events.length > 0 && (
        <div className="grid gap-4">
          {events.map((event) => (
            <UniversalCard key={event.id} hoverable>
              <div
                className="p-4 flex items-start gap-4 cursor-pointer"
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              >
                <div className="w-12 h-12 bg-[#2979FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-6 h-6 text-[#2979FF]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(event.eventDate).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        {event.location && ` • ${event.location}`}
                      </p>
                      {event.case && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {language === 'he' ? 'תיק' : 'Case'}: {event.case.caseNumber}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        eventTypeColors[event.eventType]
                      }`}
                    >
                      {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <UniversalCard>
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו אירועים' : 'No events found'}
            </p>
          </div>
        </UniversalCard>
      )}

      {/* Event Modal */}
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            fetchEvents();
            toast.success(
              selectedEvent
                ? language === 'he' ? 'האירוע עודכן בהצלחה' : 'Event updated'
                : language === 'he' ? 'האירוע נוצר בהצלחה' : 'Event created'
            );
          }}
        />
      )}
    </div>
  );
}
