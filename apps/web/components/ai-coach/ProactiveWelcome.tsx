'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, AlertTriangle, TrendingUp, Calendar, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../ui';

interface ProactiveInsight {
  type: 'stale_leads' | 'underperforming_campaign' | 'overdue_tasks' | 'connection_issues' | 'missing_properties';
  title: string;
  description: string;
  count?: number;
  severity: 'high' | 'medium' | 'low';
  quickAction?: {
    text: string;
    action: string;
    params: Record<string, any>;
    variant?: 'default' | 'destructive' | 'outline';
  };
  entityLink?: {
    text: string;
    url: string;
  };
}

interface ProactiveWelcomeProps {
  ownerUid: string;
  organizationId?: string;
  onClose: () => void;
  className?: string;
}

const WELCOME_TRANSLATIONS = {
  he: {
    welcomeTitle: 'בוקר טוב! הנה מה שדורש את תשומת הלב שלך:',
    insights: 'תובנות',
    quickActions: 'פעולות מהירות',
    viewDetails: 'צפה בפרטים',
    dismiss: 'סגור',
    executeAction: 'בצע פעולה',
    actionExecuting: 'מבצע...',
    actionCompleted: 'הפעולה בוצעה בהצלחה',
    actionFailed: 'הפעולה נכשלה',
    high: 'גבוה',
    medium: 'בינוני',
    low: 'נמוך',
    staleLeads: 'לידים ישנים',
    underperformingCampaign: 'קמפיין לא מניב',
    overdueTasks: 'משימות באיחור',
    connectionIssues: 'בעיות חיבור',
    missingProperties: 'נכסים חסרים',
    priority: 'עדיפות',
    loading: 'טוען...',
    error: 'שגיאה בטעינת הנתונים',
  },
  en: {
    welcomeTitle: 'Good morning! Here\'s what needs your attention:',
    insights: 'Insights',
    quickActions: 'Quick Actions',
    viewDetails: 'View Details',
    dismiss: 'Dismiss',
    executeAction: 'Execute Action',
    actionExecuting: 'Executing...',
    actionCompleted: 'Action completed successfully',
    actionFailed: 'Action failed',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    staleLeads: 'Stale Leads',
    underperformingCampaign: 'Underperforming Campaign',
    overdueTasks: 'Overdue Tasks',
    connectionIssues: 'Connection Issues',
    missingProperties: 'Missing Properties',
    priority: 'Priority',
    loading: 'Loading...',
    error: 'Error loading data',
  },
};

