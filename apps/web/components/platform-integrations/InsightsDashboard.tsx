'use client';

import { useState, useEffect } from 'react';
// Temporary fallback to avoid chart.js SSR issues
// TODO: Re-enable after fixing SSR
// import { Line, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartOptions,
// } from 'chart.js';

// Simple chart fallbacks
const Line = ({ data, options }: any) => (
  <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
    <div className="text-gray-500">Chart temporarily disabled for deployment</div>
  </div>
);

const Bar = ({ data, options }: any) => (
  <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
    <div className="text-gray-500">Chart temporarily disabled for deployment</div>
  </div>
);

type ChartOptions = any;

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

interface InsightData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  ctr?: number;
  conversions?: number;
  conversionValue?: number;
}

interface Connection {
  id: string;
  provider: 'META' | 'GOOGLE_ADS' | 'TIKTOK_ADS' | 'LINKEDIN_ADS';
  displayName?: string;
  adAccounts: Array<{
    externalId: string;
    name: string;
  }>;
}

interface InsightsDashboardProps {
  userToken: string;
  className?: string;
}

const PROVIDER_NAMES = {
  META: 'Meta',
  GOOGLE_ADS: 'Google Ads',
  TIKTOK_ADS: 'TikTok Ads',
  LINKEDIN_ADS: 'LinkedIn Ads',
};

const PROVIDER_COLORS = {
  META: 'rgb(59, 130, 246)',
  GOOGLE_ADS: 'rgb(34, 197, 94)',
  TIKTOK_ADS: 'rgb(15, 23, 42)',
  LINKEDIN_ADS: 'rgb(29, 78, 216)',
};

export default function InsightsDashboard({ userToken, className = '' }: InsightsDashboardProps) {
  const [insights, setInsights] = useState<{ [key: string]: InsightData[] }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [window, setWindow] = useState<'7' | '30'>('7');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchInsights(selectedProvider, selectedAccount);
    }
  }, [selectedProvider, selectedAccount, window]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const connectedAccounts = data.filter((c: Connection) => c.adAccounts?.length > 0);
        setConnections(connectedAccounts);

        if (connectedAccounts.length > 0 && !selectedProvider) {
          setSelectedProvider(connectedAccounts[0].provider);
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (provider: string, accountId: string = '') => {
    try {
      const endpoint = accountId
        ? `/api/insights/${provider.toLowerCase().replace('_', '-')}/accounts/${accountId}`
        : `/api/insights/${provider.toLowerCase().replace('_', '-')}`;

      const response = await fetch(`${endpoint}?window=${window}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(prev => ({
          ...prev,
          [`${provider}_${accountId}`]: data.insights || [],
        }));
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleRefreshInsights = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/insights/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      // Refresh current insights after a delay
      setTimeout(() => {
        if (selectedProvider) {
          fetchInsights(selectedProvider, selectedAccount);
        }
      }, 3000);
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const currentInsights = insights[`${selectedProvider}_${selectedAccount}`] || [];
  const selectedConnection = connections.find(c => c.provider === selectedProvider);

  // Calculate summary metrics
  const summaryMetrics = currentInsights.reduce(
    (acc, insight) => ({
      totalSpend: acc.totalSpend + insight.spend,
      totalImpressions: acc.totalImpressions + insight.impressions,
      totalClicks: acc.totalClicks + insight.clicks,
      totalConversions: acc.totalConversions + (insight.conversions || 0),
    }),
    { totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0 }
  );

  const avgCPC = summaryMetrics.totalClicks > 0 ? summaryMetrics.totalSpend / summaryMetrics.totalClicks : 0;
  const avgCTR = summaryMetrics.totalImpressions > 0 ? (summaryMetrics.totalClicks / summaryMetrics.totalImpressions) * 100 : 0;

  // Chart data
  const chartData = {
    labels: currentInsights.map(insight => new Date(insight.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Spend ($)',
        data: currentInsights.map(insight => insight.spend),
        borderColor: PROVIDER_COLORS[selectedProvider as keyof typeof PROVIDER_COLORS] || 'rgb(59, 130, 246)',
        backgroundColor: `${PROVIDER_COLORS[selectedProvider as keyof typeof PROVIDER_COLORS] || 'rgb(59, 130, 246)'}20`,
        tension: 0.1,
      },
      {
        label: 'Clicks',
        data: currentInsights.map(insight => insight.clicks),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgb(34, 197, 94, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Performance Over Last ${window} Days`,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Spend ($)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Clicks',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
          <p className="text-gray-600">Connect your advertising accounts to view performance insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Platform Insights</h2>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setSelectedAccount('');
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {connections.map((connection) => (
                <option key={connection.id} value={connection.provider}>
                  {PROVIDER_NAMES[connection.provider]}
                </option>
              ))}
            </select>

            {selectedConnection && selectedConnection.adAccounts.length > 1 && (
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Accounts</option>
                {selectedConnection.adAccounts.map((account) => (
                  <option key={account.externalId} value={account.externalId}>
                    {account.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setWindow('7')}
                className={`px-3 py-1 text-sm rounded-md ${window === '7'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'}`}
              >
                7 days
              </button>
              <button
                onClick={() => setWindow('30')}
                className={`px-3 py-1 text-sm rounded-md ${window === '30'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'}`}
              >
                30 days
              </button>
            </div>

            <button
              onClick={handleRefreshInsights}
              disabled={refreshing}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${summaryMetrics.totalSpend.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summaryMetrics.totalImpressions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Impressions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summaryMetrics.totalClicks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summaryMetrics.totalConversions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              ${avgCPC.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Avg. CPC</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {avgCTR.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Avg. CTR</div>
          </div>
        </div>

        {/* Chart */}
        {currentInsights.length > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No insights data available for this selection</p>
              <button
                onClick={handleRefreshInsights}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Try refreshing insights
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}