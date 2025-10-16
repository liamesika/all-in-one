'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  Download,
  Plus,
  Check,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';

type ViewMode = 'month' | 'week' | 'timeline';
type EventType = 'deadline' | 'milestone' | 'meeting' | 'production';

interface CalendarEvent {
  id: string;
  title: string;
  project: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  time?: string;
  location?: string;
  attendees?: string[];
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  color: string;
  description?: string;
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');

  // Mock calendar events
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Final Video Delivery',
      project: 'Tech Conference 2024',
      type: 'deadline',
      startDate: new Date(2024, 10, 30),
      time: '5:00 PM',
      status: 'upcoming',
      color: '#EF4444',
      description: 'Final deliverable deadline for Tech Conference'
    },
    {
      id: '2',
      title: 'Client Review Session',
      project: 'Brand Refresh Campaign',
      type: 'meeting',
      startDate: new Date(2024, 10, 22),
      time: '2:00 PM',
      location: 'Zoom',
      attendees: ['Sarah Chen', 'Mike Ross', 'Client Team'],
      status: 'upcoming',
      color: '#3B82F6',
      description: 'Present initial concepts and gather feedback'
    },
    {
      id: '3',
      title: 'Filming Complete',
      project: 'Documentary Series',
      type: 'milestone',
      startDate: new Date(2024, 10, 25),
      status: 'upcoming',
      color: '#10B981',
      description: 'All principal photography wrapped'
    },
    {
      id: '4',
      title: 'Script Approval',
      project: 'Product Launch Video',
      type: 'milestone',
      startDate: new Date(2024, 10, 18),
      status: 'completed',
      color: '#10B981',
      description: 'Final script approved by client'
    },
    {
      id: '5',
      title: 'Production Day 1',
      project: 'Corporate Training Videos',
      type: 'production',
      startDate: new Date(2024, 10, 28),
      endDate: new Date(2024, 10, 29),
      time: '8:00 AM',
      location: 'Studio A',
      attendees: ['Production Crew', 'Talent', 'Client Rep'],
      status: 'upcoming',
      color: '#F59E0B',
      description: 'First day of principal photography'
    },
    {
      id: '6',
      title: 'Color Grading Due',
      project: 'Brand Refresh Campaign',
      type: 'deadline',
      startDate: new Date(2024, 10, 27),
      time: '6:00 PM',
      status: 'upcoming',
      color: '#EF4444',
      description: 'Final color grading must be completed'
    },
    {
      id: '7',
      title: 'Weekly Team Sync',
      project: 'All Projects',
      type: 'meeting',
      startDate: new Date(2024, 10, 20),
      time: '10:00 AM',
      location: 'Conference Room B',
      attendees: ['Full Team'],
      status: 'upcoming',
      color: '#3B82F6',
      description: 'Weekly production status update'
    },
    {
      id: '8',
      title: 'Audio Mix Complete',
      project: 'Documentary Series',
      type: 'milestone',
      startDate: new Date(2024, 10, 24),
      status: 'upcoming',
      color: '#10B981',
      description: 'Final audio mix approved'
    }
  ];

  const filteredEvents = events.filter(event =>
    filterType === 'all' || event.type === filterType
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
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

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'deadline':
        return AlertCircle;
      case 'milestone':
        return CheckCircle2;
      case 'meeting':
        return Users;
      case 'production':
        return Circle;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { color: 'bg-blue-100 text-blue-700', label: 'Upcoming' },
      in_progress: { color: 'bg-orange-100 text-orange-700', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      overdue: { color: 'bg-red-100 text-red-700', label: 'Overdue' }
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  // Month View
  const MonthView = () => {
    const calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-200 p-2 min-h-24" />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      calendarDays.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: day * 0.01 }}
          className={`bg-white border border-gray-200 p-2 min-h-24 hover:shadow-md transition-shadow ${
            isToday ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>
            {day}
            {isToday && <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Today</span>}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, index) => {
              const Icon = getEventIcon(event.type);
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left text-xs p-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  style={{ borderLeft: `3px solid ${event.color}` }}
                >
                  <Icon size={10} style={{ color: event.color }} />
                  <span className="truncate flex-1">{event.title}</span>
                </button>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="bg-gray-100 border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    );
  };

  // Timeline View
  const TimelineView = () => {
    // Sort events by date
    const sortedEvents = [...filteredEvents].sort((a, b) =>
      a.startDate.getTime() - b.startDate.getTime()
    );

    // Group events by month
    const groupedByMonth = sortedEvents.reduce((acc, event) => {
      const monthKey = `${event.startDate.getFullYear()}-${event.startDate.getMonth()}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <div className="space-y-8">
        {Object.entries(groupedByMonth).map(([monthKey, monthEvents], groupIndex) => {
          const [year, month] = monthKey.split('-').map(Number);
          const monthName = monthNames[month];

          return (
            <motion.div
              key={monthKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <div className="text-sm font-medium text-gray-500">{monthName}</div>
                  <div className="text-2xl font-bold text-gray-900">{year}</div>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="ml-28 space-y-4 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
                {monthEvents.map((event, index) => {
                  const Icon = getEventIcon(event.type);
                  const statusBadge = getStatusBadge(event.status);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-8"
                    >
                      <div
                        className="absolute left-0 top-3 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: event.color }}
                      />

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: event.color + '20' }}
                            >
                              <Icon style={{ color: event.color }} size={20} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-500">{event.project}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{event.startDate.toLocaleDateString()}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader
        title="Calendar & Timeline"
        subtitle="View project schedules, deadlines, and milestones"
        icon={Calendar}
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Timeline
              </button>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Events</option>
              <option value="deadline">Deadlines</option>
              <option value="milestone">Milestones</option>
              <option value="meeting">Meetings</option>
              <option value="production">Productions</option>
            </select>

            {/* Add Event Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Plus size={16} />
              <span>New Event</span>
            </button>
          </div>
        }
      />

      <div className="p-8">
        {viewMode === 'month' && (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <MonthView />
          </>
        )}

        {viewMode === 'timeline' && <TimelineView />}

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  <div
                    className="h-2"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: selectedEvent.color + '20' }}
                        >
                          {(() => {
                            const Icon = getEventIcon(selectedEvent.type);
                            return <Icon style={{ color: selectedEvent.color }} size={24} />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                          <p className="text-sm text-gray-500">{selectedEvent.project}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={18} />
                        <span className="text-gray-900">{selectedEvent.startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      {selectedEvent.time && (
                        <div className="flex items-center gap-3">
                          <Clock className="text-gray-400" size={18} />
                          <span className="text-gray-900">{selectedEvent.time}</span>
                        </div>
                      )}
                      {selectedEvent.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="text-gray-400" size={18} />
                          <span className="text-gray-900">{selectedEvent.location}</span>
                        </div>
                      )}
                      {selectedEvent.attendees && (
                        <div className="flex items-start gap-3">
                          <Users className="text-gray-400 mt-0.5" size={18} />
                          <div className="flex-1">
                            <div className="text-sm text-gray-600">
                              {selectedEvent.attendees.join(', ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedEvent.description && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600">{selectedEvent.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Edit Event
                      </button>
                      <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