export default function ProactiveWelcome({ ownerUid, organizationId, onClose, className }: ProactiveWelcomeProps) {
  const { language } = useLanguage();
  const dir = language === 'he' ? 'rtl' : 'ltr';
  const t = WELCOME_TRANSLATIONS[language];

  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [actionResults, setActionResults] = useState<Map<string, { success: boolean; message: string }>>(new Map());

  useEffect(() => {
    loadProactiveInsights();
  }, [ownerUid]);

  const loadProactiveInsights = async () => {
    if (!ownerUid) {
      console.warn('Cannot load proactive insights: ownerUid is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get user data snapshot for analysis
      const response = await fetch('/api/ai-coach/data-snapshot', {
        headers: {
          'x-org-id': ownerUid,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const generatedInsights = generateInsightsFromData(data);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Failed to load proactive insights:', error);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsightsFromData = (data: any): ProactiveInsight[] => {
    const insights: ProactiveInsight[] = [];

    // Stale leads (>3 days without contact)
    if (data.leads?.staleList?.length > 0) {
      const staleCount = data.leads.staleList.length;
      insights.push({
        type: 'stale_leads',
        title: language === 'he' ? `${staleCount} לידים לא עודכנו מעל 3 ימים` : `${staleCount} leads haven't been contacted in 3+ days`,
        description: language === 'he' ?
          'לידים שלא נוצר איתם קשר יכולים להפוך לא רלוונטיים' :
          'Leads without contact may become irrelevant',
        count: staleCount,
        severity: staleCount > 10 ? 'high' : staleCount > 5 ? 'medium' : 'low',
        quickAction: {
          text: language === 'he' ? 'צור משימת מעקב' : 'Create Follow-up Task',
          action: 'create_task',
          params: {
            title: language === 'he' ? `מעקב אחרי ${staleCount} לידים ישנים` : `Follow up on ${staleCount} stale leads`,
            description: language === 'he' ?
              `יש לצור קשר עם הלידים שלא עודכנו מעל 3 ימים` :
              `Contact leads that haven't been updated in over 3 days`,
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        entityLink: {
          text: language === 'he' ? 'צפה בלידים' : 'View Leads',
          url: '/e-commerce/leads',
        },
      });
    }

    // Underperforming campaigns
    if (data.campaigns?.issues?.length > 0) {
      const issues = data.campaigns.issues;
      const criticalIssues = issues.filter((issue: any) => issue.severity === 'critical');

      if (criticalIssues.length > 0) {
        const issue = criticalIssues[0];
        insights.push({
          type: 'underperforming_campaign',
          title: language === 'he' ?
            `קמפיין "${issue.campaignName}" לא מניב תוצאות` :
            `Campaign "${issue.campaignName}" is underperforming`,
          description: language === 'he' ? issue.description_he || issue.description : issue.description,
          severity: 'high',
          quickAction: {
            text: language === 'he' ? 'השהה קמפיין' : 'Pause Campaign',
            action: 'pause_campaign',
            params: {
              campaignId: issue.campaignId,
              reason: language === 'he' ? 'ביצועים נמוכים - דורש בדיקה' : 'Poor performance - needs review',
            },
            variant: 'destructive',
          },
          entityLink: {
            text: language === 'he' ? 'צפה בקמפיין' : 'View Campaign',
            url: `/e-commerce/campaigns?id=${issue.campaignId}`,
          },
        });
      }
    }

    // Overdue tasks
    if (data.tasks?.overdue > 0) {
      insights.push({
        type: 'overdue_tasks',
        title: language === 'he' ?
          `${data.tasks.overdue} משימות באיחור` :
          `${data.tasks.overdue} tasks are overdue`,
        description: language === 'he' ?
          'משימות באיחור יכולות להשפיע על הפרודוקטיביות' :
          'Overdue tasks can impact productivity',
        count: data.tasks.overdue,
        severity: data.tasks.overdue > 5 ? 'high' : 'medium',
        entityLink: {
          text: language === 'he' ? 'צפה במשימות' : 'View Tasks',
          url: '/dashboard/tasks',
        },
      });
    }

    // Connection issues
    if (data.connections?.errorCount > 0) {
      insights.push({
        type: 'connection_issues',
        title: language === 'he' ?
          `${data.connections.errorCount} חיבורים לא פעילים` :
          `${data.connections.errorCount} connections have issues`,
        description: language === 'he' ?
          'חיבורים לא פעילים יכולים להשפיע על סנכרון הנתונים' :
          'Inactive connections may affect data sync',
        count: data.connections.errorCount,
        severity: 'medium',
        entityLink: {
          text: language === 'he' ? 'צפה בחיבורים' : 'View Connections',
          url: '/connections',
        },
      });
    }

    // Sort by severity and limit to top 3
    return insights
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 3);
  };

  const executeQuickAction = async (insight: ProactiveInsight) => {
    if (!insight.quickAction) return;

    const actionKey = `${insight.type}_${Date.now()}`;
    setExecutingAction(actionKey);

    try {
      const response = await fetch(`/api/ai-coach/tools/${insight.quickAction.action}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify({
          parameters: insight.quickAction.params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      setActionResults(prev => new Map(prev.set(actionKey, {
        success: result.success,
        message: result.message,
      })));

    } catch (error) {
      console.error('Failed to execute action:', error);
      setActionResults(prev => new Map(prev.set(actionKey, {
        success: false,
        message: t.actionFailed,
      })));
    } finally {
      setExecutingAction(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <TrendingUp size={16} className="text-yellow-500" />;
      case 'low': return <Calendar size={16} className="text-green-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${className}`}
      >
        <CardContent className="p-6">
          <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
            <Bot size={24} className="text-blue-500" />
            <span className="text-lg">{t.loading}</span>
          </div>
        </CardContent>
      </motion.div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${className}`}
      dir={dir}
    >
      <CardHeader className={`flex flex-row items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 ${
        dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Bot size={24} className="text-blue-500" />
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t.welcomeTitle}
            </h3>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={`${insight.type}_${index}`}
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className={`flex items-start gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(insight.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`flex items-center justify-between mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <h4 className={`font-medium text-gray-900 dark:text-gray-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {insight.title}
                  </h4>
                  <Badge className={`text-xs ${getSeverityColor(insight.severity)}`}>
                    {t[insight.severity as keyof typeof t]}
                  </Badge>
                </div>

                <p className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {insight.description}
                </p>

                <div className={`flex flex-wrap gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {insight.quickAction && (
                    <Button
                      size="sm"
                      variant={insight.quickAction.variant || 'default'}
                      onClick={() => executeQuickAction(insight)}
                      disabled={executingAction !== null}
                      className="text-xs"
                    >
                      {executingAction === `${insight.type}_${Date.now()}` ? t.actionExecuting : insight.quickAction.text}
                    </Button>
                  )}

                  {insight.entityLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(insight.entityLink!.url, '_self')}
                      className={`text-xs ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} gap-1`}
                    >
                      <span>{insight.entityLink.text}</span>
                      <ExternalLink size={12} />
                    </Button>
                  )}
                </div>

                {/* Action Results */}
                {Array.from(actionResults.entries()).map(([key, result]) => {
                  if (!key.startsWith(insight.type)) return null;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-3 flex items-center gap-2 text-xs ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {result.success ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.message}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-sm"
          >
            {t.dismiss}
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );
}