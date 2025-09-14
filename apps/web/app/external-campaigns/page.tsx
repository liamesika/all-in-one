'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui';
import { toast } from 'react-hot-toast';

interface ExternalCampaign {
  id: string;
  externalId: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget?: number;
  totalBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  ctr?: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
  lastSyncAt?: string;
  connection: {
    provider: 'META' | 'GOOGLE_ADS' | 'TIKTOK_ADS' | 'LINKEDIN_ADS';
  };
  adAccount: {
    name: string;
    externalId: string;
  };
}

interface Connection {
  id: string;
  provider: 'META' | 'GOOGLE_ADS' | 'TIKTOK_ADS' | 'LINKEDIN_ADS';
  status: 'CONNECTED';
  adAccounts: Array<{
    id: string;
    externalId: string;
    name: string;
  }>;
}

interface CreateCampaignForm {
  connectionId: string;
  accountExternalId: string;
  name: string;
  objective: string;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
}

const PROVIDER_NAMES = {
  META: 'Meta',
  GOOGLE_ADS: 'Google Ads',
  TIKTOK_ADS: 'TikTok Ads',
  LINKEDIN_ADS: 'LinkedIn Ads',
};

export default function ExternalCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<ExternalCampaign[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCampaignForm>({
    connectionId: '',
    accountExternalId: '',
    name: '',
    objective: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, connectionsRes] = await Promise.all([
        fetch('/api/campaigns/external', {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
        }),
        fetch('/api/connections', {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
        }),
      ]);

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.filter((c: Connection) => c.status === 'CONNECTED'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/campaigns/external/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      toast.success('Campaign created successfully');
      setShowCreateForm(false);
      setCreateForm({
        connectionId: '',
        accountExternalId: '',
        name: '',
        objective: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handlePauseCampaign = async (campaign: ExternalCampaign) => {
    try {
      const provider = campaign.connection.provider.toLowerCase().replace('_', '-');
      const response = await fetch(`/api/campaigns/external/${provider}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ externalCampaignId: campaign.externalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to pause campaign');
      }

      toast.success('Campaign paused successfully');
      fetchData();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaign: ExternalCampaign) => {
    try {
      const provider = campaign.connection.provider.toLowerCase().replace('_', '-');
      const response = await fetch(`/api/campaigns/external/${provider}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ externalCampaignId: campaign.externalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to resume campaign');
      }

      toast.success('Campaign resumed successfully');
      fetchData();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      toast.error('Failed to resume campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedConnection = connections.find(c => c.id === createForm.connectionId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              External Campaigns
            </h1>
            <p className="text-gray-600">
              Manage campaigns across all connected advertising platforms
            </p>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={connections.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Create your first external campaign to start advertising across connected platforms.
            </p>
            {connections.length > 0 && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                Create Your First Campaign
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.objective} • {campaign.adAccount.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {PROVIDER_NAMES[campaign.connection.provider]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campaign.dailyBudget && `$${campaign.dailyBudget}/day`}
                          {campaign.totalBudget && ` ($${campaign.totalBudget} total)`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Spent: ${campaign.spend.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campaign.impressions.toLocaleString()} impressions
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.clicks} clicks • {campaign.conversions} conversions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {campaign.status === 'ACTIVE' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseCampaign(campaign)}
                              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            >
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResumeCampaign(campaign)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Resume
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create External Campaign
                </h3>

                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      value={createForm.connectionId}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        connectionId: e.target.value,
                        accountExternalId: '',
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a platform</option>
                      {connections.map((connection) => (
                        <option key={connection.id} value={connection.id}>
                          {PROVIDER_NAMES[connection.provider]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedConnection && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Account
                      </label>
                      <select
                        value={createForm.accountExternalId}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          accountExternalId: e.target.value,
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select an account</option>
                        {selectedConnection.adAccounts.map((account) => (
                          <option key={account.id} value={account.externalId}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objective
                    </label>
                    <select
                      value={createForm.objective}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        objective: e.target.value,
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select objective</option>
                      <option value="TRAFFIC">Traffic</option>
                      <option value="CONVERSIONS">Conversions</option>
                      <option value="LEADS">Lead Generation</option>
                      <option value="BRAND_AWARENESS">Brand Awareness</option>
                      <option value="REACH">Reach</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Budget ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={createForm.dailyBudget || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        dailyBudget: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {creating ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}