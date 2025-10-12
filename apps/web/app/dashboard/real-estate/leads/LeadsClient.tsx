'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, Flame, Wind, Snowflake, Trash2, Edit, Eye, Bot } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { LeadQualificationBot } from '@/components/real-estate/LeadQualificationBot';

interface Lead {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  source?: string;
  message?: string;
  qualificationStatus?: 'HOT' | 'WARM' | 'COLD';
  propertyId?: string;
  property?: {
    id: string;
    name: string;
    address?: string;
    price?: number;
  };
  createdAt: string;
}

export function LeadsClient() {
  const { language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showQualificationBot, setShowQualificationBot] = useState(false);
  const [leadToQualify, setLeadToQualify] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [search, statusFilter, sourceFilter, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/real-estate/leads', {
        headers: {
          'x-owner-uid': 'demo-user' // TODO: Get from auth
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      // Use mock data for demo
      setLeads(getMockLeads());
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.fullName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.qualificationStatus === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <Flame className="w-3 h-3" />
            {language === 'he' ? 'חם' : 'Hot'}
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            <Wind className="w-3 h-3" />
            {language === 'he' ? 'פושר' : 'Warm'}
          </span>
        );
      case 'COLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <Snowflake className="w-3 h-3" />
            {language === 'he' ? 'קר' : 'Cold'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {language === 'he' ? 'לא מסווג' : 'Unqualified'}
          </span>
        );
    }
  };

  const getSourceBadge = (source?: string) => {
    const sources: Record<string, { label: string; color: string }> = {
      WEBSITE: { label: language === 'he' ? 'אתר' : 'Website', color: 'bg-purple-100 text-purple-700' },
      FACEBOOK: { label: 'Facebook', color: 'bg-blue-100 text-blue-700' },
      INSTAGRAM: { label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
      REFERRAL: { label: language === 'he' ? 'הפניה' : 'Referral', color: 'bg-green-100 text-green-700' },
      MANUAL: { label: language === 'he' ? 'ידני' : 'Manual', color: 'bg-gray-100 text-gray-700' },
    };

    const sourceData = sources[source || 'MANUAL'] || sources.MANUAL;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sourceData.color}`}>
        {sourceData.label}
      </span>
    );
  };

  const handleQualifyLead = (lead: Lead) => {
    setLeadToQualify(lead);
    setShowQualificationBot(true);
  };

  const handleQualificationComplete = async (qualification: any) => {
    // Update lead with new qualification
    try {
      const response = await fetch(`/api/real-estate/leads/${leadToQualify?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-uid': 'demo-user',
        },
        body: JSON.stringify({
          qualificationStatus: qualification.status,
        }),
      });

      if (response.ok) {
        // Refresh leads
        await fetchLeads();
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }

    setShowQualificationBot(false);
    setLeadToQualify(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'he' ? 'ניהול לידים' : 'Lead Management'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'he' ? `${filteredLeads.length} לידים מתוך ${leads.length}` : `${filteredLeads.length} of ${leads.length} leads`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {language === 'he' ? 'ליד חדש' : 'New Lead'}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'he' ? 'חיפוש לפי שם, אימייל או טלפון...' : 'Search by name, email, or phone...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
          <option value="HOT">{language === 'he' ? 'חם' : 'Hot'}</option>
          <option value="WARM">{language === 'he' ? 'פושר' : 'Warm'}</option>
          <option value="COLD">{language === 'he' ? 'קר' : 'Cold'}</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">{language === 'he' ? 'כל המקורות' : 'All Sources'}</option>
          <option value="WEBSITE">{language === 'he' ? 'אתר' : 'Website'}</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="REFERRAL">{language === 'he' ? 'הפניה' : 'Referral'}</option>
          <option value="MANUAL">{language === 'he' ? 'ידני' : 'Manual'}</option>
        </select>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'he' ? 'לא נמצאו לידים' : 'No leads found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'he' ? 'נסה לשנות את הפילטרים או להוסיף ליד חדש' : 'Try changing the filters or add a new lead'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {language === 'he' ? 'ליד חדש' : 'New Lead'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{lead.fullName}</h3>
                  <div className="flex gap-2 mt-1">
                    {getStatusBadge(lead.qualificationStatus)}
                    {getSourceBadge(lead.source)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.property && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{lead.property.name}</span>
                  </div>
                )}
              </div>

              {lead.message && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lead.message}</p>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleQualifyLead(lead)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  {language === 'he' ? 'סווג עם AI' : 'Qualify with AI'}
                </button>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={language === 'he' ? 'צפה' : 'View'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title={language === 'he' ? 'ערוך' : 'Edit'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={language === 'he' ? 'מחק' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Qualification Bot Modal */}
      {showQualificationBot && leadToQualify && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <LeadQualificationBot
            lead={leadToQualify}
            onClose={() => {
              setShowQualificationBot(false);
              setLeadToQualify(null);
            }}
            onQualified={handleQualificationComplete}
          />
        </div>
      )}

      {/* TODO: Add Create/Edit Modal */}
      {/* TODO: Add Lead Detail Modal */}
    </div>
  );
}

// Mock data for demo
function getMockLeads(): Lead[] {
  return [
    {
      id: '1',
      fullName: 'Sarah Cohen',
      email: 'sarah.cohen@example.com',
      phone: '+972-50-123-4567',
      source: 'WEBSITE',
      qualificationStatus: 'HOT',
      message: 'Interested in 3-bedroom apartment in Tel Aviv',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      fullName: 'David Levi',
      email: 'david.levi@example.com',
      phone: '+972-54-987-6543',
      source: 'FACEBOOK',
      qualificationStatus: 'WARM',
      message: 'Looking for investment property',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      fullName: 'Rachel Green',
      email: 'rachel@example.com',
      source: 'REFERRAL',
      qualificationStatus: 'COLD',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}
