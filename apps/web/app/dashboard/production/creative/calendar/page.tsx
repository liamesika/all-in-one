'use client';

/**
 * Creative Productions - Calendar
 * Timeline view for projects, tasks, reviews, and renders
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  FolderKanban,
  CheckSquare,
  ClipboardCheck,
  Film,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  StatusBadge,
  Drawer,
} from '@/components/shared';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'project_deadline' | 'task_due' | 'review_requested' | 'render_milestone';
  date: Date;
  status?: string;
  projectId?: string;
  projectName?: string;
  metadata?: any;
}

type ViewMode = 'month' | 'week' | 'agenda';

export default function CalendarPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    'project_deadline',
    'task_due',
    'review_requested',
    'render_milestone',
  ]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tempSelectedEventTypes, setTempSelectedEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'he' ? 'יומן' : 'Calendar',
    subtitle:
      language === 'he'
        ? 'מעקב אחר לוחות זמנים ואבני דרך'
        : 'Track deadlines and milestones',
    month: language === 'he' ? 'חודש' : 'Month',
    week: language === 'he' ? 'שבוע' : 'Week',
    agenda: language === 'he' ? 'סדר יום' : 'Agenda',
    filters: language === 'he' ? 'סינון' : 'Filters',
    resetFilters: language === 'he' ? 'אפס סינון' : 'Reset',
    applyFilters: language === 'he' ? 'החל סינון' : 'Apply',
    eventTypes: language === 'he' ? 'סוגי אירועים' : 'Event Types',
    projectDeadline: language === 'he' ? 'מועד פרויקט' : 'Project Deadline',
    taskDue: language === 'he' ? 'משימה פגה' : 'Task Due',
    reviewRequested: language === 'he' ? 'בקשת ביקורת' : 'Review Requested',
    renderMilestone: language === 'he' ? 'אבן דרך עיבוד' : 'Render Milestone',
    today: language === 'he' ? 'היום' : 'Today',
    noEvents: language === 'he' ? 'אין אירועים מתוזמנים' : 'No events scheduled',
    noEventsDescription:
      language === 'he'
        ? 'צור פרויקט עם מועד כדי לראות אותו כאן'
        : 'Create a project with a deadline to see it here',
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, selectedEventTypes]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { calendarApi } = await import('@/lib/api/creative-productions');

      // Get first and last day of current month
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const data = await calendarApi.getEvents({
        startDate,
        endDate,
        eventTypes: selectedEventTypes,
      });

      // Map API response to component interface
      setEvents(
        data.map((event) => ({
          id: event.id,
          title: event.title,
          type: event.type,
          date: new Date(event.date), // Convert ISO string to Date
          status: event.status,
          projectId: event.projectId,
          projectName: event.projectName,
          metadata: event.metadata,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to empty array on error
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'project_deadline':
        return <FolderKanban className="w-4 h-4" />;
      case 'task_due':
        return <CheckSquare className="w-4 h-4" />;
      case 'review_requested':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'render_milestone':
        return <Film className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'project_deadline':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'task_due':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'review_requested':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'render_milestone':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenFilterDrawer = () => {
    setTempSelectedEventTypes(selectedEventTypes);
    setShowFilterDrawer(true);
  };

  const handleResetFilters = () => {
    setTempSelectedEventTypes([
      'project_deadline',
      'task_due',
      'review_requested',
      'render_milestone',
    ]);
  };

  const handleApplyFilters = () => {
    setSelectedEventTypes(tempSelectedEventTypes);
    setShowFilterDrawer(false);
  };

  const toggleEventType = (type: string) => {
    if (tempSelectedEventTypes.includes(type)) {
      setTempSelectedEventTypes(tempSelectedEventTypes.filter((t) => t !== type));
    } else {
      setTempSelectedEventTypes([...tempSelectedEventTypes, type]);
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${
        language === 'he' ? 'rtl' : 'ltr'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UniversalButton
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              {t.today}
            </UniversalButton>
            <div className="flex items-center gap-1 bg-white dark:bg-[#1A2F4B] rounded-lg p-1 border border-gray-200 dark:border-[#2979FF]/20">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.month}
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'week'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.week}
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'agenda'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.agenda}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              <UniversalButton
                variant="outline"
                size="sm"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={handleOpenFilterDrawer}
              >
                {t.filters}
                {selectedEventTypes.length < 4 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-semibold">
                    {selectedEventTypes.length}
                  </span>
                )}
              </UniversalButton>
            </div>
          </CardBody>
        </UniversalCard>

        {/* Calendar View (Agenda mode for now) */}
        <UniversalCard variant="default">
          <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
            <h3 className="text-heading-4 text-gray-900 dark:text-white">
              {viewMode === 'month'
                ? 'Month View (Coming Soon)'
                : viewMode === 'week'
                ? 'Week View (Coming Soon)'
                : language === 'he'
                ? 'סדר יום'
                : 'Agenda'}
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.noEvents}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.noEventsDescription}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${getEventColor(
                      event.type
                    )}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          {event.projectName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {event.projectName}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.date.toLocaleDateString(
                              language === 'he' ? 'he-IL' : 'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </div>
                          {event.status && (
                            <StatusBadge status="active" className="text-xs">
                              {event.status}
                            </StatusBadge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </UniversalCard>
      </div>

      {/* Filter Drawer */}
      <Drawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        title={t.filters}
        resetLabel={t.resetFilters}
        applyLabel={t.applyFilters}
        width="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t.eventTypes}
            </label>
            <div className="space-y-2">
              {[
                { type: 'project_deadline', label: t.projectDeadline, color: 'orange' },
                { type: 'task_due', label: t.taskDue, color: 'blue' },
                { type: 'review_requested', label: t.reviewRequested, color: 'purple' },
                { type: 'render_milestone', label: t.renderMilestone, color: 'green' },
              ].map(({ type, label, color }) => (
                <label
                  key={type}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedEventTypes.includes(type)}
                    onChange={() => toggleEventType(type)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-2">
                    {getEventIcon(type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </main>
  );
}
