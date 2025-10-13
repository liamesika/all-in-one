'use client';

import { useLang } from '@/components/i18n/LangProvider';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'lead' | 'property' | 'campaign';
  trigger: any;
  actions: any[];
  icon: string;
}

export interface AutomationTemplatesProps {
  onUseTemplate: (template: Template) => void;
}

export function AutomationTemplates({ onUseTemplate }: AutomationTemplatesProps) {
  const { lang } = useLang();
  const isRtl = lang === 'he';

  const templates: Template[] = [
    {
      id: 'welcome-leads',
      name: lang === 'he' ? 'ברוכים הבאים ללידים חדשים' : 'Welcome New Leads',
      description: lang === 'he' ? 'שלח הודעת ברכה אוטומטית ללידים חדשים' : 'Send automatic welcome message to new leads',
      category: 'lead',
      icon: '👋',
      trigger: { type: 'LEAD_CREATED', config: {} },
      actions: [
        { type: 'SEND_WHATSAPP', config: { template: 'welcome' } },
        { type: 'CREATE_TASK', config: { title: 'Follow up with new lead' } },
      ],
    },
    {
      id: 'cold-lead-followup',
      name: lang === 'he' ? 'מעקב אחר לידים קרים' : 'Follow Up Cold Leads',
      description: lang === 'he' ? 'שלח תזכורת אחרי 24 שעות ללא קשר' : 'Send reminder after 24h without contact',
      category: 'lead',
      icon: '❄️',
      trigger: { type: 'LEAD_NOT_CONTACTED', config: { hours: 24 } },
      actions: [
        { type: 'SEND_EMAIL', config: { template: 'follow-up' } },
        { type: 'SEND_NOTIFICATION', config: { message: 'Lead needs attention' } },
      ],
    },
    {
      id: 'hot-lead-alert',
      name: lang === 'he' ? 'התראה על ליד חם' : 'Hot Lead Alert',
      description: lang === 'he' ? 'התראה מיידית כשליד מסומן כחם' : 'Instant alert when lead marked as hot',
      category: 'lead',
      icon: '🔥',
      trigger: { type: 'LEAD_STATUS_CHANGED', config: { status: 'HOT' } },
      actions: [
        { type: 'ASSIGN_AGENT', config: { rule: 'senior' } },
        { type: 'SEND_NOTIFICATION', config: { message: 'Hot lead assigned' } },
        { type: 'CREATE_TASK', config: { title: 'Contact hot lead ASAP', priority: 'URGENT' } },
      ],
    },
    {
      id: 'property-promotion',
      name: lang === 'he' ? 'קידום נכס חדש' : 'Promote New Property',
      description: lang === 'he' ? 'צור תיאור AI ושלח ללידים מתאימים' : 'Generate AI description and notify matching leads',
      category: 'property',
      icon: '🏠',
      trigger: { type: 'PROPERTY_ADDED', config: {} },
      actions: [
        { type: 'RUN_AI_ANALYSIS', config: { action: 'generate-description' } },
        { type: 'SEND_EMAIL', config: { to: 'matching-leads', template: 'new-property' } },
      ],
    },
    {
      id: 'price-drop-alert',
      name: lang === 'he' ? 'התראת הורדת מחיר' : 'Price Drop Alert',
      description: lang === 'he' ? 'הודע ללידים מעוניינים על הורדת מחיר' : 'Notify interested leads about price reduction',
      category: 'property',
      icon: '💰',
      trigger: { type: 'PROPERTY_PRICE_CHANGED', config: { direction: 'down' } },
      actions: [
        { type: 'SEND_EMAIL', config: { to: 'interested-leads', template: 'price-drop' } },
        { type: 'SEND_WHATSAPP', config: { to: 'hot-leads', template: 'price-drop' } },
      ],
    },
    {
      id: 'long-market-alert',
      name: lang === 'he' ? 'נכס זמן רב בשוק' : 'Long Time on Market',
      description: lang === 'he' ? 'הצע התאמת מחיר לנכס מעל 30 ימים בשוק' : 'Suggest price adjustment for properties over 30 days',
      category: 'property',
      icon: '📅',
      trigger: { type: 'TIME_BASED', config: { schedule: 'weekly' } },
      actions: [
        { type: 'RUN_AI_ANALYSIS', config: { action: 'market-analysis' } },
        { type: 'SEND_NOTIFICATION', config: { message: 'Properties need attention' } },
        { type: 'CREATE_TASK', config: { title: 'Review pricing strategy' } },
      ],
    },
    {
      id: 'campaign-lead-funnel',
      name: lang === 'he' ? 'משפך לידים מקמפיין' : 'Campaign Lead Funnel',
      description: lang === 'he' ? 'צור ליד ושלח מענה אוטומטי' : 'Create lead and send auto-reply',
      category: 'campaign',
      icon: '📢',
      trigger: { type: 'CAMPAIGN_LEAD_RECEIVED', config: {} },
      actions: [
        { type: 'CREATE_LEAD', config: {} },
        { type: 'SEND_WHATSAPP', config: { template: 'campaign-response' } },
        { type: 'ASSIGN_AGENT', config: { rule: 'round-robin' } },
      ],
    },
    {
      id: 'budget-alert',
      name: lang === 'he' ? 'התראת תקציב קמפיין' : 'Campaign Budget Alert',
      description: lang === 'he' ? 'התרה כש-90% מהתקציב נוצל' : 'Alert when 90% of budget spent',
      category: 'campaign',
      icon: '💳',
      trigger: { type: 'CAMPAIGN_BUDGET_THRESHOLD', config: { percentage: 90 } },
      actions: [
        { type: 'SEND_NOTIFICATION', config: { message: 'Campaign budget nearly exhausted' } },
        { type: 'SEND_EMAIL', config: { to: 'admin', template: 'budget-alert' } },
      ],
    },
    {
      id: 'low-ctr-pause',
      name: lang === 'he' ? 'השהה קמפיין CTR נמוך' : 'Pause Low CTR Campaign',
      description: lang === 'he' ? 'השהה קמפיינים עם CTR נמוך מ-1%' : 'Pause campaigns with CTR below 1%',
      category: 'campaign',
      icon: '⏸️',
      trigger: { type: 'CAMPAIGN_STATUS_CHANGED', config: { metric: 'ctr', threshold: 1 } },
      actions: [
        { type: 'UPDATE_FIELD', config: { field: 'status', value: 'PAUSED' } },
        { type: 'SEND_NOTIFICATION', config: { message: 'Campaign paused due to low CTR' } },
      ],
    },
    {
      id: 'assign-by-location',
      name: lang === 'he' ? 'הקצאה לפי מיקום' : 'Assign by Location',
      description: lang === 'he' ? 'הקצה לידים לסוכנים לפי מיקום' : 'Assign leads to agents by location',
      category: 'lead',
      icon: '📍',
      trigger: { type: 'LEAD_CREATED', config: {} },
      actions: [
        { type: 'ASSIGN_AGENT', config: { rule: 'by-location' } },
        { type: 'SEND_NOTIFICATION', config: { message: 'New lead assigned to you' } },
      ],
    },
    {
      id: 'weekly-digest',
      name: lang === 'he' ? 'דייגסט שבועי' : 'Weekly Digest',
      description: lang === 'he' ? 'שלח סיכום שבועי של פעילות' : 'Send weekly activity summary',
      category: 'lead',
      icon: '📊',
      trigger: { type: 'TIME_BASED', config: { schedule: 'weekly' } },
      actions: [
        { type: 'RUN_AI_ANALYSIS', config: { action: 'generate-report' } },
        { type: 'SEND_EMAIL', config: { to: 'team', template: 'weekly-digest' } },
      ],
    },
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; he: string }> = {
      lead: { en: 'Leads', he: 'לידים' },
      property: { en: 'Properties', he: 'נכסים' },
      campaign: { en: 'Campaigns', he: 'קמפיינים' },
    };
    return labels[category]?.[lang] || category;
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {lang === 'he' ? 'תבניות אוטומציה' : 'Automation Templates'}
        </h2>
        <p className="text-gray-400">
          {lang === 'he' ? 'התחל מהר עם תבניות מוכנות מראש' : 'Get started quickly with pre-built templates'}
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            {getCategoryLabel(category)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-[#1A2F4B] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => onUseTemplate(template)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">
                    {template.actions.length} {lang === 'he' ? 'פעולות' : 'actions'}
                  </span>
                  <button className="px-3 py-1 rounded-lg bg-[#2979FF]/20 text-[#2979FF] text-sm font-medium group-hover:bg-[#2979FF] group-hover:text-white transition-colors">
                    {lang === 'he' ? 'השתמש בתבנית' : 'Use Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
