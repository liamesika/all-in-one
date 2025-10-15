'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import NewCampaignModal from '@/components/modals/NewCampaignModal';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  StatusBadge,
  TableEmptyState,
} from '@/components/shared';
import { Plus, Filter, Link as LinkIcon, Play, Pause, Eye, Edit, Copy, ArrowLeft, Megaphone } from 'lucide-react';

type CampaignStatus = 'DRAFT' | 'READY' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'FAILED';
type CampaignPlatform = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';
type CampaignGoal = 'TRAFFIC' | 'CONVERSIONS' | 'LEADS' | 'BRAND_AWARENESS' | 'REACH' | 'ENGAGEMENT';

type Campaign = {
  id: string;
  name: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  goal: CampaignGoal;
  budget?: number;
  dailyBudget?: number;
  audience?: any;
  creative?: any;
  platformCampaignId?: string;
  platformAdSetId?: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
  preflightChecks?: any;
  lastCheckAt?: string;
  createdAt: string;
  updatedAt: string;
  connection?: {
    id: string;
    platform: CampaignPlatform;
    status: string;
    accountName?: string;
  };
  _count?: {
    leads: number;
  };
};

type OAuthConnection = {
  id: string;
  platform: CampaignPlatform;
  status: 'CONNECTED' | 'EXPIRED' | 'ERROR' | 'DISCONNECTED';
  accountName?: string;
  lastChecked?: string;
  lastError?: string;
};

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  READY: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
  FAILED: 'bg-red-100 text-red-800',
};

const PLATFORM_LABELS = {
  META: 'Meta (Facebook/Instagram)',
  GOOGLE: 'Google Ads',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
};

const GOAL_LABELS = {
  TRAFFIC: 'Website Traffic',
  CONVERSIONS: 'Conversions',
  LEADS: 'Lead Generation',
  BRAND_AWARENESS: 'Brand Awareness',
  REACH: 'Reach',
  ENGAGEMENT: 'Engagement',
};

