'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/components/i18n/LangProvider'
import { useLanguage } from '@/lib/language-context'

interface Campaign {
  id: string
  goal: string
  copy: string
  status: string
  createdAt: string
  updatedAt: string
}

interface CampaignAnalyticsProps {
  campaigns: Campaign[]
}

/**
 * Campaign Analytics Dashboard
 * 
 * Provides insights and statistics about campaign performance,
 * goal distribution, and trends over time.
 */
export function CampaignAnalytics({ campaigns }: CampaignAnalyticsProps) {
  const { t } = useLang()
  const { language } = useLanguage()
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Calculate analytics data
  const analytics = calculateAnalytics(campaigns, selectedPeriod)

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'he' ? 'he-IL' : 'en-US')
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('campaigns.analytics.title') || 'Campaign Analytics'}
        </h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <option value="7d">{t('campaigns.analytics.last7days') || 'Last 7 days'}</option>
          <option value="30d">{t('campaigns.analytics.last30days') || 'Last 30 days'}</option>
          <option value="90d">{t('campaigns.analytics.last90days') || 'Last 90 days'}</option>
          <option value="all">{t('campaigns.analytics.allTime') || 'All time'}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('campaigns.analytics.totalCampaigns') || 'Total Campaigns'}
          value={formatNumber(analytics.totalCampaigns)}
          change={analytics.campaignGrowth}
          icon="📊"
        />
        <MetricCard
          title={t('campaigns.analytics.activeCampaigns') || 'Active Campaigns'}
          value={formatNumber(analytics.activeCampaigns)}
          change={analytics.activeGrowth}
          icon="🚀"
        />
        <MetricCard
          title={t('campaigns.analytics.draftCampaigns') || 'Draft Campaigns'}
          value={formatNumber(analytics.draftCampaigns)}
          change={analytics.draftGrowth}
          icon="📝"
        />
        <MetricCard
          title={t('campaigns.analytics.conversionRate') || 'Draft to Active Rate'}
          value={formatPercentage(analytics.activeCampaigns, analytics.totalCampaigns)}
          icon="📈"
        />
      </div>

      {/* Goal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('campaigns.analytics.goalDistribution') || 'Goal Distribution'}
          </h4>
          <div className="space-y-2">
            {Object.entries(analytics.goalDistribution).map(([goal, count]) => (
              <div key={goal} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full opacity-80"></div>
                  <span className="text-sm text-gray-700">
                    {t(`campaigns.goal.${goal}` as any) || goal}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(count, analytics.totalCampaigns)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('campaigns.analytics.statusDistribution') || 'Status Distribution'}
          </h4>
          <div className="space-y-2">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StatusIndicator status={status} />
                  <span className="text-sm text-gray-700">
                    {t(`campaigns.status.${status}` as any) || status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(count, analytics.totalCampaigns)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('campaigns.analytics.recentActivity') || 'Recent Activity'}
        </h4>
        <div className="space-y-2">
          {analytics.recentCampaigns.slice(0, 5).map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <StatusIndicator status={campaign.status} />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {t(`campaigns.goal.${campaign.goal}` as any) || campaign.goal}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {campaign.copy}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(campaign.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips and Insights */}
      {analytics.insights.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('campaigns.analytics.insights') || 'Insights & Recommendations'}
          </h4>
          <div className="space-y-2">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 text-blue-600 mt-0.5">💡</div>
                <div className="text-sm text-blue-800">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string
  value: string
  change?: number
  icon: string 
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${
          change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
        }`}>
          {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {Math.abs(change)}%
        </div>
      )}
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    DRAFT: 'bg-gray-400',
    READY: 'bg-blue-400',
    SCHEDULED: 'bg-yellow-400',
    ACTIVE: 'bg-green-400',
    PAUSED: 'bg-orange-400',
    ARCHIVED: 'bg-red-400'
  }

  return (
    <div className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-400'}`}></div>
  )
}

function calculateAnalytics(campaigns: Campaign[], period: string) {
  const now = new Date()
  let cutoffDate: Date

  switch (period) {
    case '7d':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      cutoffDate = new Date(0) // All time
  }

  const filteredCampaigns = campaigns.filter(c => new Date(c.createdAt) >= cutoffDate)
  const totalCampaigns = filteredCampaigns.length
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'ACTIVE').length
  const draftCampaigns = filteredCampaigns.filter(c => c.status === 'DRAFT').length

  // Goal distribution
  const goalDistribution = filteredCampaigns.reduce((acc, campaign) => {
    acc[campaign.goal] = (acc[campaign.goal] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Status distribution
  const statusDistribution = filteredCampaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Recent campaigns (sorted by creation date)
  const recentCampaigns = [...filteredCampaigns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Generate insights
  const insights: string[] = []
  
  if (draftCampaigns > activeCampaigns * 2) {
    insights.push('You have many draft campaigns. Consider activating some to improve your campaign performance.')
  }
  
  if (totalCampaigns === 0) {
    insights.push('Start creating your first campaign to begin advertising across multiple platforms.')
  }
  
  const topGoal = Object.entries(goalDistribution).sort(([,a], [,b]) => b - a)[0]
  if (topGoal && totalCampaigns > 3) {
    insights.push(`${topGoal[0]} campaigns are your most common. Consider diversifying your campaign goals.`)
  }

  return {
    totalCampaigns,
    activeCampaigns,
    draftCampaigns,
    goalDistribution,
    statusDistribution,
    recentCampaigns,
    insights,
    campaignGrowth: 0, // Would calculate from historical data
    activeGrowth: 0,   // Would calculate from historical data
    draftGrowth: 0     // Would calculate from historical data
  }
}