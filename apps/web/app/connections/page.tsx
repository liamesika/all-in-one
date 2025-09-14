'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { AiCoachProvider } from '../../lib/ai-coach-context';
import AiCoachIntegration from '../../components/ai-coach/AiCoachIntegration';

interface Connection {
  id: string;
  provider: 'META' | 'GOOGLE_ADS' | 'TIKTOK_ADS' | 'LINKEDIN_ADS';
  status: 'CONNECTED' | 'EXPIRED' | 'ERROR' | 'DISCONNECTED';
  displayName?: string;
  accountEmail?: string;
  lastSyncAt?: string;
  lastError?: string;
  accountCount: number;
  adAccounts: Array<{
    id: string;
    externalId: string;
    name: string;
    currency?: string;
    status: string;
  }>;
}

const PROVIDER_NAMES = {
  META: 'Meta (Facebook & Instagram)',
  GOOGLE_ADS: 'Google Ads',
  TIKTOK_ADS: 'TikTok Ads',
  LINKEDIN_ADS: 'LinkedIn Ads',
};

const PROVIDER_COLORS = {
  META: 'bg-blue-600',
  GOOGLE_ADS: 'bg-green-600',
  TIKTOK_ADS: 'bg-black',
  LINKEDIN_ADS: 'bg-blue-700',
};

export default function ConnectionsPage() {
  const { user } = useAuth();
  const ownerUid = user?.uid;
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const response = await fetch(`/api/connections/${provider.toLowerCase().replace('_', '-')}/auth-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate auth URL');
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to initiate connection');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast.success('Account disconnected successfully');
      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const handleSyncAccounts = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/sync-accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync accounts');
      }

      const { jobId } = await response.json();
      toast.success(`Account sync job started (ID: ${jobId})`);

      // Refresh connections after a delay
      setTimeout(fetchConnections, 2000);
    } catch (error) {
      console.error('Error syncing accounts:', error);
      toast.error('Failed to sync accounts');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'text-green-600';
      case 'EXPIRED': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
      case 'DISCONNECTED': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AiCoachProvider ownerUid={ownerUid}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Platform Connections
            </h1>
            <p className="text-gray-600">
              Connect your advertising accounts to manage campaigns and view insights
            </p>
          </div>

          <div className="grid gap-6">
            {Object.entries(PROVIDER_NAMES).map(([provider, name]) => {
              const connection = connections.find(c => c.provider === provider);
              const isConnected = connection?.status === 'CONNECTED';

              return (
                <div key={provider} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg ${PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS]} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {provider.split('_')[0]}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {name}
                          </h3>
                          {connection ? (
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-sm font-medium ${getStatusColor(connection.status)}`}>
                                {connection.status.replace('_', ' ')}
                              </span>
                              {connection.accountEmail && (
                                <span className="text-sm text-gray-600">
                                  {connection.accountEmail}
                                </span>
                              )}
                              {connection.accountCount > 0 && (
                                <span className="text-sm text-gray-600">
                                  {connection.accountCount} account{connection.accountCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              Not connected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {isConnected ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleSyncAccounts(connection.id)}
                              className="text-sm"
                            >
                              Sync Accounts
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDisconnect(connection.id)}
                              className="text-sm text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleConnect(provider)}
                            disabled={connecting === provider}
                            className="text-sm"
                          >
                            {connecting === provider ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {connection?.lastError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Error:</span> {connection.lastError}
                        </p>
                      </div>
                    )}

                    {connection?.adAccounts && connection.adAccounts.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Connected Ad Accounts
                        </h4>
                        <div className="grid gap-2">
                          {connection.adAccounts.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {account.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ID: {account.externalId}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                {account.currency && (
                                  <span>{account.currency}</span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  account.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {account.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {connection?.lastSyncAt && (
                      <div className="mt-4 text-xs text-gray-500">
                        Last synced: {new Date(connection.lastSyncAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {connections.filter(c => c.status === 'CONNECTED').length === 0 && (
            <div className="mt-8 text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No connections yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Connect your advertising accounts to start creating campaigns and viewing insights across all platforms.
              </p>
            </div>
          )}
        </div>
      </div>

      {ownerUid && (
        <AiCoachIntegration
          ownerUid={ownerUid}
          organizationId={ownerUid}
          enableProactive={true}
          enableChat={true}
        />
      )}
    </AiCoachProvider>
  );
}