function CampaignsClient({ ownerUid }: { ownerUid: string }) {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState<Campaign | null>(null);
  const [showActivationModal, setShowActivationModal] = useState<Campaign | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    platform: '',
    search: '',
  });

  useEffect(() => {
    if (ownerUid) {
      fetchCampaigns();
      fetchConnections();
    }
  }, [ownerUid]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle deep-link for new campaign modal
  useEffect(() => {
    if (mounted) {
      const isNewParam = searchParams?.get('new');
      if (isNewParam === '1') {
        setShowCreateModal(true);
      }
    }
  }, [mounted, searchParams]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns?ownerUid=${ownerUid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCampaignSuccess = () => {
    // Refresh campaigns list to show the new campaign
    fetchCampaigns();
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/connections?ownerUid=${ownerUid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const activateCampaign = async (campaign: Campaign) => {
    setActionLoading(campaign.id);
    
    try {
      // First, run pre-flight checks
      const checkResponse = await fetch(`/api/campaigns/${campaign.id}/preflight-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!checkResponse.ok) {
        const checkData = await checkResponse.json();
        throw new Error(checkData.message || 'Pre-flight check failed');
      }

      const checkData = await checkResponse.json();
      
      // If checks passed, activate the campaign
      if (checkData.canActivate) {
        const activateResponse = await fetch(`/api/campaigns/${campaign.id}/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerUid }),
        });

        if (!activateResponse.ok) {
          const activateData = await activateResponse.json();
          throw new Error(activateData.message || 'Failed to activate campaign');
        }

        // Show success and refresh
        showToast(language === 'he' ? 'קמפיין הופעל בהצלחה!' : 'Campaign activated successfully!', 'success');
        fetchCampaigns();
      } else {
        // Show specific issues that need to be resolved
        throw new Error(checkData.issues.join('\n'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate campaign';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
      setShowActivationModal(null);
    }
  };

  const pauseCampaign = async (campaign: Campaign) => {
    setActionLoading(campaign.id);
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to pause campaign');
      }

      showToast(language === 'he' ? 'קמפיין הושהה' : 'Campaign paused', 'success');
      fetchCampaigns();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause campaign';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const duplicateCampaign = async (campaign: Campaign) => {
    setActionLoading(campaign.id);
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to duplicate campaign');
      }

      showToast(language === 'he' ? 'קמפיין שוכפל בהצלחה' : 'Campaign duplicated successfully', 'success');
      fetchCampaigns();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate campaign';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - in a real app, you'd use a toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-md text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
  };

  const getConnectionStatus = (platform: CampaignPlatform) => {
    const connection = connections.find(c => c.platform === platform);
    return connection?.status || 'DISCONNECTED';
  };

  const canActivateCampaign = (campaign: Campaign) => {
    const connectionStatus = getConnectionStatus(campaign.platform);
    return connectionStatus === 'CONNECTED' && campaign.status === 'READY';
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.platform && campaign.platform !== filters.platform) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.goal.toLowerCase().includes(searchLower) ||
        campaign.platform.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  const campaignStats = {
    total: campaigns.length,
    ready: campaigns.filter(c => c.status === 'READY').length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    paused: campaigns.filter(c => c.status === 'PAUSED').length,
    blocked: campaigns.filter(c => getConnectionStatus(c.platform) !== 'CONNECTED').length,
  };

  return (
    <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <UniversalCard variant="default" className="mb-0 rounded-none border-x-0 border-t-0">
        <CardBody className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <UniversalButton
                variant="ghost"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push('/dashboard/e-commerce/dashboard')}
              >
                {language === 'he' ? 'חזרה לדשבורד' : 'Back to Dashboard'}
              </UniversalButton>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'he' ? 'קמפיינים' : 'Campaigns'}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {campaigns.length} {language === 'he' ? 'קמפיינים' : 'campaigns'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageToggle />

              <UniversalButton
                variant="outline"
                size="md"
                leftIcon={<LinkIcon className="w-4 h-4" />}
                onClick={() => router.push('/dashboard/e-commerce/connections')}
              >
                {language === 'he' ? 'חיבורים' : 'Connections'}
              </UniversalButton>

              <UniversalButton
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                {language === 'he' ? 'קמפיין חדש' : 'New Campaign'}
              </UniversalButton>
            </div>
          </div>
        </CardBody>
      </UniversalCard>

      {/* Stats Bar */}
      <UniversalCard variant="default" className="mb-0 rounded-none border-x-0">
        <CardBody className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{campaignStats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'סה"כ' : 'Total'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{campaignStats.ready}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'מוכנים' : 'Ready'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{campaignStats.active}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'פעילים' : 'Active'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{campaignStats.paused}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'מושהים' : 'Paused'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{campaignStats.blocked}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'חסומים' : 'Blocked'}</div>
            </div>
          </div>
        </CardBody>
      </UniversalCard>

      {/* Filters */}
      <UniversalCard variant="default" className="mb-0 rounded-none border-x-0">
        <CardBody className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={language === 'he' ? 'חיפוש קמפיינים...' : 'Search campaigns...'}
                className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              />
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              >
                <option value="">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                {Object.entries(STATUS_COLORS).map(([status]) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.platform}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              >
                <option value="">{language === 'he' ? 'כל הפלטפורמות' : 'All Platforms'}</option>
                {Object.entries(PLATFORM_LABELS).map(([platform, label]) => (
                  <option key={platform} value={platform}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <UniversalButton
                variant="outline"
                size="md"
                onClick={() => setFilters({ status: '', platform: '', search: '' })}
                className="w-full"
              >
                {language === 'he' ? 'נקה מסננים' : 'Clear Filters'}
              </UniversalButton>
            </div>
          </div>
        </CardBody>
      </UniversalCard>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <UniversalCard variant="default" className="mb-4 border-red-200 dark:border-red-800">
            <CardBody className="bg-red-50 dark:bg-red-900/20">
              <div className="text-red-800 dark:text-red-200">{error}</div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                {language === 'he' ? 'סגור' : 'Dismiss'}
              </button>
            </CardBody>
          </UniversalCard>
        )}

        {loading ? (
          <UniversalCard>
            <CardBody>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
              </div>
            </CardBody>
          </UniversalCard>
        ) : filteredCampaigns.length === 0 ? (
          <UniversalCard>
            <CardBody>
              <TableEmptyState
                icon={<Megaphone className="w-16 h-16" />}
                title={campaigns.length === 0
                  ? (language === 'he' ? 'אין קמפיינים עדיין' : 'No campaigns yet')
                  : (language === 'he' ? 'לא נמצאו קמפיינים' : 'No campaigns found')
                }
                description={campaigns.length === 0
                  ? (language === 'he' ? 'צור קמפיין ראשון כדי להתחיל להגיע ללקוחות חדשים' : 'Create your first campaign to start reaching new customers')
                  : (language === 'he' ? 'נסה לשנות את המסננים שלך' : 'Try adjusting your filters')
                }
                action={campaigns.length === 0 ? (
                  <UniversalButton
                    variant="primary"
                    size="md"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    {language === 'he' ? 'צור קמפיין ראשון' : 'Create First Campaign'}
                  </UniversalButton>
                ) : undefined}
              />
            </CardBody>
          </UniversalCard>
        ) : (
          <UniversalCard>
            <UniversalTable>
              <UniversalTableHeader>
                <UniversalTableRow>
                  <UniversalTableHead>
                    {language === 'he' ? 'קמפיין' : 'Campaign'}
                  </UniversalTableHead>
                  <UniversalTableHead>
                    {language === 'he' ? 'סטטוס' : 'Status'}
                  </UniversalTableHead>
                  <UniversalTableHead>
                    {language === 'he' ? 'פלטפורמה' : 'Platform'}
                  </UniversalTableHead>
                  <UniversalTableHead>
                    {language === 'he' ? 'ביצועים' : 'Performance'}
                  </UniversalTableHead>
                  <UniversalTableHead>
                    {language === 'he' ? 'לידים' : 'Leads'}
                  </UniversalTableHead>
                  <UniversalTableHead>
                    {language === 'he' ? 'פעולות' : 'Actions'}
                  </UniversalTableHead>
                </UniversalTableRow>
              </UniversalTableHeader>
              <UniversalTableBody>
                {filteredCampaigns.map((campaign) => {
                  // Map campaign status to StatusBadge variant
                  const getStatusVariant = (status: CampaignStatus) => {
                    switch (status) {
                      case 'DRAFT':
                        return 'pending';
                      case 'READY':
                        return 'active';
                      case 'SCHEDULED':
                        return 'pending';
                      case 'ACTIVE':
                        return 'completed';
                      case 'PAUSED':
                        return 'pending';
                      case 'ARCHIVED':
                        return 'cancelled';
                      case 'FAILED':
                        return 'failed';
                      default:
                        return 'pending';
                    }
                  };

                  const getStatusColor = (status: CampaignStatus) => {
                    switch (status) {
                      case 'READY':
                        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                      case 'SCHEDULED':
                        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                      case 'ACTIVE':
                        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                      case 'PAUSED':
                        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                      case 'FAILED':
                        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                      default:
                        return '';
                    }
                  };

                  return (
                    <UniversalTableRow key={campaign.id} hoverable>
                      <UniversalTableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{GOAL_LABELS[campaign.goal]}</div>
                          {campaign.budget && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {language === 'he' ? 'תקציב:' : 'Budget:'} ${campaign.budget}
                            </div>
                          )}
                        </div>
                      </UniversalTableCell>

                      <UniversalTableCell>
                        <div className="flex items-center space-x-2">
                          <StatusBadge
                            variant={getStatusVariant(campaign.status)}
                            className={getStatusColor(campaign.status)}
                          >
                            {campaign.status}
                          </StatusBadge>
                          {getConnectionStatus(campaign.platform) !== 'CONNECTED' && (
                            <span className="w-2 h-2 bg-red-400 rounded-full" title="Connection issue"></span>
                          )}
                        </div>
                      </UniversalTableCell>

                      <UniversalTableCell>
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{PLATFORM_LABELS[campaign.platform]}</div>
                          {campaign.connection && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{campaign.connection.accountName}</div>
                          )}
                        </div>
                      </UniversalTableCell>

                      <UniversalTableCell>
                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                          <div>${campaign.spend} {language === 'he' ? 'הוצאה' : 'spent'}</div>
                          <div>{campaign.clicks} {language === 'he' ? 'לחיצות' : 'clicks'}</div>
                          <div>{campaign.impressions} {language === 'he' ? 'חשיפות' : 'impressions'}</div>
                        </div>
                      </UniversalTableCell>

                      <UniversalTableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {campaign._count?.leads || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{language === 'he' ? 'לידים' : 'leads'}</div>
                        </div>
                      </UniversalTableCell>

                      <UniversalTableCell>
                        <div className="flex space-x-2">
                          {campaign.status === 'READY' && canActivateCampaign(campaign) && (
                            <UniversalButton
                              variant="ghost"
                              size="sm"
                              leftIcon={<Play className="w-4 h-4" />}
                              onClick={() => setShowActivationModal(campaign)}
                              disabled={actionLoading === campaign.id}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              {language === 'he' ? 'הפעל' : 'Activate'}
                            </UniversalButton>
                          )}

                          {campaign.status === 'ACTIVE' && (
                            <UniversalButton
                              variant="ghost"
                              size="sm"
                              leftIcon={<Pause className="w-4 h-4" />}
                              onClick={() => pauseCampaign(campaign)}
                              disabled={actionLoading === campaign.id}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              {language === 'he' ? 'השהה' : 'Pause'}
                            </UniversalButton>
                          )}

                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => setShowPreviewModal(campaign)}
                          >
                            {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
                          </UniversalButton>

                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => router.push(`/dashboard/e-commerce/campaigns/${campaign.id}`)}
                          >
                            {language === 'he' ? 'ערוך' : 'Edit'}
                          </UniversalButton>

                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            leftIcon={<Copy className="w-4 h-4" />}
                            onClick={() => duplicateCampaign(campaign)}
                            disabled={actionLoading === campaign.id}
                          >
                            {language === 'he' ? 'שכפל' : 'Duplicate'}
                          </UniversalButton>
                        </div>
                      </UniversalTableCell>
                    </UniversalTableRow>
                  );
                })}
              </UniversalTableBody>
            </UniversalTable>
          </UniversalCard>
        )}
      </div>

      {/* Activation Confirmation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-gray-600/50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-[#1A2F4B]">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {language === 'he' ? 'אשר הפעלת קמפיין' : 'Confirm Campaign Activation'}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {language === 'he'
                  ? `האם אתה בטוח שברצונך להפעיל את הקמפיין "${showActivationModal.name}"? הקמפיין יתחיל לרוץ מיידית ויגבה עלויות.`
                  : `Are you sure you want to activate the campaign "${showActivationModal.name}"? The campaign will start running immediately and charges will apply.`
                }
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  <div><strong>{language === 'he' ? 'פלטפורמה:' : 'Platform:'}</strong> {PLATFORM_LABELS[showActivationModal.platform]}</div>
                  <div><strong>{language === 'he' ? 'מטרה:' : 'Goal:'}</strong> {GOAL_LABELS[showActivationModal.goal]}</div>
                  {showActivationModal.budget && (
                    <div><strong>{language === 'he' ? 'תקציב:' : 'Budget:'}</strong> ${showActivationModal.budget}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <UniversalButton
                  variant="outline"
                  size="md"
                  onClick={() => setShowActivationModal(null)}
                >
                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </UniversalButton>
                <UniversalButton
                  variant="primary"
                  size="md"
                  onClick={() => activateCampaign(showActivationModal)}
                  disabled={actionLoading === showActivationModal.id}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {actionLoading === showActivationModal.id
                    ? (language === 'he' ? 'מפעיל...' : 'Activating...')
                    : (language === 'he' ? 'כן, הפעל' : 'Yes, Activate')
                  }
                </UniversalButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-gray-600/50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-[#1A2F4B]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {language === 'he' ? 'תצוגה מקדימה של קמפיין' : 'Campaign Preview'}
              </h3>
              <button
                onClick={() => setShowPreviewModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'he' ? 'פרטי קמפיין' : 'Campaign Details'}
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div><strong>{language === 'he' ? 'שם:' : 'Name:'}</strong> {showPreviewModal.name}</div>
                  <div><strong>{language === 'he' ? 'פלטפורמה:' : 'Platform:'}</strong> {PLATFORM_LABELS[showPreviewModal.platform]}</div>
                  <div><strong>{language === 'he' ? 'מטרה:' : 'Goal:'}</strong> {GOAL_LABELS[showPreviewModal.goal]}</div>
                  <div><strong>{language === 'he' ? 'סטטוס:' : 'Status:'}</strong> {showPreviewModal.status}</div>
                  {showPreviewModal.budget && (
                    <div><strong>{language === 'he' ? 'תקציב:' : 'Budget:'}</strong> ${showPreviewModal.budget}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'he' ? 'נתוני JSON' : 'JSON Data'}
                </h4>
                <div className="bg-gray-50 dark:bg-[#0E1A2B] rounded p-3 overflow-auto max-h-64">
                  <pre className="text-xs text-gray-700 dark:text-gray-300">
                    {JSON.stringify({
                      name: showPreviewModal.name,
                      platform: showPreviewModal.platform,
                      goal: showPreviewModal.goal,
                      audience: showPreviewModal.audience,
                      creative: showPreviewModal.creative,
                    }, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 flex space-x-2">
                  <UniversalButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(showPreviewModal, null, 2));
                      showToast(language === 'he' ? 'הועתק ללוח' : 'Copied to clipboard', 'success');
                    }}
                  >
                    {language === 'he' ? 'העתק JSON' : 'Copy JSON'}
                  </UniversalButton>

                  <UniversalButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dataStr = JSON.stringify(showPreviewModal, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `campaign-${showPreviewModal.name}.json`;
                      link.click();
                    }}
                  >
                    {language === 'he' ? 'הורד JSON' : 'Download JSON'}
                  </UniversalButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {mounted && (
        <NewCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleNewCampaignSuccess}
          ownerUid={ownerUid}
        />
      )}
    </main>
  );
}

interface CampaignsPageProps {
  ownerUid: string;
  isAuthLoading?: boolean;
  user?: any;
}

export default function CampaignsPage({ ownerUid, isAuthLoading = false, user }: CampaignsPageProps) {
  return <CampaignsClient ownerUid={ownerUid} />;
}