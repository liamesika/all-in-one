'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'meta' | 'google' | 'email' | 'sms' | 'portal' | 'social';
  status: 'active' | 'paused' | 'completed' | 'draft';
  propertyId?: string;
  propertyTitle?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
  cost_per_lead: number;
  conversion_rate: number;
  startDate: string;
  endDate?: string;
  targetAudience: string;
  createdBy: string;
  performance: {
    ctr: number; // click-through rate
    cpc: number; // cost per click
    frequency: number;
    reach: number;
  };
}

interface AutoMarketingWidgetProps {
  data?: MarketingCampaign[];
  onViewDetails?: () => void;
  onCampaignClick?: (campaignId: string) => void;
}

export function AutoMarketingWidget({ data, onViewDetails, onCampaignClick }: AutoMarketingWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'performance'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'meta' | 'google' | 'email' | 'sms'>('all');

  const mockCampaigns: MarketingCampaign[] = data?.length ? data : [
    {
      id: '1',
      name: 'Tel Aviv Luxury Apartments - Meta',
      type: 'meta',
      status: 'active',
      propertyId: 'prop1',
      propertyTitle: 'Luxury Penthouse with Sea View',
      budget: 5000,
      spent: 3200,
      impressions: 45000,
      clicks: 850,
      leads: 28,
      cost_per_lead: 114.3,
      conversion_rate: 3.3,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      targetAudience: 'High-income, 35-55, Tel Aviv area',
      createdBy: 'Sarah Cohen',
      performance: {
        ctr: 1.9,
        cpc: 3.76,
        frequency: 2.1,
        reach: 21500
      }
    },
    {
      id: '2',
      name: 'Family Homes Jerusalem - Google Ads',
      type: 'google',
      status: 'active',
      propertyId: 'prop3',
      propertyTitle: 'Family House with Garden',
      budget: 3000,
      spent: 2100,
      impressions: 28000,
      clicks: 420,
      leads: 15,
      cost_per_lead: 140.0,
      conversion_rate: 3.6,
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      targetAudience: 'Families, 30-45, Jerusalem metro',
      createdBy: 'Rachel Gold',
      performance: {
        ctr: 1.5,
        cpc: 5.0,
        frequency: 1.8,
        reach: 15600
      }
    },
    {
      id: '3',
      name: 'New Listing Alert - Email Campaign',
      type: 'email',
      status: 'completed',
      budget: 500,
      spent: 450,
      impressions: 12000,
      clicks: 720,
      leads: 45,
      cost_per_lead: 10.0,
      conversion_rate: 6.25,
      startDate: '2024-01-10',
      endDate: '2024-01-17',
      targetAudience: 'Email subscribers, Active buyers',
      createdBy: 'David Levi',
      performance: {
        ctr: 6.0,
        cpc: 0.63,
        frequency: 1.2,
        reach: 10000
      }
    },
    {
      id: '4',
      name: 'Open House Reminders - SMS',
      type: 'sms',
      status: 'active',
      budget: 200,
      spent: 180,
      impressions: 5000,
      clicks: 0,
      leads: 12,
      cost_per_lead: 15.0,
      conversion_rate: 24.0,
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      targetAudience: 'Registered leads, Local area',
      createdBy: 'Michael Ben-David',
      performance: {
        ctr: 0,
        cpc: 0,
        frequency: 1.0,
        reach: 5000
      }
    },
    {
      id: '5',
      name: 'Social Media Boost - Instagram',
      type: 'social',
      status: 'paused',
      budget: 1500,
      spent: 800,
      impressions: 25000,
      clicks: 300,
      leads: 8,
      cost_per_lead: 100.0,
      conversion_rate: 2.7,
      startDate: '2024-01-12',
      targetAudience: 'Young professionals, Social media users',
      createdBy: 'Sarah Cohen',
      performance: {
        ctr: 1.2,
        cpc: 2.67,
        frequency: 2.5,
        reach: 10000
      }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meta': return '📘';
      case 'google': return '🔍';
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'portal': return '🏠';
      case 'social': return '📸';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meta': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'google': return 'bg-green-100 text-green-800 border-green-300';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'sms': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'portal': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'social': return 'bg-pink-100 text-pink-800 border-pink-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredCampaigns = filterType === 'all' 
    ? mockCampaigns 
    : mockCampaigns.filter(campaign => campaign.type === filterType);

  const activeCampaigns = mockCampaigns.filter(campaign => campaign.status === 'active');
  const totalBudget = mockCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpent = mockCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalLeads = mockCampaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
  const avgCostPerLead = totalSpent > 0 && totalLeads > 0 ? totalSpent / totalLeads : 0;
  const totalClicks = mockCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;

  const tabs = [
    { id: 'overview', label: lang === 'he' ? 'סקירה כללית' : 'Overview' },
    { id: 'campaigns', label: lang === 'he' ? 'קמפיינים' : 'Campaigns' },
    { id: 'performance', label: lang === 'he' ? 'ביצועים' : 'Performance' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'תפוקות שיווק אוטומטי' : 'Auto-Marketing Outputs'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${activeCampaigns.length} קמפיינים פעילים • ${formatCurrency(avgCostPerLead)} עלות ללייד`
              : `${activeCampaigns.length} active campaigns • ${formatCurrency(avgCostPerLead)} cost per lead`
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {lang === 'he' ? 'סה״כ הוצאה' : 'Total Spent'}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(0)}% {lang === 'he' ? 'מהתקציב' : 'of budget'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {totalLeads}
              </div>
              <div className="text-sm text-green-700 font-medium">
                {lang === 'he' ? 'לידים שנוצרו' : 'Leads Generated'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(avgCostPerLead)}
              </div>
              <div className="text-sm text-purple-700 font-medium">
                {lang === 'he' ? 'עלות ללייד' : 'Cost/Lead'}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {avgCTR.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 font-medium">
                {lang === 'he' ? 'CTR ממוצע' : 'Avg CTR'}
              </div>
            </div>
          </div>

          {/* Channel Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'ביצועי ערוצים' : 'Channel Performance'}
            </h4>
            <div className="space-y-3">
              {['meta', 'google', 'email', 'sms'].map(channel => {
                const channelCampaigns = mockCampaigns.filter(c => c.type === channel);
                const channelLeads = channelCampaigns.reduce((sum, c) => sum + c.leads, 0);
                const channelSpent = channelCampaigns.reduce((sum, c) => sum + c.spent, 0);
                const channelCPL = channelSpent > 0 && channelLeads > 0 ? channelSpent / channelLeads : 0;
                
                return (
                  <div key={channel} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getTypeIcon(channel)}</span>
                      <span className="font-medium text-gray-900 capitalize">{channel}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{channelLeads} {lang === 'he' ? 'לידים' : 'leads'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{formatCurrency(channelCPL)} {lang === 'he' ? 'CPL' : 'CPL'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {lang === 'he' ? 'קמפיינים פעילים' : 'Active Campaigns'}
            </h4>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
            >
              <option value="all">{lang === 'he' ? 'כל הערוצים' : 'All Channels'}</option>
              <option value="meta">Meta</option>
              <option value="google">Google</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onCampaignClick?.(campaign.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(campaign.type)}</span>
                      <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeColor(campaign.type)}`}>
                        {campaign.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
                        {lang === 'he' 
                          ? campaign.status === 'active' ? 'פעיל'
                            : campaign.status === 'paused' ? 'מושהה'
                            : campaign.status === 'completed' ? 'הושלם'
                            : 'טיוטה'
                          : campaign.status
                        }
                      </span>
                    </div>
                    
                    {campaign.propertyTitle && (
                      <div className="text-sm text-gray-600 mb-2">
                        🏠 {campaign.propertyTitle}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-2">
                      🎯 {campaign.targetAudience} • 👤 {campaign.createdBy}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'תקציב:' : 'Budget:'}</span>
                        <div className="font-medium">{formatCurrency(campaign.budget)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'הוצא:' : 'Spent:'}</span>
                        <div className="font-medium">{formatCurrency(campaign.spent)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'לידים:' : 'Leads:'}</span>
                        <div className="font-medium">{campaign.leads}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{lang === 'he' ? 'CPL:' : 'CPL:'}</span>
                        <div className="font-medium">{formatCurrency(campaign.cost_per_lead)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'ניתוח ביצועים מפורט' : 'Detailed Performance Analysis'}
          </h4>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {lang === 'he' ? 'מדדי מפתח' : 'Key Metrics'}
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'סה״כ הופעות:' : 'Total Impressions:'}</span>
                  <span className="text-sm font-medium">{totalImpressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'סה״כ קליקים:' : 'Total Clicks:'}</span>
                  <span className="text-sm font-medium">{totalClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'CTR כללי:' : 'Overall CTR:'}</span>
                  <span className="text-sm font-medium">{avgCTR.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{lang === 'he' ? 'אחוז המרה:' : 'Conversion Rate:'}</span>
                  <span className="text-sm font-medium">
                    {totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {lang === 'he' ? 'השוואת ערוצים' : 'Channel Comparison'}
              </h5>
              <div className="space-y-2">
                {['meta', 'google', 'email', 'sms'].map(channel => {
                  const campaigns = mockCampaigns.filter(c => c.type === channel);
                  const leads = campaigns.reduce((sum, c) => sum + c.leads, 0);
                  const spent = campaigns.reduce((sum, c) => sum + c.spent, 0);
                  const cpl = spent > 0 && leads > 0 ? spent / leads : 0;
                  
                  return (
                    <div key={channel} className="flex items-center justify-between text-xs">
                      <span className="font-medium capitalize">{channel}</span>
                      <div className="flex items-center gap-3">
                        <span>{leads} leads</span>
                        <span className="text-gray-600">{formatCurrency(cpl)} CPL</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {lang === 'he' ? '+ קמפיין חדש' : '+ New Campaign'}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            {lang === 'he' ? 'ייצא דוח' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
}