'use client';

import { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, TrendingUp, Search } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { CampaignCard } from '@/components/real-estate/campaigns/CampaignCard';
import { CreateCampaignModal } from '@/components/real-estate/campaigns/CreateCampaignModal';
import { EditCampaignModal } from '@/components/real-estate/campaigns/EditCampaignModal';

interface Campaign {
  id: string;
  name: string;
  status: string;
  platform: string;
  goal?: string;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsClientProps {
  initialData: Campaign[];
  initialFilters?: {
    status?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function CampaignsClient({ initialData, initialFilters = {} }: CampaignsClientProps) {
  const { language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialData);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
  const [platformFilter, setPlatformFilter] = useState(initialFilters.platform || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const t = {
    title: language === 'he' ? 'קמפיינים' : 'Campaigns',
    createCampaign: language === 'he' ? 'צור קמפיין' : 'Create Campaign',
    filters: language === 'he' ? 'סינון' : 'Filters',
    status: language === 'he' ? 'סטטוס' : 'Status',
    platform: language === 'he' ? 'פלטפורמה' : 'Platform',
    search: language === 'he' ? 'חיפוש...' : 'Search...',
    all: language === 'he' ? 'הכל' : 'All',
    active: language === 'he' ? 'פעיל' : 'Active',
    paused: language === 'he' ? 'מושהה' : 'Paused',
    completed: language === 'he' ? 'הושלם' : 'Completed',
    draft: language === 'he' ? 'טיוטה' : 'Draft',
    noCampaigns: language === 'he' ? 'אין קמפיינים עדיין' : 'No campaigns yet',
    noCampaignsDesc: language === 'he' ? 'צור את הקמפיין הראשון שלך כדי להתחיל לעקוב אחר המדדים שלך' : 'Create your first campaign to start tracking your metrics',
    createFirst: language === 'he' ? 'צור קמפיין ראשון' : 'Create your first campaign',
    noResults: language === 'he' ? 'לא נמצאו תוצאות' : 'No results found',
    noResultsDesc: language === 'he' ? 'נסה לשנות את הפילטרים או את שאילתת החיפוש' : 'Try adjusting your filters or search query',
  };

  const platforms = [
    { value: 'all', label: t.all },
    { value: 'META', label: 'Facebook' },
    { value: 'GOOGLE', label: 'Google' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
  ];

  const statuses = [
    { value: 'all', label: t.all },
    { value: 'ACTIVE', label: t.active },
    { value: 'PAUSED', label: t.paused },
    { value: 'COMPLETED', label: t.completed },
    { value: 'DRAFT', label: t.draft },
  ];

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      // Status filter
      if (statusFilter !== 'all' && campaign.status !== statusFilter) {
        return false;
      }

      // Platform filter
      if (platformFilter !== 'all' && campaign.platform !== platformFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return campaign.name.toLowerCase().includes(query);
      }

      return true;
    });
  }, [campaigns, statusFilter, platformFilter, searchQuery]);

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns([newCampaign, ...campaigns]);
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    setEditingCampaign(null);
  };

  const handleCampaignDeleted = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
  };

  const handlePauseResume = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    try {
      const response = await fetch(`/api/real-estate/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update campaign');

      const updatedCampaign = await response.json();
      handleCampaignUpdated(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק קמפיין זה?' : 'Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`/api/real-estate/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      handleCampaignDeleted(campaignId);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0E1A2B' }}
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {t.title}
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{ background: '#2979FF', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2979FF')}
          >
            <Plus className="w-5 h-5" />
            {t.createCampaign}
          </button>
        </div>

        {/* Filters Bar */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: '#1A2F4B', border: '1px solid #374151' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#9CA3AF' }}
              />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: '#0E1A2B',
                  borderColor: '#374151',
                  color: '#FFFFFF',
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                background: '#0E1A2B',
                borderColor: '#374151',
                color: '#FFFFFF',
              }}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                background: '#0E1A2B',
                borderColor: '#374151',
                color: '#FFFFFF',
              }}
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span style={{ color: '#9CA3AF' }}>
                {filteredCampaigns.length} {language === 'he' ? 'קמפיינים' : 'campaigns'}
              </span>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: '#1A2F4B', border: '1px solid #374151' }}
          >
            {campaigns.length === 0 ? (
              <>
                <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#6B7280' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                  {t.noCampaigns}
                </h3>
                <p className="mb-6" style={{ color: '#9CA3AF' }}>
                  {t.noCampaignsDesc}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                  style={{ background: '#2979FF', color: '#FFFFFF' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#2979FF')}
                >
                  <Plus className="w-5 h-5" />
                  {t.createFirst}
                </button>
              </>
            ) : (
              <>
                <Filter className="w-16 h-16 mx-auto mb-4" style={{ color: '#6B7280' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                  {t.noResults}
                </h3>
                <p style={{ color: '#9CA3AF' }}>
                  {t.noResultsDesc}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={handleEdit}
                onPauseResume={handlePauseResume}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCampaignCreated}
      />

      {editingCampaign && (
        <EditCampaignModal
          isOpen={true}
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={handleCampaignUpdated}
        />
      )}
    </div>
  );
}
