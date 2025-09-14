'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface MatterData {
  id: string;
  title: string;
  clientName: string;
  stage: 'open' | 'discovery' | 'negotiation' | 'closing' | 'closed';
  practiceArea: 'residential' | 'commercial' | 'development' | 'leasing';
  attorney: string;
  value: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
  daysInStage: number;
}

interface StageData {
  stage: string;
  stageKey: string;
  count: number;
  value: number;
  matters: MatterData[];
  color: string;
  avgDays: number;
}

interface MatterPipelineProps {
  data: MatterData[];
  onMatterClick?: (matterId: string) => void;
  onViewDetails?: () => void;
}

export function MatterPipeline({ data, onMatterClick, onViewDetails }: MatterPipelineProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [groupBy, setGroupBy] = useState<'stage' | 'practiceArea' | 'attorney'>('stage');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Mock data if no data provided
  const mockMatters: MatterData[] = data?.length ? data : [
    {
      id: '1',
      title: 'Smith Residential Purchase',
      clientName: 'John & Jane Smith',
      stage: 'closing',
      practiceArea: 'residential',
      attorney: 'Sarah Cohen',
      value: 450000,
      priority: 'high',
      lastActivity: '2024-01-10T14:30:00Z',
      daysInStage: 5
    },
    {
      id: '2',
      title: 'Downtown Office Building',
      clientName: 'ABC Corp',
      stage: 'negotiation',
      practiceArea: 'commercial',
      attorney: 'David Levi',
      value: 2500000,
      priority: 'critical',
      lastActivity: '2024-01-12T09:15:00Z',
      daysInStage: 12
    },
    {
      id: '3',
      title: 'Residential Lease Agreement',
      clientName: 'Maria Garcia',
      stage: 'discovery',
      practiceArea: 'leasing',
      attorney: 'Rachel Gold',
      value: 24000,
      priority: 'medium',
      lastActivity: '2024-01-11T16:45:00Z',
      daysInStage: 3
    },
    {
      id: '4',
      title: 'Shopping Center Development',
      clientName: 'XYZ Holdings',
      stage: 'open',
      practiceArea: 'development',
      attorney: 'Michael Ben-David',
      value: 5000000,
      priority: 'high',
      lastActivity: '2024-01-13T11:20:00Z',
      daysInStage: 1
    },
    {
      id: '5',
      title: 'Apartment Complex Sale',
      clientName: 'Investment Partners LLC',
      stage: 'closing',
      practiceArea: 'commercial',
      attorney: 'Sarah Cohen',
      value: 1800000,
      priority: 'high',
      lastActivity: '2024-01-12T13:30:00Z',
      daysInStage: 8
    }
  ];

  const stageLabels = {
    open: lang === 'he' ? 'פתוח' : 'Open',
    discovery: lang === 'he' ? 'בירור' : 'Discovery', 
    negotiation: lang === 'he' ? 'משא ומתן' : 'Negotiation',
    closing: lang === 'he' ? 'סגירה' : 'Closing',
    closed: lang === 'he' ? 'סגור' : 'Closed'
  };

  const practiceAreaLabels = {
    residential: lang === 'he' ? 'מגורים' : 'Residential',
    commercial: lang === 'he' ? 'מסחרי' : 'Commercial',
    development: lang === 'he' ? 'פיתוח' : 'Development',
    leasing: lang === 'he' ? 'השכרה' : 'Leasing'
  };

  const stageColors = {
    open: 'bg-blue-500',
    discovery: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    closing: 'bg-green-500',
    closed: 'bg-gray-500'
  };

  // Group matters by selected criteria
  const groupedData = () => {
    const groups: { [key: string]: StageData } = {};
    
    mockMatters.forEach(matter => {
      const key = groupBy === 'stage' ? matter.stage : 
                  groupBy === 'practiceArea' ? matter.practiceArea : 
                  matter.attorney;
      
      if (!groups[key]) {
        groups[key] = {
          stage: groupBy === 'stage' ? stageLabels[matter.stage as keyof typeof stageLabels] : 
                 groupBy === 'practiceArea' ? practiceAreaLabels[matter.practiceArea as keyof typeof practiceAreaLabels] : 
                 key,
          stageKey: key,
          count: 0,
          value: 0,
          matters: [],
          color: groupBy === 'stage' ? stageColors[matter.stage as keyof typeof stageColors] : 'bg-blue-500',
          avgDays: 0
        };
      }
      
      groups[key].count++;
      groups[key].value += matter.value;
      groups[key].matters.push(matter);
    });

    // Calculate average days in stage
    Object.values(groups).forEach(group => {
      group.avgDays = Math.round(
        group.matters.reduce((sum, matter) => sum + matter.daysInStage, 0) / group.matters.length
      );
    });

    return Object.values(groups);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const stages = groupedData();
  const totalMatters = stages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'צינור תיקים' : 'Matter Pipeline'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${totalMatters} תיקים פעילים, ערך כולל ${formatCurrency(totalValue)}`
              : `${totalMatters} active matters, total value ${formatCurrency(totalValue)}`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Group By Selector */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-300"
          >
            <option value="stage">
              {lang === 'he' ? 'קבץ לפי שלב' : 'Group by Stage'}
            </option>
            <option value="practiceArea">
              {lang === 'he' ? 'קבץ לפי תחום' : 'Group by Practice Area'}
            </option>
            <option value="attorney">
              {lang === 'he' ? 'קבץ לפי עו"ד' : 'Group by Attorney'}
            </option>
          </select>

          <button 
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {lang === 'he' ? 'הצג פרטים' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="space-y-4 mb-6">
        {stages.map((stage, index) => (
          <div key={stage.stageKey}>
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                <span className="text-sm text-gray-500">
                  ({stage.count} {lang === 'he' ? 'תיקים' : 'matters'})
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(stage.value)} • {stage.avgDays} {lang === 'he' ? 'ימים ממוצע' : 'avg days'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-gray-100 rounded-full mb-3">
                <div 
                  className={`h-2 rounded-full ${stage.color}`}
                  style={{ width: `${(stage.count / totalMatters) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Matter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {stage.matters.slice(0, 3).map((matter) => (
                <div
                  key={matter.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onMatterClick?.(matter.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {matter.title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {matter.clientName}
                      </p>
                    </div>
                    <div className={`text-xs font-medium ${getPriorityColor(matter.priority)}`}>
                      {lang === 'he' 
                        ? matter.priority === 'critical' ? 'קריטית'
                          : matter.priority === 'high' ? 'גבוהה'
                          : matter.priority === 'medium' ? 'בינונית'
                          : 'נמוכה'
                        : matter.priority
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatCurrency(matter.value)}</span>
                    <span>{matter.attorney}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>{formatDate(matter.lastActivity)}</span>
                    <span>
                      {matter.daysInStage} {lang === 'he' ? 'ימים בשלב' : 'days in stage'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {stage.matters.length > 3 && (
              <button
                onClick={() => setSelectedStage(selectedStage === stage.stageKey ? null : stage.stageKey)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedStage === stage.stageKey 
                  ? lang === 'he' ? 'הצג פחות' : 'Show Less'
                  : `${lang === 'he' ? 'הצג עוד' : 'Show'} ${stage.matters.length - 3} ${lang === 'he' ? 'תיקים' : 'more'}`
                }
              </button>
            )}

            {/* Expanded View */}
            {selectedStage === stage.stageKey && stage.matters.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {stage.matters.slice(3).map((matter) => (
                  <div
                    key={matter.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onMatterClick?.(matter.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {matter.title}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          {matter.clientName}
                        </p>
                      </div>
                      <div className={`text-xs font-medium ${getPriorityColor(matter.priority)}`}>
                        {lang === 'he' 
                          ? matter.priority === 'critical' ? 'קריטית'
                            : matter.priority === 'high' ? 'גבוהה'
                            : matter.priority === 'medium' ? 'בינונית'
                            : 'נמוכה'
                          : matter.priority
                        }
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatCurrency(matter.value)}</span>
                      <span>{matter.attorney}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span>{formatDate(matter.lastActivity)}</span>
                      <span>
                        {matter.daysInStage} {lang === 'he' ? 'ימים בשלב' : 'days in stage'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            {index < stages.length - 1 && <div className="border-t border-gray-100 mt-4"></div>}
          </div>
        ))}
      </div>

      {stages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין תיקים פעילים' : 'No active matters'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'התחל תיק חדש כדי לראות את הצינור' : 'Start a new matter to see the pipeline'}
          </div>
        </div>
      )}
    </div>
  );
}