'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface FinancialData {
  wip: number;
  billed: number;
  collected: number;
  arAging: {
    current: number; // 0-30 days
    days30: number;  // 31-60 days
    days60: number;  // 61-90 days
    days90Plus: number; // 90+ days
  };
  topMatters: Array<{
    id: string;
    title: string;
    client: string;
    profitability: number;
    revenue: number;
    type: 'top' | 'bottom';
  }>;
  monthlyTrend: Array<{
    month: string;
    wip: number;
    billed: number;
    collected: number;
  }>;
}

interface FinancialFlowProps {
  data?: FinancialData;
  onViewDetails?: () => void;
  onMatterClick?: (matterId: string) => void;
}

export function FinancialFlow({ data, onViewDetails, onMatterClick }: FinancialFlowProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'flow' | 'aging' | 'profitability'>('flow');

  // Mock data if no data provided
  const mockData: FinancialData = data || {
    wip: 450000,
    billed: 320000,
    collected: 280000,
    arAging: {
      current: 150000,
      days30: 85000,
      days60: 45000,
      days90Plus: 40000
    },
    topMatters: [
      {
        id: '1',
        title: 'Downtown Office Building',
        client: 'ABC Corp',
        profitability: 85.5,
        revenue: 125000,
        type: 'top'
      },
      {
        id: '2',
        title: 'Shopping Center Development',
        client: 'XYZ Holdings',
        profitability: 78.2,
        revenue: 95000,
        type: 'top'
      },
      {
        id: '3',
        title: 'Apartment Complex Sale',
        client: 'Investment Partners',
        profitability: 72.1,
        revenue: 75000,
        type: 'top'
      },
      {
        id: '4',
        title: 'Small Residential Purchase',
        client: 'John Doe',
        profitability: 12.3,
        revenue: 8500,
        type: 'bottom'
      },
      {
        id: '5',
        title: 'Document Review Only',
        client: 'Jane Smith',
        profitability: 8.7,
        revenue: 3200,
        type: 'bottom'
      }
    ],
    monthlyTrend: [
      { month: 'Jul', wip: 380000, billed: 290000, collected: 260000 },
      { month: 'Aug', wip: 420000, billed: 305000, collected: 275000 },
      { month: 'Sep', wip: 440000, billed: 315000, collected: 270000 },
      { month: 'Oct', wip: 450000, billed: 320000, collected: 280000 }
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const totalAR = mockData.arAging.current + mockData.arAging.days30 + 
                  mockData.arAging.days60 + mockData.arAging.days90Plus;

  const collectionRate = totalAR > 0 ? (mockData.collected / (mockData.collected + totalAR)) * 100 : 0;
  const realizationRate = mockData.billed > 0 ? (mockData.billed / mockData.wip) * 100 : 0;

  const tabs = [
    { id: 'flow', label: lang === 'he' ? 'זרימה פיננסית' : 'Financial Flow' },
    { id: 'aging', label: lang === 'he' ? 'דוח יתרות' : 'A/R Aging' },
    { id: 'profitability', label: lang === 'he' ? 'רווחיות' : 'Profitability' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'זרימה פיננסית ודוח יתרות' : 'Financial Flow & A/R'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `שיעור גביה ${formatPercentage(collectionRate)} • מימוש ${formatPercentage(realizationRate)}`
              : `${formatPercentage(collectionRate)} collection rate • ${formatPercentage(realizationRate)} realization`
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

      {/* Financial Flow Tab */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Flow Visualization */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="bg-blue-100 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {lang === 'he' ? 'עבודה בתהליך' : 'Work in Progress'}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(mockData.wip)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {lang === 'he' ? 'שעות לא מחויבות' : 'Unbilled hours'}
                  </div>
                </div>
              </div>
              
              <div className="mx-4 text-gray-400">→</div>
              
              <div className="flex-1 text-center">
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    {lang === 'he' ? 'נחויב' : 'Billed'}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(mockData.billed)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {formatPercentage(realizationRate)} {lang === 'he' ? 'מימוש' : 'realization'}
                  </div>
                </div>
              </div>
              
              <div className="mx-4 text-gray-400">→</div>
              
              <div className="flex-1 text-center">
                <div className="bg-emerald-100 rounded-lg p-4">
                  <div className="text-sm text-emerald-600 font-medium mb-1">
                    {lang === 'he' ? 'נגבה' : 'Collected'}
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {formatCurrency(mockData.collected)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    {formatPercentage(collectionRate)} {lang === 'he' ? 'גביה' : 'collection'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'מגמה חודשית' : 'Monthly Trend'}
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {mockData.monthlyTrend.map((month, index) => (
                <div key={month.month} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">{month.month}</div>
                  <div className="space-y-1">
                    <div className="h-20 relative bg-gray-100 rounded">
                      <div 
                        className="absolute bottom-0 w-full bg-blue-400 rounded-b"
                        style={{ 
                          height: `${(month.wip / Math.max(...mockData.monthlyTrend.map(m => m.wip))) * 100}%` 
                        }}
                      />
                      <div 
                        className="absolute bottom-0 w-full bg-green-400 rounded-b"
                        style={{ 
                          height: `${(month.billed / Math.max(...mockData.monthlyTrend.map(m => m.wip))) * 100}%` 
                        }}
                      />
                      <div 
                        className="absolute bottom-0 w-full bg-emerald-500 rounded-b"
                        style={{ 
                          height: `${(month.collected / Math.max(...mockData.monthlyTrend.map(m => m.wip))) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium">
                      {formatCurrency(month.collected)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-xs text-gray-600">
                  {lang === 'he' ? 'WIP' : 'WIP'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-xs text-gray-600">
                  {lang === 'he' ? 'חויב' : 'Billed'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-xs text-gray-600">
                  {lang === 'he' ? 'נגבה' : 'Collected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A/R Aging Tab */}
      {activeTab === 'aging' && (
        <div className="space-y-6">
          {/* Aging Buckets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(mockData.arAging.current)}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {lang === 'he' ? '0-30 ימים' : '0-30 Days'}
              </div>
              <div className="text-xs text-green-500 mt-1">
                {formatPercentage((mockData.arAging.current / totalAR) * 100)}
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-yellow-900">
                {formatCurrency(mockData.arAging.days30)}
              </div>
              <div className="text-sm text-yellow-600 font-medium">
                {lang === 'he' ? '31-60 ימים' : '31-60 Days'}
              </div>
              <div className="text-xs text-yellow-500 mt-1">
                {formatPercentage((mockData.arAging.days30 / totalAR) * 100)}
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-orange-900">
                {formatCurrency(mockData.arAging.days60)}
              </div>
              <div className="text-sm text-orange-600 font-medium">
                {lang === 'he' ? '61-90 ימים' : '61-90 Days'}
              </div>
              <div className="text-xs text-orange-500 mt-1">
                {formatPercentage((mockData.arAging.days60 / totalAR) * 100)}
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-red-900">
                {formatCurrency(mockData.arAging.days90Plus)}
              </div>
              <div className="text-sm text-red-600 font-medium">
                {lang === 'he' ? '90+ ימים' : '90+ Days'}
              </div>
              <div className="text-xs text-red-500 mt-1">
                {formatPercentage((mockData.arAging.days90Plus / totalAR) * 100)}
              </div>
            </div>
          </div>

          {/* Aging Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'התפלגות יתרות' : 'A/R Distribution'}
            </h4>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
              <div 
                className="bg-green-400 h-full"
                style={{ width: `${(mockData.arAging.current / totalAR) * 100}%` }}
                title={`Current: ${formatCurrency(mockData.arAging.current)}`}
              />
              <div 
                className="bg-yellow-400 h-full"
                style={{ width: `${(mockData.arAging.days30 / totalAR) * 100}%` }}
                title={`30-60: ${formatCurrency(mockData.arAging.days30)}`}
              />
              <div 
                className="bg-orange-400 h-full"
                style={{ width: `${(mockData.arAging.days60 / totalAR) * 100}%` }}
                title={`60-90: ${formatCurrency(mockData.arAging.days60)}`}
              />
              <div 
                className="bg-red-400 h-full"
                style={{ width: `${(mockData.arAging.days90Plus / totalAR) * 100}%` }}
                title={`90+: ${formatCurrency(mockData.arAging.days90Plus)}`}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-600">
                {lang === 'he' ? 'סך הכל יתרות' : 'Total A/R'}: <strong>{formatCurrency(totalAR)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* Top Performers */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'תיקים מרוויחים ביותר' : 'Top Profitable Matters'}
            </h4>
            <div className="space-y-2">
              {mockData.topMatters.filter(m => m.type === 'top').map((matter, index) => (
                <div
                  key={matter.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                  onClick={() => onMatterClick?.(matter.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{matter.title}</div>
                      <div className="text-sm text-gray-600">{matter.client}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatPercentage(matter.profitability)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(matter.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'תיקים עם רווחיות נמוכה' : 'Low Profitability Matters'}
            </h4>
            <div className="space-y-2">
              {mockData.topMatters.filter(m => m.type === 'bottom').map((matter, index) => (
                <div
                  key={matter.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                  onClick={() => onMatterClick?.(matter.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{matter.title}</div>
                      <div className="text-sm text-gray-600">{matter.client}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formatPercentage(matter.profitability)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(matter.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}