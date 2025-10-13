'use client';

import { useLang } from '@/components/i18n/LangProvider';

export interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  config?: any;
}

export interface VisualFlowBuilderProps {
  trigger: FlowNode;
  actions: FlowNode[];
  onAddAction?: () => void;
  onEditNode?: (nodeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
}

export function VisualFlowBuilder({
  trigger,
  actions,
  onAddAction,
  onEditNode,
  onRemoveNode,
}: VisualFlowBuilderProps) {
  const { lang } = useLang();
  const isRtl = lang === 'he';

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return {
          bg: 'bg-[#2979FF]/20',
          border: 'border-[#2979FF]',
          text: 'text-[#2979FF]',
        };
      case 'action':
        return {
          bg: 'bg-[#10B981]/20',
          border: 'border-[#10B981]',
          text: 'text-[#10B981]',
        };
      case 'condition':
        return {
          bg: 'bg-[#F59E0B]/20',
          border: 'border-[#F59E0B]',
          text: 'text-[#F59E0B]',
        };
      default:
        return {
          bg: 'bg-gray-700',
          border: 'border-gray-600',
          text: 'text-gray-300',
        };
    }
  };

  return (
    <div className="p-6 bg-[#0E1A2B] rounded-lg border border-gray-700" dir={isRtl ? 'rtl' : 'ltr'}>
      <h3 className="text-lg font-semibold text-white mb-4">
        {lang === 'he' ? 'תרשים זרימה' : 'Workflow Flow'}
      </h3>

      <div className="space-y-4">
        {/* Trigger Node */}
        <div className="relative">
          <div
            className={`${getNodeColor('trigger').bg} ${getNodeColor('trigger').border} ${
              getNodeColor('trigger').text
            } border-2 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all`}
            onClick={() => onEditNode?.(trigger.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium opacity-70 mb-1">
                  {lang === 'he' ? 'טריגר' : 'TRIGGER'}
                </div>
                <div className="font-semibold">{trigger.label}</div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div className="absolute left-1/2 -bottom-4 -ml-px w-0.5 h-4 bg-gray-600" />
        </div>

        {/* Actions */}
        {actions.map((action, idx) => (
          <div key={action.id} className="relative">
            <div
              className={`${getNodeColor(action.type).bg} ${getNodeColor(action.type).border} ${
                getNodeColor(action.type).text
              } border-2 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all group`}
              onClick={() => onEditNode?.(action.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium opacity-70 mb-1">
                    {lang === 'he' ? `פעולה ${idx + 1}` : `ACTION ${idx + 1}`}
                  </div>
                  <div className="font-semibold">{action.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  {action.type === 'action' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {onRemoveNode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveNode(action.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    >
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {idx < actions.length - 1 && (
              <div className="absolute left-1/2 -bottom-4 -ml-px w-0.5 h-4 bg-gray-600" />
            )}
          </div>
        ))}

        {/* Add Action Button */}
        {onAddAction && (
          <div className="relative">
            <div className="absolute left-1/2 -top-4 -ml-px w-0.5 h-4 bg-gray-600" />
            <button
              onClick={onAddAction}
              className="w-full border-2 border-dashed border-gray-600 rounded-xl p-4 hover:border-gray-500 hover:bg-gray-800/30 transition-all text-gray-400 hover:text-gray-300"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">
                  {lang === 'he' ? 'הוסף פעולה' : 'Add Action'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
