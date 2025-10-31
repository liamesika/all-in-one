'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Briefcase, User } from 'lucide-react';
import { LawHeader } from '@/components/dashboard/LawHeader';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LawEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  location?: string;
  case?: { id: string; caseNumber: string; title: string };
  client?: { id: string; name: string; email: string };
}

export function CalendarPageClient() {
  const { lang } = useLang();
  const [events, setEvents] = useState<LawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const startDate = getStartDate();
      const endDate = getEndDate();

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/law/calendar?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (view === 'month') {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day;
    return new Date(currentDate.setDate(diff));
  };

  const getEndDate = () => {
    if (view === 'month') {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }
    const start = getStartDate();
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hearing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      deadline: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      consultation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[type] || colors.meeting;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <LawHeader />

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'יומן' : 'Calendar'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'he' ? 'נהל אירועים ופגישות' : 'Manage events and meetings'}
                </p>
              </div>
            </div>
            <UniversalButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              {lang === 'he' ? 'אירוע חדש' : 'New Event'}
            </UniversalButton>
          </div>

          <UniversalCard variant="elevated" className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <UniversalButton variant="secondary" size="sm" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-5 h-5" />
                  </UniversalButton>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <UniversalButton variant="secondary" size="sm" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-5 h-5" />
                  </UniversalButton>
                </div>
                <UniversalButton variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
                  {lang === 'he' ? 'היום' : 'Today'}
                </UniversalButton>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-sm text-gray-600 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}

                  {getDaysInMonth().map((date, index) => {
                    const dayEvents = getEventsForDay(date);
                    const isToday = date && date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border rounded-lg ${
                          date ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                        } ${isToday ? 'border-amber-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.eventType)}`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </UniversalCard>

          <UniversalCard variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">{lang === 'he' ? 'אירועים קרובים' : 'Upcoming Events'}</h3>
            </CardHeader>
            <CardBody>
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{lang === 'he' ? 'אין אירועים' : 'No events'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 10).map(event => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getEventTypeColor(event.eventType)}`}>
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.eventDate).toLocaleString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.case && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {event.case.caseNumber}
                            </div>
                          )}
                          {event.client && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.client.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </UniversalCard>
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchEvents(); }} lang={lang} />
      )}
    </div>
  );
}

function CreateEventModal({ onClose, onSuccess, lang }: { onClose: () => void; onSuccess: () => void; lang: string }) {
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; title: string }>>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    title: '', description: '', eventDate: '', eventType: 'meeting', location: '', caseId: '', clientId: '', reminderMinutes: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCasesAndClients();
  }, []);

  const fetchCasesAndClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const [casesRes, clientsRes] = await Promise.all([
        fetch('/api/law/cases?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/clients?limit=100', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.cases);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const response = await fetch('/api/law/calendar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{lang === 'he' ? 'אירוע חדש' : 'New Event'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'כותרת *' : 'Title *'}</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'תיאור' : 'Description'}</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={3} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'תאריך ושעה *' : 'Date & Time *'}</label>
              <input required type="datetime-local" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'סוג *' : 'Type *'}</label>
              <select required value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="meeting">Meeting</option>
                <option value="hearing">Hearing</option>
                <option value="deadline">Deadline</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'מיקום' : 'Location'}</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'תזכורת (דקות)' : 'Reminder (minutes)'}</label>
              <input type="number" value={formData.reminderMinutes} onChange={(e) => setFormData({...formData, reminderMinutes: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'תיק' : 'Case'}</label>
              <select value={formData.caseId} onChange={(e) => setFormData({...formData, caseId: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="">None</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{lang === 'he' ? 'לקוח' : 'Client'}</label>
              <select value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="">None</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <UniversalButton type="button" variant="secondary" size="md" onClick={onClose} disabled={loading} className="flex-1">Cancel</UniversalButton>
            <UniversalButton type="submit" variant="primary" size="md" disabled={loading} className="flex-1">{loading ? 'Creating...' : 'Create'}</UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
