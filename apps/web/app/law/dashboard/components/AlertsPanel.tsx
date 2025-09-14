'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface Alert {
  id: string;
  type: 'overdue' | 'sla_breach' | 'unassigned' | 'approval_pending' | 'deadline_risk' | 'financial' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedMatterId?: string;
  relatedMatterTitle?: string;
  assignedTo?: string;
  dueDate?: string;
  value?: number;
}

interface AlertsPanelProps {
  data?: Alert[];
  onAlertClick?: (alertId: string) => void;
  onMatterClick?: (matterId: string) => void;
}

export function AlertsPanel({ data, onAlertClick, onMatterClick }: AlertsPanelProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'unread'>('all');

  const mockAlerts: Alert[] = data?.length ? data : [
    {
      id: '1',
      type: 'overdue',
      severity: 'critical',
      title: 'Motion Filing Overdue',
      description: 'Motion to dismiss deadline passed 2 days ago',
      timestamp: '2024-01-22T10:00:00Z',
      isRead: false,
      actionRequired: true,
      relatedMatterId: 'matter1',
      relatedMatterTitle: 'Smith vs. Johnson Construction',
      assignedTo: 'יעקב כהן',
      dueDate: '2024-01-20T15:00:00Z'
    },
    {
      id: '2',
      type: 'sla_breach',
      severity: 'high',
      title: 'Client Response SLA Breach',
      description: 'Client email response time exceeded 24h SLA',
      timestamp: '2024-01-23T14:30:00Z',
      isRead: false,
      actionRequired: true,
      relatedMatterId: 'matter2',
      relatedMatterTitle: 'TechCorp Acquisition',
      assignedTo: 'שרה לוי'
    },
    {
      id: '3',
      type: 'unassigned',
      severity: 'high',
      title: 'Unassigned Matter',
      description: 'New corporate matter requires attorney assignment',
      timestamp: '2024-01-23T09:15:00Z',
      isRead: true,
      actionRequired: true,
      relatedMatterId: 'matter7',
      relatedMatterTitle: 'StartupCo Legal Review'
    },
    {
      id: '4',
      type: 'approval_pending',
      severity: 'medium',
      title: 'Document Approval Pending',
      description: '3 contracts awaiting partner approval for 48+ hours',
      timestamp: '2024-01-23T08:45:00Z',
      isRead: true,
      actionRequired: true,
      value: 3
    },
    {
      id: '5',
      type: 'deadline_risk',
      severity: 'high',
      title: 'High Deadline Risk Score',
      description: 'Discovery deadline has 85% risk of being missed',
      timestamp: '2024-01-23T16:20:00Z',
      isRead: false,
      actionRequired: true,
      relatedMatterId: 'matter3',
      relatedMatterTitle: 'Employment Dispute - Garcia',
      assignedTo: 'דוד רוזנברג',
      dueDate: '2024-01-26T17:00:00Z'
    },
    {
      id: '6',
      type: 'financial',
      severity: 'medium',
      title: 'Overdue Invoice Payment',
      description: 'Client payment 30+ days overdue',
      timestamp: '2024-01-23T11:00:00Z',
      isRead: true,
      actionRequired: true,
      relatedMatterId: 'matter5',
      relatedMatterTitle: 'Corporate Compliance Review',
      value: 15000
    },
    {
      id: '7',
      type: 'system',
      severity: 'low',
      title: 'Document Template Updated',
      description: 'NDA template v2.1 now available',
      timestamp: '2024-01-23T07:30:00Z',
      isRead: true,
      actionRequired: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}${lang === 'he' ? 'ד' : 'm'} ${lang === 'he' ? 'לפני' : 'ago'}`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}${lang === 'he' ? 'ש' : 'h'} ${lang === 'he' ? 'לפני' : 'ago'}`;
    return `${Math.floor(diffMinutes / 1440)}${lang === 'he' ? 'י' : 'd'} ${lang === 'he' ? 'לפני' : 'ago'}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue': return '🚨';
      case 'sla_breach': return '⏰';
      case 'unassigned': return '👤';
      case 'approval_pending': return '📋';
      case 'deadline_risk': return '⚠️';
      case 'financial': return '💳';
      case 'system': return '🔧';
      default: return '❗';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'bg-red-50 border-l-red-500';
      case 'sla_breach': return 'bg-orange-50 border-l-orange-500';
      case 'unassigned': return 'bg-yellow-50 border-l-yellow-500';
      case 'approval_pending': return 'bg-blue-50 border-l-blue-500';
      case 'deadline_risk': return 'bg-purple-50 border-l-purple-500';
      case 'financial': return 'bg-green-50 border-l-green-500';
      case 'system': return 'bg-gray-50 border-l-gray-500';
      default: return 'bg-gray-50 border-l-gray-500';
    }
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    if (filterType === 'critical') return alert.severity === 'critical' || alert.severity === 'high';
    if (filterType === 'unread') return !alert.isRead;
    return true;
  });

  const sortedAlerts = filteredAlerts.sort((a, b) => {
    // Sort by: unread first, then by severity, then by timestamp
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
    if (severityDiff !== 0) return severityDiff;
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = mockAlerts.filter(alert => !alert.isRead).length;
  const criticalCount = mockAlerts.filter(alert => alert.severity === 'critical').length;
  const actionRequiredCount = mockAlerts.filter(alert => alert.actionRequired).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'התראות וחריגות' : 'Alerts & Exceptions'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${unreadCount} לא נקראו • ${criticalCount} קריטיות • ${actionRequiredCount} דורש פעולה`
              : `${unreadCount} unread • ${criticalCount} critical • ${actionRequiredCount} action required`
            }
          </p>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
        >
          <option value="all">{lang === 'he' ? 'הכל' : 'All'}</option>
          <option value="critical">{lang === 'he' ? 'קריטיות' : 'Critical'}</option>
          <option value="unread">{lang === 'he' ? 'לא נקראו' : 'Unread'}</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-lg font-bold text-red-600">{criticalCount}</div>
          <div className="text-xs text-red-700">{lang === 'he' ? 'קריטיות' : 'Critical'}</div>
        </div>
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{unreadCount}</div>
          <div className="text-xs text-blue-700">{lang === 'he' ? 'לא נקראו' : 'Unread'}</div>
        </div>
        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{actionRequiredCount}</div>
          <div className="text-xs text-orange-700">{lang === 'he' ? 'דורש פעולה' : 'Action Required'}</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${getTypeColor(alert.type)} ${
              !alert.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
            }`}
            onClick={() => onAlertClick?.(alert.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-lg mt-0.5">{getTypeIcon(alert.type)}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alert.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                      {lang === 'he' 
                        ? alert.severity === 'critical' ? 'קריטי'
                          : alert.severity === 'high' ? 'גבוה'
                          : alert.severity === 'medium' ? 'בינוני'
                          : 'נמוך'
                        : alert.severity
                      }
                    </span>
                    {alert.actionRequired && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-300">
                        {lang === 'he' ? 'דרוש פעולה' : 'Action'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {alert.relatedMatterTitle && (
                      <div 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMatterClick?.(alert.relatedMatterId!);
                        }}
                      >
                        📁 {alert.relatedMatterTitle}
                      </div>
                    )}
                    {alert.assignedTo && (
                      <div>👤 {alert.assignedTo}</div>
                    )}
                    {alert.value && (
                      <div>💰 {formatCurrency(alert.value)}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-2">
                <div className="text-xs text-gray-500">
                  {formatDate(alert.timestamp)}
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedAlerts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">✅</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין התראות' : 'No alerts'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'אין התראות מתאימות לפילטר הנבחר' : 'No alerts match the selected filter'}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {lang === 'he' ? 'סמן הכל כנקרא' : 'Mark All Read'}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            {lang === 'he' ? 'הגדרות התראות' : 'Alert Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}