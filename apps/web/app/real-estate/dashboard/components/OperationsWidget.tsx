'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'lead' | 'property' | 'document' | 'deadline' | 'system' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  assignedTo?: string;
  relatedId?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'follow_up' | 'document' | 'viewing' | 'inspection' | 'closing' | 'marketing';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo: string;
  relatedProperty?: string;
  relatedClient?: string;
  estimatedTime: number; // minutes
}

interface OperationsWidgetProps {
  alerts?: Alert[];
  tasks?: Task[];
  onViewDetails?: () => void;
  onAlertClick?: (alertId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export function OperationsWidget({ alerts, tasks, onViewDetails, onAlertClick, onTaskClick }: OperationsWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'alerts' | 'tasks' | 'metrics'>('alerts');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'actionRequired'>('all');

  const mockAlerts: Alert[] = alerts?.length ? alerts : [
    {
      id: '1',
      type: 'critical',
      category: 'deadline',
      title: 'Contract Expiration Warning',
      description: 'Property listing contract for Rothschild Blvd 25 expires in 3 days',
      timestamp: '2024-01-20T14:30:00Z',
      isRead: false,
      actionRequired: true,
      assignedTo: 'Sarah Cohen',
      relatedId: 'prop1',
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      category: 'lead',
      title: 'Uncontacted Hot Lead',
      description: 'High-value lead from Meta campaign has not been contacted for 4 hours',
      timestamp: '2024-01-20T10:15:00Z',
      isRead: false,
      actionRequired: true,
      assignedTo: 'David Levi',
      relatedId: 'lead123',
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      category: 'document',
      title: 'Document Upload Required',
      description: 'Property photos needed for Dizengoff St listing',
      timestamp: '2024-01-20T09:45:00Z',
      isRead: true,
      actionRequired: true,
      assignedTo: 'Rachel Gold',
      relatedId: 'prop3',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'warning',
      category: 'property',
      title: 'Price Reduction Recommended',
      description: 'Commercial property has been on market for 90+ days with no offers',
      timestamp: '2024-01-20T08:20:00Z',
      isRead: false,
      actionRequired: true,
      assignedTo: 'Michael Ben-David',
      relatedId: 'prop5',
      priority: 'medium'
    },
    {
      id: '5',
      type: 'success',
      category: 'system',
      title: 'Automated Campaign Success',
      description: 'Meta campaign generated 12 new leads in the last 24 hours',
      timestamp: '2024-01-20T07:00:00Z',
      isRead: true,
      actionRequired: false,
      priority: 'low'
    }
  ];

  const mockTasks: Task[] = tasks?.length ? tasks : [
    {
      id: '1',
      title: 'Follow up with hot lead',
      description: 'Call David Cohen about penthouse viewing',
      type: 'follow_up',
      status: 'overdue',
      priority: 'high',
      dueDate: '2024-01-19T15:00:00Z',
      assignedTo: 'Sarah Cohen',
      relatedProperty: 'Luxury Penthouse with Sea View',
      relatedClient: 'David Cohen',
      estimatedTime: 30
    },
    {
      id: '2',
      title: 'Upload property inspection report',
      description: 'Add engineering inspection report to property file',
      type: 'document',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-01-20T17:00:00Z',
      assignedTo: 'David Levi',
      relatedProperty: 'Modern 3BR Apartment',
      estimatedTime: 15
    },
    {
      id: '3',
      title: 'Schedule property viewing',
      description: 'Coordinate viewing for interested family',
      type: 'viewing',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-21T10:00:00Z',
      assignedTo: 'Rachel Gold',
      relatedProperty: 'Family House with Garden',
      relatedClient: 'Rosenberg Family',
      estimatedTime: 60
    },
    {
      id: '4',
      title: 'Prepare closing documents',
      description: 'Draft purchase agreement and coordinate with lawyer',
      type: 'closing',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-22T14:00:00Z',
      assignedTo: 'Michael Ben-David',
      relatedProperty: 'Studio Near University',
      estimatedTime: 120
    },
    {
      id: '5',
      title: 'Update marketing materials',
      description: 'Refresh social media posts and portal listings',
      type: 'marketing',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-01-19T12:00:00Z',
      assignedTo: 'Sarah Cohen',
      relatedProperty: 'Commercial Space Downtown',
      estimatedTime: 45
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead': return '🎯';
      case 'property': return '🏠';
      case 'document': return '📄';
      case 'deadline': return '⏰';
      case 'system': return '⚙️';
      case 'compliance': return '📋';
      default: return '📢';
    }
  };

  const getTaskColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return '📞';
      case 'document': return '📄';
      case 'viewing': return '👁️';
      case 'inspection': return '🔍';
      case 'closing': return '🤝';
      case 'marketing': return '📢';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    switch (filterType) {
      case 'critical': return alert.type === 'critical';
      case 'warning': return alert.type === 'warning';
      case 'actionRequired': return alert.actionRequired;
      default: return true;
    }
  });

  const unreadAlerts = mockAlerts.filter(alert => !alert.isRead).length;
  const criticalAlerts = mockAlerts.filter(alert => alert.type === 'critical').length;
  const actionRequiredAlerts = mockAlerts.filter(alert => alert.actionRequired).length;
  const overdueTasks = mockTasks.filter(task => task.status === 'overdue').length;
  const pendingTasks = mockTasks.filter(task => task.status === 'pending').length;
  const completedTasks = mockTasks.filter(task => task.status === 'completed').length;

