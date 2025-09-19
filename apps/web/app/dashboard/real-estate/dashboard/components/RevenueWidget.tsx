'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface Deal {
  id: string;
  propertyId: string;
  propertyTitle: string;
  address: string;
  city: string;
  salePrice: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'closed' | 'at_risk' | 'cancelled';
  closingDate: string;
  daysInPipeline: number;
  clientType: 'buyer' | 'seller' | 'both';
  agent: string;
  probability: number; // 0-100%
  leadSource: string;
  propertyType: string;
}

interface PipelineStage {
  stage: string;
  deals: number;
  value: number;
  avgDaysToClose: number;
}

interface RevenueWidgetProps {
  data?: Deal[];
  onViewDetails?: () => void;
  onDealClick?: (dealId: string) => void;
}

export function RevenueWidget({ data, onViewDetails, onDealClick }: RevenueWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'closed' | 'forecast'>('pipeline');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const mockDeals: Deal[] = data?.length ? data : [
    {
      id: '1',
      propertyId: 'prop1',
      propertyTitle: 'Luxury Penthouse with Sea View',
      address: 'Rothschild Blvd 25',
      city: 'Tel Aviv',
      salePrice: 4200000,
      commissionRate: 3.0,
      commissionAmount: 126000,
      status: 'pending',
      closingDate: '2024-02-15',
      daysInPipeline: 28,
      clientType: 'seller',
      agent: 'Sarah Cohen',
      probability: 85,
      leadSource: 'Meta',
      propertyType: 'penthouse'
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyTitle: 'Modern 3BR Apartment',
      address: 'Ben Gurion St 42',
      city: 'Ramat Gan',
      salePrice: 2800000,
      commissionRate: 2.5,
      commissionAmount: 70000,
      status: 'closed',
      closingDate: '2024-01-20',
      daysInPipeline: 45,
      clientType: 'buyer',
      agent: 'David Levi',
      probability: 100,
      leadSource: 'Google',
      propertyType: 'apartment'
    },
    {
      id: '3',
      propertyId: 'prop3',
      propertyTitle: 'Family House with Garden',
      address: 'Hacarmel St 28',
      city: 'Jerusalem',
      salePrice: 3500000,
      commissionRate: 2.75,
      commissionAmount: 96250,
      status: 'closed',
      closingDate: '2024-01-18',
      daysInPipeline: 38,
      clientType: 'both',
      agent: 'Rachel Gold',
      probability: 100,
      leadSource: 'Referral',
      propertyType: 'house'
    },
    {
      id: '4',
      propertyId: 'prop4',
      propertyTitle: 'Studio Near University',
      address: 'Einstein St 7',
      city: 'Jerusalem',
      salePrice: 1200000,
      commissionRate: 3.5,
      commissionAmount: 42000,
      status: 'at_risk',
      closingDate: '2024-02-28',
      daysInPipeline: 52,
      clientType: 'seller',
      agent: 'Michael Ben-David',
      probability: 45,
      leadSource: 'Portal',
      propertyType: 'studio'
    },
    {
      id: '5',
      propertyId: 'prop5',
      propertyTitle: 'Commercial Space Downtown',
      address: 'Dizengoff St 101',
      city: 'Tel Aviv',
      salePrice: 5500000,
      commissionRate: 2.0,
      commissionAmount: 110000,
      status: 'pending',
      closingDate: '2024-03-15',
      daysInPipeline: 67,
      clientType: 'seller',
      agent: 'Sarah Cohen',
      probability: 70,
      leadSource: 'Email',
      propertyType: 'commercial'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'closed': return 'bg-green-100 text-green-800 border-green-300';
      case 'at_risk': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'buyer': return '🏠';
      case 'seller': return '💰';
      case 'both': return '🔄';
      default: return '👤';
    }
  };

  const pendingDeals = mockDeals.filter(deal => deal.status === 'pending' || deal.status === 'at_risk');
  const closedDeals = mockDeals.filter(deal => deal.status === 'closed');
  const atRiskDeals = mockDeals.filter(deal => deal.status === 'at_risk');

  const totalPipelineValue = pendingDeals.reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const closedRevenue = closedDeals.reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const weightedPipelineValue = pendingDeals.reduce((sum, deal) => sum + (deal.commissionAmount * deal.probability / 100), 0);
  const avgDaysToClose = closedDeals.reduce((sum, deal) => sum + deal.daysInPipeline, 0) / Math.max(1, closedDeals.length);

  const pipelineStages: PipelineStage[] = [
    {
      stage: lang === 'he' ? 'הובלת לידים' : 'Lead Qualification',
      deals: pendingDeals.filter(d => d.probability <= 30).length,
      value: pendingDeals.filter(d => d.probability <= 30).reduce((sum, d) => sum + d.commissionAmount, 0),
      avgDaysToClose: 45
    },
    {
      stage: lang === 'he' ? 'הצגת נכסים' : 'Property Showing',
      deals: pendingDeals.filter(d => d.probability > 30 && d.probability <= 60).length,
      value: pendingDeals.filter(d => d.probability > 30 && d.probability <= 60).reduce((sum, d) => sum + d.commissionAmount, 0),
      avgDaysToClose: 30
    },
    {
      stage: lang === 'he' ? 'משא ומתן' : 'Negotiation',
      deals: pendingDeals.filter(d => d.probability > 60 && d.probability <= 80).length,
      value: pendingDeals.filter(d => d.probability > 60 && d.probability <= 80).reduce((sum, d) => sum + d.commissionAmount, 0),
      avgDaysToClose: 20
    },
    {
      stage: lang === 'he' ? 'סגירה' : 'Closing',
      deals: pendingDeals.filter(d => d.probability > 80).length,
      value: pendingDeals.filter(d => d.probability > 80).reduce((sum, d) => sum + d.commissionAmount, 0),
      avgDaysToClose: 10
    }
  ];

  const tabs = [
    { id: 'pipeline', label: lang === 'he' ? 'פיפליין' : 'Pipeline' },
    { id: 'closed', label: lang === 'he' ? 'עסקאות סגורות' : 'Closed Deals' },
    { id: 'forecast', label: lang === 'he' ? 'תחזית' : 'Forecast' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'הכנסות ופיפליין' : 'Revenue & Pipeline'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${formatCurrency(totalPipelineValue)} בפיפליין • ${pendingDeals.length} עסקאות פעילות`
              : `${formatCurrency(totalPipelineValue)} in pipeline • ${pendingDeals.length} active deals`
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

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{formatCurrency(totalPipelineValue)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'ערך פיפליין' : 'Pipeline Value'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">{formatCurrency(closedRevenue)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'הכנסות שנסגרו' : 'Closed Revenue'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">{formatCurrency(weightedPipelineValue)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'ערך משוקלל' : 'Weighted Value'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">{avgDaysToClose.toFixed(0)}d</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'ממוצע לסגירה' : 'Avg to Close'}
          </div>
        </div>
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Stages */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'שלבי פיפליין' : 'Pipeline Stages'}
            </h4>
            <div className="space-y-3">
              {pipelineStages.map((stage, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {stage.deals}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stage.stage}</div>
                      <div className="text-xs text-gray-600">
                        {stage.avgDaysToClose} {lang === 'he' ? 'ימים ממוצע' : 'days avg'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(stage.value)}</div>
                    <div className="text-xs text-gray-600">
                      {((stage.value / totalPipelineValue) * 100).toFixed(0)}% {lang === 'he' ? 'מהפיפליין' : 'of pipeline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Deals */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'עסקאות פעילות' : 'Active Deals'}
            </h4>
            <div className="space-y-3">
              {pendingDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onDealClick?.(deal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getClientTypeIcon(deal.clientType)}</span>
                        <h5 className="font-medium text-gray-900">{deal.propertyTitle}</h5>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(deal.status)}`}>
                          {lang === 'he' 
                            ? deal.status === 'pending' ? 'ממתין'
                              : deal.status === 'at_risk' ? 'בסיכון'
                              : deal.status
                            : deal.status.replace('_', ' ')
                          }
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        📍 {deal.address}, {deal.city} • 💰 {formatCurrency(deal.salePrice)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        👤 {deal.agent} • 📅 {formatDate(deal.closingDate)} • 🔗 {deal.leadSource}
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'עמלה:' : 'Commission:'}</span>
                          <div className="font-medium">{formatCurrency(deal.commissionAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'שיעור:' : 'Rate:'}</span>
                          <div className="font-medium">{deal.commissionRate}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'בפיפליין:' : 'In Pipeline:'}</span>
                          <div className="font-medium">{deal.daysInPipeline}d</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'סיכוי:' : 'Probability:'}</span>
                          <div className={`font-medium ${getProbabilityColor(deal.probability)}`}>
                            {deal.probability}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Closed Tab */}
      {activeTab === 'closed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {lang === 'he' ? 'עסקאות שנסגרו השנה' : 'Closed Deals This Year'}
            </h4>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
            >
              <option value="month">{lang === 'he' ? 'חודש זה' : 'This Month'}</option>
              <option value="quarter">{lang === 'he' ? 'רבעון זה' : 'This Quarter'}</option>
              <option value="year">{lang === 'he' ? 'שנה זו' : 'This Year'}</option>
            </select>
          </div>

          <div className="space-y-3">
            {closedDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => onDealClick?.(deal.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h5 className="font-medium text-gray-900">{deal.propertyTitle}</h5>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
                        {lang === 'he' ? 'נסגר' : 'Closed'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {deal.address}, {deal.city} • 💰 {formatCurrency(deal.salePrice)}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      👤 {deal.agent} • 📅 {formatDate(deal.closingDate)} • ⏱️ {deal.daysInPipeline} {lang === 'he' ? 'ימים' : 'days'}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'עמלה:' : 'Commission:'}</span>
                        <div className="font-medium text-green-600">{formatCurrency(deal.commissionAmount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'שיעור:' : 'Rate:'}</span>
                        <div className="font-medium">{deal.commissionRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'סוג לקוח:' : 'Client Type:'}</span>
                        <div className="font-medium">{deal.clientType}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'תחזית הכנסות' : 'Revenue Forecast'}
          </h4>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {lang === 'he' ? 'חודש הבא' : 'Next Month'}
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'סגירות צפויות:' : 'Expected Closings:'}</span>
                  <span className="text-sm font-medium">{pendingDeals.filter(d => d.probability >= 70).length}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'הכנסות צפויות:' : 'Expected Revenue:'}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(pendingDeals.filter(d => d.probability >= 70).reduce((sum, d) => sum + d.commissionAmount, 0))}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'הכנסות משוקללות:' : 'Weighted Revenue:'}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(pendingDeals.reduce((sum, d) => sum + (d.commissionAmount * d.probability / 100), 0) * 0.3)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {lang === 'he' ? 'רבעון הבא' : 'Next Quarter'}
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'סגירות צפויות:' : 'Expected Closings:'}</span>
                  <span className="text-sm font-medium">{pendingDeals.length}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'הכנסות צפויות:' : 'Expected Revenue:'}</span>
                  <span className="text-sm font-medium">{formatCurrency(totalPipelineValue)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'הכנסות משוקללות:' : 'Weighted Revenue:'}</span>
                  <span className="text-sm font-medium">{formatCurrency(weightedPipelineValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          {atRiskDeals.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-700 mb-3">
                ⚠️ {lang === 'he' ? 'עסקאות בסיכון' : 'Deals at Risk'}
              </h5>
              <div className="space-y-2">
                {atRiskDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{deal.propertyTitle}</div>
                      <div className="text-xs text-gray-600">{deal.agent} • {deal.daysInPipeline} {lang === 'he' ? 'ימים' : 'days'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{formatCurrency(deal.commissionAmount)}</div>
                      <div className="text-xs text-red-600">{deal.probability}% {lang === 'he' ? 'סיכוי' : 'chance'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {lang === 'he' ? '+ עסקה חדשה' : '+ New Deal'}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            {lang === 'he' ? 'ייצא דוח' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
}