'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface Deadline {
  id: string;
  title: string;
  dueAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigneeName: string;
  matterTitle: string;
  clientName: string;
  effortHours: number;
  daysUntilDue: number;
}

interface DeadlinesTimelineProps {
  data: Deadline[];
  onTaskClick?: (taskId: string) => void;
  onMatterClick?: (matterId: string) => void;
}

export function DeadlinesTimeline({ data, onTaskClick, onMatterClick }: DeadlinesTimelineProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Mock data if no data provided
  const mockDeadlines: Deadline[] = data?.length ? data : [
    {
      id: '1',
      title: 'Contract Review - Smith Property',
      dueAt: '2024-01-15T10:00:00Z',
      priority: 'high',
      status: 'overdue',
      assigneeName: 'Sarah Cohen',
      matterTitle: 'Smith Residential Purchase',
      clientName: 'John Smith',
      effortHours: 4,
      daysUntilDue: -2
    },
    {
      id: '2',
      title: 'Title Search Completion',
      dueAt: '2024-01-16T14:00:00Z',
      priority: 'critical',
      status: 'in_progress',
      assigneeName: 'David Levi',
      matterTitle: 'Downtown Office Building',
      clientName: 'ABC Corp',
      effortHours: 6,
      daysUntilDue: 1
    },
    {
      id: '3',
      title: 'Document Preparation',
      dueAt: '2024-01-18T09:00:00Z',
      priority: 'medium',
      status: 'pending',
      assigneeName: 'Rachel Gold',
      matterTitle: 'Residential Lease Agreement',
      clientName: 'Maria Garcia',
      effortHours: 3,
      daysUntilDue: 3
    },
    {
      id: '4',
      title: 'Client Meeting Preparation',
      dueAt: '2024-01-20T11:00:00Z',
      priority: 'low',
      status: 'pending',
      assigneeName: 'Michael Ben-David',
      matterTitle: 'Commercial Development',
      clientName: 'XYZ Holdings',
      effortHours: 2,
      daysUntilDue: 5
    }
  ];

  const deadlines = mockDeadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDaysUntilDue = (days: number) => {
    if (days < 0) {
      return lang === 'he' ? `באיחור ${Math.abs(days)} ימים` : `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return lang === 'he' ? 'היום' : 'Today';
    } else if (days === 1) {
      return lang === 'he' ? 'מחר' : 'Tomorrow';
    } else {
      return lang === 'he' ? `בעוד ${days} ימים` : `In ${days} days`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'ציר זמן דדליינים' : 'Deadlines Timeline'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' ? 'משימות קרובות ובאיחור' : 'Upcoming and overdue tasks'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'he' ? 'ציר זמן' : 'Timeline'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'he' ? 'רשימה' : 'List'}
            </button>
          </div>

          <button 
            onClick={() => onTaskClick?.('all')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {lang === 'he' ? 'הצג הכל' : 'View All'}
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Today Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-4">
            {deadlines.map((deadline, index) => (
              <div key={deadline.id} className="relative flex items-start gap-4">
                {/* Timeline Dot */}
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(deadline.priority)} ring-2 ring-white`}></div>
                  {deadline.status === 'overdue' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Content Card */}
                <div 
                  className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onTaskClick?.(deadline.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deadline.status)}`}>
                          {lang === 'he' 
                            ? deadline.status === 'overdue' ? 'באיחור'
                              : deadline.status === 'in_progress' ? 'בעבודה'
                              : deadline.status === 'pending' ? 'ממתין'
                              : 'הושלם'
                            : deadline.status.replace('_', ' ')
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>
                            👤 {deadline.assigneeName}
                          </span>
                          <span>
                            📁 <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onMatterClick?.(deadline.id);
                              }}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {deadline.matterTitle}
                            </button>
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>🏢 {deadline.clientName}</span>
                          <span>⏱️ {deadline.effortHours}h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(deadline.dueAt)}
                      </div>
                      <div className={`text-xs font-medium mt-1 ${
                        deadline.daysUntilDue < 0 ? 'text-red-600' : 
                        deadline.daysUntilDue <= 1 ? 'text-orange-600' : 
                        'text-gray-600'
                      }`}>
                        {formatDaysUntilDue(deadline.daysUntilDue)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'משימה' : 'Task'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'אחראי' : 'Assignee'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'תיק' : 'Matter'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'דדליין' : 'Due Date'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  {lang === 'he' ? 'עדיפות' : 'Priority'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deadlines.map((deadline) => (
                <tr 
                  key={deadline.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTaskClick?.(deadline.id)}
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{deadline.title}</div>
                    <div className="text-sm text-gray-500">{deadline.clientName}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900">
                    {deadline.assigneeName}
                  </td>
                  <td className="px-3 py-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMatterClick?.(deadline.id);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      {deadline.matterTitle}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">{formatDate(deadline.dueAt)}</div>
                    <div className={`text-xs font-medium ${
                      deadline.daysUntilDue < 0 ? 'text-red-600' : 
                      deadline.daysUntilDue <= 1 ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      {formatDaysUntilDue(deadline.daysUntilDue)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deadline.status)}`}>
                      {lang === 'he' 
                        ? deadline.status === 'overdue' ? 'באיחור'
                          : deadline.status === 'in_progress' ? 'בעבודה'
                          : deadline.status === 'pending' ? 'ממתין'
                          : 'הושלם'
                        : deadline.status.replace('_', ' ')
                      }
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(deadline.priority)}`}></div>
                      <span className="text-sm text-gray-600">
                        {lang === 'he' 
                          ? deadline.priority === 'critical' ? 'קריטית'
                            : deadline.priority === 'high' ? 'גבוהה'
                            : deadline.priority === 'medium' ? 'בינונית'
                            : 'נמוכה'
                          : deadline.priority
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deadlines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📅</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין דדליינים קרבים' : 'No upcoming deadlines'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'כל המשימות מעודכנות' : 'All tasks are up to date'}
          </div>
        </div>
      )}
    </div>
  );
}