  const tabs = [
    { id: 'alerts', label: lang === 'he' ? 'התראות' : 'Alerts' },
    { id: 'tasks', label: lang === 'he' ? 'משימות' : 'Tasks' },
    { id: 'metrics', label: lang === 'he' ? 'מדדים' : 'Metrics' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'תפעול והתראות' : 'Operations & Alerts'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${unreadAlerts} התראות חדשות • ${overdueTasks} משימות בפיגור`
              : `${unreadAlerts} new alerts • ${overdueTasks} overdue tasks`
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

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {lang === 'he' ? 'התראות פעילות' : 'Active Alerts'}
            </h4>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
            >
              <option value="all">{lang === 'he' ? 'כל ההתראות' : 'All Alerts'}</option>
              <option value="critical">{lang === 'he' ? 'קריטיות' : 'Critical'}</option>
              <option value="warning">{lang === 'he' ? 'אזהרות' : 'Warnings'}</option>
              <option value="actionRequired">{lang === 'he' ? 'דורש פעולה' : 'Action Required'}</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  alert.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                }`}
                onClick={() => onAlertClick?.(alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAlertIcon(alert.type)}</span>
                      <span className="text-sm">{getCategoryIcon(alert.category)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`font-medium ${alert.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {alert.title}
                        </h5>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getAlertColor(alert.type)}`}>
                          {lang === 'he' 
                            ? alert.type === 'critical' ? 'קריטי'
                              : alert.type === 'warning' ? 'אזהרה'
                              : alert.type === 'info' ? 'מידע'
                              : 'הצלחה'
                            : alert.type
                          }
                        </span>
                        {alert.actionRequired && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                            {lang === 'he' ? 'דורש פעולה' : 'Action Required'}
                          </span>
                        )}
                      </div>
                      
                      <div className={`text-sm mb-2 ${alert.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                        {alert.description}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {alert.assignedTo && (
                          <div>👤 {alert.assignedTo}</div>
                        )}
                        <div>⏰ {formatTime(alert.timestamp)} • {formatDate(alert.timestamp)}</div>
                        <div className={`font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()} {lang === 'he' ? 'עדיפות' : 'PRIORITY'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!alert.isRead && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'משימות פעילות' : 'Active Tasks'}
          </h4>

          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg">{getTaskIcon(task.type)}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTaskColor(task.status)}`}>
                          {lang === 'he' 
                            ? task.status === 'pending' ? 'ממתין'
                              : task.status === 'in_progress' ? 'בביצוע'
                              : task.status === 'completed' ? 'הושלם'
                              : 'בפיגור'
                            : task.status.replace('_', ' ')
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <div>👤 {task.assignedTo}</div>
                          {task.relatedProperty && <div>🏠 {task.relatedProperty}</div>}
                          {task.relatedClient && <div>👥 {task.relatedClient}</div>}
                        </div>
                        <div>
                          <div>📅 {formatDate(task.dueDate)} • {formatTime(task.dueDate)}</div>
                          <div>⏱️ {task.estimatedTime} {lang === 'he' ? 'דקות' : 'minutes'}</div>
                          <div className={`font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()} {lang === 'he' ? 'עדיפות' : 'PRIORITY'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'מדדי תפעול' : 'Operational Metrics'}
          </h4>

          {/* Alert Metrics */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              {lang === 'he' ? 'סטטיסטיקת התראות' : 'Alert Statistics'}
            </h5>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xl font-bold text-red-600">{criticalAlerts}</div>
                <div className="text-xs text-red-700">{lang === 'he' ? 'קריטיות' : 'Critical'}</div>
              </div>
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{unreadAlerts}</div>
                <div className="text-xs text-blue-700">{lang === 'he' ? 'לא נקראו' : 'Unread'}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{actionRequiredAlerts}</div>
                <div className="text-xs text-orange-700">{lang === 'he' ? 'דורש פעולה' : 'Action Required'}</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xl font-bold text-green-600">{mockAlerts.length}</div>
                <div className="text-xs text-green-700">{lang === 'he' ? 'סה״כ' : 'Total'}</div>
              </div>
            </div>
          </div>

          {/* Task Metrics */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              {lang === 'he' ? 'סטטיסטיקת משימות' : 'Task Statistics'}
            </h5>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xl font-bold text-red-600">{overdueTasks}</div>
                <div className="text-xs text-red-700">{lang === 'he' ? 'בפיגור' : 'Overdue'}</div>
              </div>
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{pendingTasks}</div>
                <div className="text-xs text-blue-700">{lang === 'he' ? 'ממתינות' : 'Pending'}</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">
                  {mockTasks.filter(t => t.status === 'in_progress').length}
                </div>
                <div className="text-xs text-yellow-700">{lang === 'he' ? 'בביצוע' : 'In Progress'}</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-green-700">{lang === 'he' ? 'הושלמו' : 'Completed'}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              {lang === 'he' ? 'מדדי ביצועים' : 'Performance Metrics'}
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{lang === 'he' ? 'זמן תגובה ממוצע:' : 'Avg Response Time:'}</span>
                <span className="text-sm font-medium">2.3h</span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{lang === 'he' ? 'שיעור השלמת משימות:' : 'Task Completion Rate:'}</span>
                <span className="text-sm font-medium">
                  {((completedTasks / mockTasks.length) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{lang === 'he' ? 'התראות שנפתרו היום:' : 'Alerts Resolved Today:'}</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{lang === 'he' ? 'יעילות תפעולית:' : 'Operational Efficiency:'}</span>
                <span className="text-sm font-medium text-green-600">94%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
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