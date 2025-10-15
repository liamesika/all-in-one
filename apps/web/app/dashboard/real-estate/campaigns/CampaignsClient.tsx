'use client';

/**
 * Campaigns Client Component (Redesigned with Design System 2.0)
 * Manage marketing campaigns across multiple platforms
 */

import { useState, useMemo } from 'react';
import { Plus, Filter, TrendingUp, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { CampaignCard } from '@/components/real-estate/campaigns/CampaignCard';
import { CreateCampaignModal } from '@/components/real-estate/campaigns/CreateCampaignModal';
import { EditCampaignModal } from '@/components/real-estate/campaigns/EditCampaignModal';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';

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
    <main
      className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              {language === 'he' ? 'נהל את הקמפיינים שלך בכל הפלטפורמות' : 'Manage your campaigns across all platforms'}
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t.createCampaign}
          </UniversalButton>
        </div>

        {/* Filters Bar */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
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
                className="px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center">
                <span className="text-body-sm text-gray-600 dark:text-gray-400 font-medium">
                  {filteredCampaigns.length} {language === 'he' ? 'קמפיינים' : 'campaigns'}
                </span>
              </div>
            </div>
          </CardBody>
        </UniversalCard>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <UniversalCard variant="outlined">
            <CardBody className="p-12 text-center">
              {campaigns.length === 0 ? (
                <>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2979FF]/10 to-purple-500/10 rounded-full">
                    <TrendingUp className="w-8 h-8 text-[#2979FF]" />
                  </div>
                  <h3 className="text-heading-3 text-gray-900 dark:text-white mb-2">
                    {t.noCampaigns}
                  </h3>
                  <p className="text-body-base text-gray-600 dark:text-gray-400 mb-6">
                    {t.noCampaignsDesc}
                  </p>
                  <UniversalButton
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    {t.createFirst}
                  </UniversalButton>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#1A2F4B] rounded-full">
                    <Filter className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-heading-3 text-gray-900 dark:text-white mb-2">
                    {t.noResults}
                  </h3>
                  <p className="text-body-base text-gray-600 dark:text-gray-400">
                    {t.noResultsDesc}
                  </p>
                </>
              )}
            </CardBody>
          </UniversalCard>
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
    </main>
  );
}
