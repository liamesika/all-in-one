'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  qualification: 'hot' | 'warm' | 'cold';
  timeToContact: number; // hours
  status: 'uncontacted' | 'contacted' | 'qualified' | 'viewing' | 'offer' | 'deal';
  budget: number;
  propertyType: string;
  city: string;
  createdAt: string;
  assignedAgent?: string;
}

interface LeadsQualityProps {
  data?: LeadData[];
  onViewDetails?: () => void;
  onLeadClick?: (leadId: string) => void;
}

export function LeadsQualityWidget({ data, onViewDetails, onLeadClick }: LeadsQualityProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'sources'>('overview');

  // Mock data if no data provided
  const mockLeads: LeadData[] = data?.length ? data : [
    {
      id: '1',
      name: 'David Cohen',
      email: 'david@email.com',
      phone: '+972-50-123-4567',
      source: 'Meta',
      qualification: 'hot',
      timeToContact: 0.5,
      status: 'contacted',
      budget: 2500000,
      propertyType: 'apartment',
      city: 'Tel Aviv',
      createdAt: '2024-01-15T10:30:00Z',
      assignedAgent: 'Sarah Cohen'
    },
    {
      id: '2',
      name: 'Rachel Levi',
      email: 'rachel@email.com',
      phone: '+972-52-987-6543',
      source: 'Google',
      qualification: 'warm',
      timeToContact: 2.5,
      status: 'qualified',
      budget: 1800000,
      propertyType: 'house',
      city: 'Ramat Gan',
      createdAt: '2024-01-15T14:15:00Z',
      assignedAgent: 'David Levi'
    },
    {
      id: '3',
      name: 'Michael Gold',
      email: 'michael@email.com',
      phone: '+972-54-555-7777',
      source: 'Portal',
      qualification: 'cold',
      timeToContact: 8.0,
      status: 'uncontacted',
      budget: 1200000,
      propertyType: 'studio',
      city: 'Jerusalem',
      createdAt: '2024-01-15T16:45:00Z'
    },
    {
      id: '4',
      name: 'Anna Rosenberg',
      email: 'anna@email.com',
      phone: '+972-50-888-9999',
      source: 'Referral',
      qualification: 'hot',
      timeToContact: 1.0,
      status: 'viewing',
      budget: 3200000,
      propertyType: 'penthouse',
      city: 'Tel Aviv',
      createdAt: '2024-01-15T09:20:00Z',
      assignedAgent: 'Rachel Gold'
    }
  ];

  const qualificationStats = {
    hot: mockLeads.filter(lead => lead.qualification === 'hot').length,
    warm: mockLeads.filter(lead => lead.qualification === 'warm').length,
    cold: mockLeads.filter(lead => lead.qualification === 'cold').length
  };

  const sourceStats = mockLeads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uncontactedLeads = mockLeads.filter(lead => lead.status === 'uncontacted');
  const avgTimeToContact = mockLeads.filter(lead => lead.status !== 'uncontacted')
    .reduce((sum, lead) => sum + lead.timeToContact, 0) / 
    Math.max(1, mockLeads.filter(lead => lead.status !== 'uncontacted').length);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}${lang === 'he' ? 'ד' : 'm'}`;
    }
    return `${hours.toFixed(1)}${lang === 'he' ? 'ש' : 'h'}`;
  };

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uncontacted': return 'bg-red-50 text-red-700 border-red-200';
      case 'contacted': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'qualified': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'offer': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'deal': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: lang === 'he' ? 'סקירה כללית' : 'Overview' },
    { id: 'queue', label: lang === 'he' ? 'תור פניות' : 'Contact Queue' },
    { id: 'sources', label: lang === 'he' ? 'מקורות' : 'Sources' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'איכות לידים וניתוב' : 'Leads Quality & Routing'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${avgTimeToContact.toFixed(1)} שעות זמן יצירת קשר ממוצע`
              : `${avgTimeToContact.toFixed(1)}h avg time to contact`
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
          {/* Qualification Distribution */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'התפלגות איכות לידים' : 'Lead Quality Distribution'}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {qualificationStats.hot}
                </div>
                <div className="text-sm text-red-700 font-medium">
                  🔥 {lang === 'he' ? 'חמים' : 'Hot'}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {qualificationStats.warm}
                </div>
                <div className="text-sm text-yellow-700 font-medium">
                  🟡 {lang === 'he' ? 'חמימים' : 'Warm'}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {qualificationStats.cold}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  🔵 {lang === 'he' ? 'קרים' : 'Cold'}
                </div>
              </div>
            </div>
          </div>

          {/* Top Sources */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'מקורות מובילים' : 'Top Sources'}
            </h4>
            <div className="space-y-2">
              {Object.entries(sourceStats)
                .sort(([,a], [,b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{source}</span>
                    <span className="text-sm text-gray-600">
                      {count} {lang === 'he' ? 'לידים' : 'leads'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {lang === 'he' ? 'ממתינים ליצירת קשר' : 'Awaiting Contact'}
            </h4>
            <span className="text-sm text-gray-600">
              {uncontactedLeads.length} {lang === 'he' ? 'לידים' : 'leads'}
            </span>
          </div>
          
          {uncontactedLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium mb-1">
                {lang === 'he' ? 'כל הלידים נוצר איתם קשר' : 'All leads contacted'}
              </div>
              <div className="text-sm">
                {lang === 'he' ? 'אין לידים ממתינים' : 'No pending contacts'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {uncontactedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => onLeadClick?.(lead.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900">{lead.name}</h5>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getQualificationColor(lead.qualification)}`}>
                          {lang === 'he' 
                            ? lead.qualification === 'hot' ? 'חם' 
                              : lead.qualification === 'warm' ? 'חמים' 
                              : 'קר'
                            : lead.qualification
                          }
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📧 {lead.email} • 📱 {lead.phone}</div>
                        <div>🏠 {lead.propertyType} • 📍 {lead.city} • {formatCurrency(lead.budget)}</div>
                        <div>📱 {lead.source} • ⏰ {new Date(lead.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {lang === 'he' ? 'ממתין' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'ביצועי מקורות לידים' : 'Lead Source Performance'}
          </h4>
          
          <div className="space-y-3">
            {Object.entries(sourceStats).map(([source, count]) => {
              const sourceLeads = mockLeads.filter(lead => lead.source === source);
              const avgBudget = sourceLeads.reduce((sum, lead) => sum + lead.budget, 0) / sourceLeads.length;
              const avgTimeToContact = sourceLeads
                .filter(lead => lead.status !== 'uncontacted')
                .reduce((sum, lead) => sum + lead.timeToContact, 0) / 
                Math.max(1, sourceLeads.filter(lead => lead.status !== 'uncontacted').length);
              
              return (
                <div key={source} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{source}</h5>
                    <span className="text-sm text-gray-600">
                      {count} {lang === 'he' ? 'לידים' : 'leads'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        {lang === 'he' ? 'תקציב ממוצע:' : 'Avg Budget:'}
                      </span>
                      <div className="font-medium">{formatCurrency(avgBudget)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {lang === 'he' ? 'זמן יצירת קשר:' : 'Time to Contact:'}
                      </span>
                      <div className="font-medium">{formatTime(avgTimeToContact)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}