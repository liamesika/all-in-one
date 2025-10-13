'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { VisualFlowBuilder, FlowNode } from './VisualFlowBuilder';

export interface AutomationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (automation: any) => void;
  initialData?: any;
}

export function AutomationBuilderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AutomationBuilderModalProps) {
  const { lang } = useLang();
  const isRtl = lang === 'he';

  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [trigger, setTrigger] = useState<any>(initialData?.trigger || null);
  const [actions, setActions] = useState<any[]>(initialData?.actions || []);
  const [conditions, setConditions] = useState<any>(initialData?.conditions || null);
  const [activateNow, setActivateNow] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setTrigger(initialData.trigger || null);
      setActions(initialData.actions || []);
      setConditions(initialData.conditions || null);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const triggerTypes = [
    {
      category: lang === 'he' ? 'אירועי ליד' : 'Lead Events',
      items: [
        { type: 'LEAD_CREATED', label: lang === 'he' ? 'ליד נוצר' : 'Lead Created' },
        { type: 'LEAD_UPDATED', label: lang === 'he' ? 'ליד עודכן' : 'Lead Updated' },
        { type: 'LEAD_STATUS_CHANGED', label: lang === 'he' ? 'סטטוס ליד השתנה' : 'Lead Status Changed' },
        { type: 'LEAD_NOT_CONTACTED', label: lang === 'he' ? 'ליד לא התקשרו אליו' : 'Lead Not Contacted' },
      ],
    },
    {
      category: lang === 'he' ? 'אירועי נכס' : 'Property Events',
      items: [
        { type: 'PROPERTY_ADDED', label: lang === 'he' ? 'נכס נוסף' : 'Property Added' },
        { type: 'PROPERTY_UPDATED', label: lang === 'he' ? 'נכס עודכן' : 'Property Updated' },
        { type: 'PROPERTY_PRICE_CHANGED', label: lang === 'he' ? 'מחיר נכס השתנה' : 'Property Price Changed' },
        { type: 'PROPERTY_PHOTO_ADDED', label: lang === 'he' ? 'תמונה נוספה לנכס' : 'Property Photo Added' },
      ],
    },
    {
      category: lang === 'he' ? 'אירועי קמפיין' : 'Campaign Events',
      items: [
        { type: 'CAMPAIGN_LEAD_RECEIVED', label: lang === 'he' ? 'ליד מקמפיין' : 'Campaign Lead Received' },
        { type: 'CAMPAIGN_BUDGET_THRESHOLD', label: lang === 'he' ? 'סף תקציב קמפיין' : 'Campaign Budget Threshold' },
        { type: 'CAMPAIGN_STATUS_CHANGED', label: lang === 'he' ? 'סטטוס קמפיין השתנה' : 'Campaign Status Changed' },
      ],
    },
  ];

  const actionTypes = [
    {
      category: lang === 'he' ? 'הודעות' : 'Messages',
      items: [
        { type: 'SEND_WHATSAPP', label: lang === 'he' ? 'שלח וואטסאפ' : 'Send WhatsApp', icon: '💬' },
        { type: 'SEND_EMAIL', label: lang === 'he' ? 'שלח מייל' : 'Send Email', icon: '📧' },
        { type: 'SEND_SMS', label: lang === 'he' ? 'שלח SMS' : 'Send SMS', icon: '📱' },
      ],
    },
    {
      category: lang === 'he' ? 'ניהול' : 'Management',
      items: [
        { type: 'CREATE_TASK', label: lang === 'he' ? 'צור משימה' : 'Create Task', icon: '✓' },
        { type: 'ASSIGN_AGENT', label: lang === 'he' ? 'הקצה סוכן' : 'Assign Agent', icon: '👤' },
        { type: 'UPDATE_FIELD', label: lang === 'he' ? 'עדכן שדה' : 'Update Field', icon: '✏️' },
        { type: 'ADD_NOTE', label: lang === 'he' ? 'הוסף הערה' : 'Add Note', icon: '📝' },
      ],
    },
    {
      category: lang === 'he' ? 'אוטומציה' : 'Automation',
      items: [
        { type: 'SEND_NOTIFICATION', label: lang === 'he' ? 'שלח התראה' : 'Send Notification', icon: '🔔' },
        { type: 'CALL_WEBHOOK', label: lang === 'he' ? 'קרא ל-Webhook' : 'Call Webhook', icon: '🔗' },
        { type: 'RUN_AI_ANALYSIS', label: lang === 'he' ? 'הרץ ניתוח AI' : 'Run AI Analysis', icon: '🤖' },
      ],
    },
  ];

  const handleSave = () => {
    const automation = {
      name,
      description,
      trigger,
      actions: actions.map((action, idx) => ({ ...action, order: idx })),
      conditions,
      status: activateNow ? 'ACTIVE' : 'PAUSED',
    };
    onSave(automation);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">
        {lang === 'he' ? 'בחר טריגר' : 'Choose Trigger'}
      </h2>
      <p className="text-gray-400 mb-6">
        {lang === 'he' ? 'מתי האוטומציה תופעל?' : 'When should this automation run?'}
      </p>

      {triggerTypes.map((category, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">{category.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.items.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  setTrigger({ type: item.type, config: {} });
                  setStep(2);
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  trigger?.type === item.type
                    ? 'border-[#2979FF] bg-[#2979FF]/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                }`}
              >
                <div className="font-medium text-white">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">
        {lang === 'he' ? 'הוסף פעולות' : 'Add Actions'}
      </h2>
      <p className="text-gray-400 mb-6">
        {lang === 'he' ? 'מה יקרה כשהטריגר יופעל?' : 'What should happen when triggered?'}
      </p>

      {actionTypes.map((category, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">{category.category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {category.items.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  setActions([...actions, { type: item.type, config: {} }]);
                }}
                className="p-4 rounded-lg border-2 border-gray-600 hover:border-gray-500 bg-gray-800/50 text-left transition-all"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium text-white text-sm">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {actions.length > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="text-green-400 font-medium mb-2">
            {lang === 'he' ? 'פעולות שנבחרו:' : 'Selected Actions:'}
          </div>
          <ul className="space-y-1 text-sm text-gray-300">
            {actions.map((action, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>
                  {idx + 1}. {actionTypes.flatMap((c) => c.items).find((a) => a.type === action.type)?.label}
                </span>
                <button
                  onClick={() => setActions(actions.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300"
                >
                  {lang === 'he' ? 'הסר' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">
        {lang === 'he' ? 'סיים והפעל' : 'Finalize & Activate'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {lang === 'he' ? 'שם האוטומציה' : 'Automation Name'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder={lang === 'he' ? 'לדוגמה: שלח ברכת קבלת פנים ללידים חדשים' : 'e.g., Send welcome message to new leads'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {lang === 'he' ? 'תיאור (אופציונלי)' : 'Description (optional)'}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder={lang === 'he' ? 'מה האוטומציה הזו עושה?' : 'What does this automation do?'}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="activateNow"
          checked={activateNow}
          onChange={(e) => setActivateNow(e.target.checked)}
          className="w-5 h-5 rounded border-gray-600 bg-gray-800"
        />
        <label htmlFor="activateNow" className="text-gray-300">
          {lang === 'he' ? 'הפעל מיד' : 'Activate now'}
        </label>
      </div>

      {trigger && (
        <VisualFlowBuilder
          trigger={{
            id: 'trigger',
            type: 'trigger',
            label: triggerTypes.flatMap((c) => c.items).find((t) => t.type === trigger.type)?.label || '',
          }}
          actions={actions.map((action, idx) => ({
            id: `action-${idx}`,
            type: 'action',
            label: actionTypes.flatMap((c) => c.items).find((a) => a.type === action.type)?.label || '',
          }))}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#0E1A2B] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            {initialData
              ? lang === 'he'
                ? 'ערוך אוטומציה'
                : 'Edit Automation'
              : lang === 'he'
              ? 'צור אוטומציה חדשה'
              : 'Create New Automation'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step === s
                      ? 'bg-[#2979FF] text-white'
                      : step > s
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className="w-12 h-0.5 bg-gray-700 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            {step === 1 ? (lang === 'he' ? 'ביטול' : 'Cancel') : lang === 'he' ? 'חזור' : 'Back'}
          </button>

          <button
            onClick={() => {
              if (step === 3) {
                handleSave();
              } else if (step === 2 && actions.length > 0) {
                setStep(3);
              } else if (step === 1 && trigger) {
                setStep(2);
              }
            }}
            disabled={(step === 1 && !trigger) || (step === 2 && actions.length === 0) || (step === 3 && !name)}
            className="px-6 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? (lang === 'he' ? 'שמור' : 'Save') : lang === 'he' ? 'הבא' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
