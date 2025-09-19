'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'today' | 'overdue' | 'completed';
  matterId: string;
  matterTitle: string;
  clientName: string;
  attorney: string;
  practiceArea: string;
  type: 'court_filing' | 'discovery' | 'meeting' | 'document' | 'payment' | 'other';
  estimatedHours?: number;
  dependencies?: string[];
}

interface DeadlinesTimelineProps {
  data?: Deadline[];
  onTaskClick?: (taskId: string) => void;
  onMatterClick?: (matterId: string) => void;
}

export function DeadlinesTimeline({ data, onTaskClick, onMatterClick }: DeadlinesTimelineProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'upcoming'>('all');

  const mockDeadlines: Deadline[] = data?.length ? data : [
    {
      id: '1',
      title: 'File Motion to Dismiss',
      description: 'Submit motion to dismiss with supporting documents',
      dueDate: '2024-01-22T15:00:00Z',
      priority: 'critical',
      status: 'overdue',
      matterId: 'matter1',
      matterTitle: 'Smith vs. Johnson Construction',
      clientName: 'John Smith',
      attorney: 'יעקב כהן',
      practiceArea: 'litigation',
      type: 'court_filing',
      estimatedHours: 4
    },
    {
      id: '2',
      title: 'Contract Review Meeting',
      description: 'Review acquisition agreement with client',
      dueDate: '2024-01-25T10:00:00Z',
      priority: 'high',
      status: 'upcoming',
      matterId: 'matter2',
      matterTitle: 'TechCorp Acquisition',
      clientName: 'TechCorp Ltd.',
      attorney: 'שרה לוי',
      practiceArea: 'corporate',
      type: 'meeting',
      estimatedHours: 2
    },
    {
      id: '3',
      title: 'Discovery Response Due',
      description: 'Respond to discovery requests from opposing counsel',
      dueDate: '2024-01-26T17:00:00Z',
      priority: 'high',
      status: 'upcoming',
      matterId: 'matter3',
      matterTitle: 'Employment Dispute - Garcia',
      clientName: 'Maria Garcia',
      attorney: 'דוד רוזנברג',
      practiceArea: 'employment',
      type: 'discovery',
      estimatedHours: 6
    },
    {
      id: '4',
      title: 'Custody Hearing Preparation',
      description: 'Prepare documents and witness list for custody hearing',
      dueDate: '2024-01-24T09:00:00Z',
      priority: 'critical',
      status: 'today',
      matterId: 'matter4',
      matterTitle: 'Brown Family Custody',
      clientName: 'Lisa Brown',
      attorney: 'יעקב כהן',
      practiceArea: 'family',
      type: 'document',
      estimatedHours: 8
    },
    {
      id: '5',
      title: 'Client Payment Due',
      description: 'Follow up on overdue invoice payment',
      dueDate: '2024-01-20T23:59:00Z',
      priority: 'medium',
      status: 'overdue',
      matterId: 'matter5',
      matterTitle: 'Corporate Compliance Review',
      clientName: 'Global Industries',
      attorney: 'שרה לוי',
      practiceArea: 'corporate',
      type: 'payment',
      estimatedHours: 1
    },
    {
      id: '6',
      title: 'Settlement Conference',
      description: 'Attend settlement conference with mediator',
      dueDate: '2024-01-27T14:00:00Z',
      priority: 'high',
      status: 'upcoming',
      matterId: 'matter6',
      matterTitle: 'Property Damage Claim',
      clientName: 'Home Owners Assoc.',
      attorney: 'דוד רוזנברג',
      practiceArea: 'litigation',
      type: 'meeting',
      estimatedHours: 4
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return lang === 'he' ? 'היום' : 'Today';
    if (diffDays === 1) return lang === 'he' ? 'מחר' : 'Tomorrow';
    if (diffDays === -1) return lang === 'he' ? 'אתמול' : 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} ${lang === 'he' ? 'ימים באיחור' : 'days overdue'}`;
    if (diffDays <= 7) return `${diffDays} ${lang === 'he' ? 'ימים' : 'days'}`;
    
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'border-l-red-500 bg-red-50';
      case 'today': return 'border-l-orange-500 bg-orange-50';
      case 'upcoming': return 'border-l-blue-500 bg-blue-50';
      case 'completed': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'court_filing': return '⚖️';
      case 'discovery': return '🔍';
      case 'meeting': return '👥';
      case 'document': return '📄';
      case 'payment': return '💳';
      default: return '📋';
    }
  };

  const getPracticeAreaColor = (area: string) => {
    switch (area) {
      case 'litigation': return 'bg-red-100 text-red-700';
      case 'corporate': return 'bg-blue-100 text-blue-700';
      case 'family': return 'bg-purple-100 text-purple-700';
      case 'employment': return 'bg-green-100 text-green-700';
      case 'criminal': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDeadlines = mockDeadlines.filter(deadline => {
    if (filterStatus === 'overdue') return deadline.status === 'overdue';
    if (filterStatus === 'upcoming') return deadline.status === 'upcoming' || deadline.status === 'today';
    return true;
  });

  const sortedDeadlines = filteredDeadlines.sort((a, b) => {
    // Overdue items first, then by due date
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const overdueCount = mockDeadlines.filter(d => d.status === 'overdue').length;
  const todayCount = mockDeadlines.filter(d => d.status === 'today').length;
  const upcomingCount = mockDeadlines.filter(d => d.status === 'upcoming').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'ציר זמן דדליינים' : 'Deadlines Timeline'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${overdueCount} באיחור • ${todayCount} היום • ${upcomingCount} קרובים`
              : `${overdueCount} overdue • ${todayCount} today • ${upcomingCount} upcoming`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
          >
            <option value="all">{lang === 'he' ? 'הכל' : 'All'}</option>
            <option value="overdue">{lang === 'he' ? 'באיחור' : 'Overdue'}</option>
            <option value="upcoming">{lang === 'he' ? 'קרובים' : 'Upcoming'}</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
          >
            <option value="today">{lang === 'he' ? 'היום' : 'Today'}</option>
            <option value="week">{lang === 'he' ? 'השבוע' : 'This Week'}</option>
            <option value="month">{lang === 'he' ? 'החודש' : 'This Month'}</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-xs text-red-700">{lang === 'he' ? 'באיחור' : 'Overdue'}</div>
        </div>
        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{todayCount}</div>
          <div className="text-xs text-orange-700">{lang === 'he' ? 'היום' : 'Today'}</div>
        </div>
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
          <div className="text-xs text-blue-700">{lang === 'he' ? 'קרובים' : 'Upcoming'}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedDeadlines.map((deadline) => (
          <div
            key={deadline.id}
            className={`border-l-4 p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${getStatusColor(deadline.status)}`}
            onClick={() => onTaskClick?.(deadline.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getTypeIcon(deadline.type)}</span>
                  <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(deadline.priority)}`}>
                    {lang === 'he' 
                      ? deadline.priority === 'critical' ? 'קריטי'
                        : deadline.priority === 'high' ? 'גבוה'
                        : deadline.priority === 'medium' ? 'בינוני'
                        : 'נמוך'
                      : deadline.priority
                    }
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <div 
                    className="cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMatterClick?.(deadline.matterId);
                    }}
                  >
                    📁 {deadline.matterTitle}
                  </div>
                  <div>👤 {deadline.clientName}</div>
                  <div>⚖️ {deadline.attorney}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPracticeAreaColor(deadline.practiceArea)}`}>
                    {lang === 'he' 
                      ? deadline.practiceArea === 'litigation' ? 'ליטיגציה'
                        : deadline.practiceArea === 'corporate' ? 'תאגידי'
                        : deadline.practiceArea === 'family' ? 'משפחה'
                        : deadline.practiceArea === 'employment' ? 'עבודה'
                        : deadline.practiceArea
                      : deadline.practiceArea
                    }
                  </span>
                  {deadline.estimatedHours && (
                    <span className="text-xs text-gray-500">
                      ⏱️ {deadline.estimatedHours}{lang === 'he' ? 'ש' : 'h'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className={`text-sm font-medium ${
                  deadline.status === 'overdue' ? 'text-red-600' : 
                  deadline.status === 'today' ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {formatDate(deadline.dueDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(deadline.dueDate)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedDeadlines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📅</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין דדליינים' : 'No deadlines'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'אין דדליינים מתאימים לפילטר הנבחר' : 'No deadlines match the selected filter'}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {lang === 'he' ? '+ משימה חדשה' : '+ New Task'}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            {lang === 'he' ? 'הצג יומן' : 'View Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
}