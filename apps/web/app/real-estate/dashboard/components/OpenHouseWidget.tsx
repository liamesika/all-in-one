'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface OpenHouseEvent {
  id: string;
  propertyId: string;
  propertyTitle: string;
  address: string;
  city: string;
  price: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  expectedVisitors: number;
  actualVisitors: number;
  registeredVisitors: number;
  leadGenerated: number;
  qualifiedLeads: number;
  agent: string;
  feedback: {
    averageRating: number;
    positiveComments: number;
    concerns: number;
  };
  metrics: {
    timeSpent: number; // average minutes
    returnVisitors: number;
    brochuresTaken: number;
    contactInfoCollected: number;
  };
}

interface OpenHouseWidgetProps {
  data?: OpenHouseEvent[];
  onViewDetails?: () => void;
  onEventClick?: (eventId: string) => void;
}

export function OpenHouseWidget({ data, onViewDetails, onEventClick }: OpenHouseWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  const mockEvents: OpenHouseEvent[] = data?.length ? data : [
    {
      id: '1',
      propertyId: 'prop1',
      propertyTitle: 'Luxury Penthouse with Sea View',
      address: 'Rothschild Blvd 25',
      city: 'Tel Aviv',
      price: 4200000,
      date: '2024-01-20',
      startTime: '10:00',
      endTime: '13:00',
      status: 'scheduled',
      expectedVisitors: 25,
      actualVisitors: 0,
      registeredVisitors: 18,
      leadGenerated: 0,
      qualifiedLeads: 0,
      agent: 'Sarah Cohen',
      feedback: {
        averageRating: 0,
        positiveComments: 0,
        concerns: 0
      },
      metrics: {
        timeSpent: 0,
        returnVisitors: 0,
        brochuresTaken: 0,
        contactInfoCollected: 0
      }
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyTitle: 'Modern 3BR Apartment',
      address: 'Ben Gurion St 42',
      city: 'Ramat Gan',
      price: 2800000,
      date: '2024-01-21',
      startTime: '11:00',
      endTime: '14:00',
      status: 'active',
      expectedVisitors: 15,
      actualVisitors: 12,
      registeredVisitors: 15,
      leadGenerated: 8,
      qualifiedLeads: 3,
      agent: 'David Levi',
      feedback: {
        averageRating: 4.2,
        positiveComments: 6,
        concerns: 2
      },
      metrics: {
        timeSpent: 28,
        returnVisitors: 2,
        brochuresTaken: 10,
        contactInfoCollected: 8
      }
    },
    {
      id: '3',
      propertyId: 'prop3',
      propertyTitle: 'Family House with Garden',
      address: 'Hacarmel St 28',
      city: 'Jerusalem',
      price: 3500000,
      date: '2024-01-14',
      startTime: '10:00',
      endTime: '13:00',
      status: 'completed',
      expectedVisitors: 20,
      actualVisitors: 22,
      registeredVisitors: 16,
      leadGenerated: 14,
      qualifiedLeads: 6,
      agent: 'Rachel Gold',
      feedback: {
        averageRating: 4.5,
        positiveComments: 12,
        concerns: 3
      },
      metrics: {
        timeSpent: 35,
        returnVisitors: 4,
        brochuresTaken: 18,
        contactInfoCollected: 14
      }
    },
    {
      id: '4',
      propertyId: 'prop4',
      propertyTitle: 'Studio Near University',
      address: 'Einstein St 7',
      city: 'Jerusalem',
      price: 1200000,
      date: '2024-01-13',
      startTime: '14:00',
      endTime: '17:00',
      status: 'completed',
      expectedVisitors: 12,
      actualVisitors: 8,
      registeredVisitors: 10,
      leadGenerated: 5,
      qualifiedLeads: 2,
      agent: 'Michael Ben-David',
      feedback: {
        averageRating: 3.8,
        positiveComments: 4,
        concerns: 2
      },
      metrics: {
        timeSpent: 22,
        returnVisitors: 1,
        brochuresTaken: 6,
        contactInfoCollected: 5
      }
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return '📅';
      case 'active': return '🔴';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  const filteredEvents = mockEvents.filter(event => {
    switch (activeTab) {
      case 'upcoming': return event.status === 'scheduled';
      case 'active': return event.status === 'active';
      case 'completed': return event.status === 'completed';
      default: return true;
    }
  });

  const completedEvents = mockEvents.filter(event => event.status === 'completed');
  const totalVisitors = completedEvents.reduce((sum, event) => sum + event.actualVisitors, 0);
  const totalLeads = completedEvents.reduce((sum, event) => sum + event.leadGenerated, 0);
  const totalQualifiedLeads = completedEvents.reduce((sum, event) => sum + event.qualifiedLeads, 0);
  const avgRating = completedEvents.reduce((sum, event) => sum + event.feedback.averageRating, 0) / Math.max(1, completedEvents.length);
  const conversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors * 100) : 0;

  const tabs = [
    { id: 'upcoming', label: lang === 'he' ? 'מתוכננים' : 'Upcoming' },
    { id: 'active', label: lang === 'he' ? 'פעילים' : 'Active' },
    { id: 'completed', label: lang === 'he' ? 'הושלמו' : 'Completed' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'כלי ניהול בתים פתוחים' : 'Open House Toolkit'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${totalVisitors} מבקרים • ${conversionRate.toFixed(1)}% המרה ללידים`
              : `${totalVisitors} visitors • ${conversionRate.toFixed(1)}% lead conversion`
            }
          </p>
        </div>
        
        <button 
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {lang === 'he' ? 'הצג פרטים' : 'View Details'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{totalVisitors}</div>
            <div className="text-xs text-gray-600">
              {lang === 'he' ? 'סה״כ מבקרים' : 'Total Visitors'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{totalLeads}</div>
            <div className="text-xs text-gray-600">
              {lang === 'he' ? 'לידים שנוצרו' : 'Leads Generated'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{totalQualifiedLeads}</div>
            <div className="text-xs text-gray-600">
              {lang === 'he' ? 'לידים מוכשרים' : 'Qualified Leads'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">{avgRating.toFixed(1)}⭐</div>
            <div className="text-xs text-gray-600">
              {lang === 'he' ? 'ציון ממוצע' : 'Avg Rating'}
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-medium mb-1">
              {lang === 'he' 
                ? activeTab === 'upcoming' ? 'אין בתים פתוחים מתוכננים'
                  : activeTab === 'active' ? 'אין בתים פתוחים פעילים'
                  : 'אין בתים פתוחים שהושלמו'
                : activeTab === 'upcoming' ? 'No upcoming open houses'
                  : activeTab === 'active' ? 'No active open houses'
                  : 'No completed open houses'
              }
            </div>
            <div className="text-sm">
              {lang === 'he' ? 'תזמן בית פתוח חדש כדי להתחיל' : 'Schedule a new open house to get started'}
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onEventClick?.(event.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getStatusIcon(event.status)}</span>
                    <h5 className="font-medium text-gray-900">{event.propertyTitle}</h5>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(event.status)}`}>
                      {lang === 'he' 
                        ? event.status === 'scheduled' ? 'מתוכנן'
                          : event.status === 'active' ? 'פעיל'
                          : event.status === 'completed' ? 'הושלם'
                          : 'בוטל'
                        : event.status
                      }
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    📍 {event.address}, {event.city} • {formatCurrency(event.price)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    📅 {formatDate(event.date)} • ⏰ {formatTime(event.startTime)}-{formatTime(event.endTime)} • 👤 {event.agent}
                  </div>

                  {event.status === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'נרשמו:' : 'Registered:'}</span>
                        <div className="font-medium">{event.registeredVisitors}/{event.expectedVisitors}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'צפוי:' : 'Expected:'}</span>
                        <div className="font-medium">{event.expectedVisitors} {lang === 'he' ? 'מבקרים' : 'visitors'}</div>
                      </div>
                    </div>
                  )}

                  {(event.status === 'active' || event.status === 'completed') && (
                    <div className="grid grid-cols-4 gap-4 text-xs mt-3">
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'מבקרים:' : 'Visitors:'}</span>
                        <div className="font-medium">{event.actualVisitors}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'לידים:' : 'Leads:'}</span>
                        <div className="font-medium">{event.leadGenerated}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'מוכשרים:' : 'Qualified:'}</span>
                        <div className="font-medium">{event.qualifiedLeads}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'זמן ממוצע:' : 'Avg Time:'}</span>
                        <div className="font-medium">{event.metrics.timeSpent}m</div>
                      </div>
                    </div>
                  )}

                  {event.status === 'completed' && event.feedback.averageRating > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'ציון:' : 'Rating:'}</span>
                          <span className="font-medium ml-1">{event.feedback.averageRating.toFixed(1)}⭐</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'חיוביים:' : 'Positive:'}</span>
                          <span className="font-medium ml-1">{event.feedback.positiveComments}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'דאגות:' : 'Concerns:'}</span>
                          <span className="font-medium ml-1">{event.feedback.concerns}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'חוזרים:' : 'Return:'}</span>
                          <span className="font-medium ml-1">{event.metrics.returnVisitors}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {activeTab === 'upcoming' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              {lang === 'he' ? '+ תזמן בית פתוח' : '+ Schedule Open House'}
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              {lang === 'he' ? 'ייבא אירועים' : 'Import Events'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}