'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/components/i18n/LangProvider'
import { useLanguage } from '@/lib/language-context'

interface Campaign {
  id: string
  goal: string
  copy: string
  image?: string
  audience?: any
  platform?: string
  status: string
  createdAt: string
  updatedAt: string
  ownerUid: string
}

interface CampaignPreviewProps {
  campaign: Campaign
  platforms?: string[]
  onInsightsChange?: (insights: any[]) => void
}

interface PreviewData {
  campaign_id: string
  platform: string
  preview_data: {
    headline: string
    primary_text: string
    description?: string
    image_url?: string
    call_to_action?: { type: string; value?: string }
  }
  estimated_reach?: {
    min: number
    max: number
  }
  estimated_cost_per_result?: {
    min: number
    max: number
    currency: string
  }
  smart_insights: any[]
}

export function CampaignPreview({ campaign, platforms = ['meta', 'google'], onInsightsChange }: CampaignPreviewProps) {
  const { t } = useLang()
  const { language } = useLanguage()
  const [previews, setPreviews] = useState<Record<string, PreviewData>>({})
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms[0])

  const generatePreviews = async () => {
    if (!campaign.goal || !campaign.copy) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns/preview/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          platforms
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPreviews(result.data.previews)
          
          // Collect all insights
          const allInsights: any[] = [];
          const previewsArray = Object.values(result.data.previews) as PreviewData[];
          previewsArray.forEach((preview: any) => {
            allInsights.push(...preview.smart_insights.map((insight: any) => ({
              ...insight,
              platform: preview.platform
            })))
          })
          
          // Add cross-platform insights
          if (result.data.cross_platform_insights) {
            allInsights.push(...result.data.cross_platform_insights)
          }
          
          setInsights(allInsights)
          onInsightsChange?.(allInsights)
        }
      }
    } catch (error) {
      console.error('Failed to generate previews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generatePreviews()
  }, [campaign.goal, campaign.copy, campaign.image])

  const getPlatformName = (platform: string) => {
    const names = {
      meta: 'Meta (Facebook/Instagram)',
      facebook: 'Facebook',
      instagram: 'Instagram',
      google: 'Google Ads'
    }
    return names[platform as keyof typeof names] || platform
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      meta: 'bg-blue-600',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-600',
      google: 'bg-red-600'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-600'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'suggestion':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const currentPreview = previews[selectedPlatform]

  if (loading && Object.keys(previews).length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (Object.keys(previews).length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('campaigns.preview') || 'Campaign Preview'}
        </h3>
        <div className="text-gray-500 text-center py-8">
          {t('campaigns.enterDetailsForPreview') || 'Enter campaign goal and copy to see preview'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('campaigns.preview') || 'Campaign Preview'}
        </h3>
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </div>
        )}
      </div>

      {/* Platform Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.keys(previews).map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedPlatform === platform
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`}></div>
                <span>{getPlatformName(platform)}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {currentPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Preview */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Ad Preview</h4>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-w-md">
              {currentPreview.preview_data.image_url && (
                <div className="mb-3">
                  <img
                    src={currentPreview.preview_data.image_url}
                    alt="Campaign preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="font-semibold text-gray-900">
                  {currentPreview.preview_data.headline}
                </div>
                <div className="text-gray-700 text-sm">
                  {currentPreview.preview_data.primary_text}
                </div>
                {currentPreview.preview_data.description && (
                  <div className="text-gray-600 text-sm">
                    {currentPreview.preview_data.description}
                  </div>
                )}
                {currentPreview.preview_data.call_to_action && (
                  <div className="pt-2">
                    <button className={`px-4 py-2 text-sm font-medium text-white rounded ${getPlatformColor(selectedPlatform)}`}>
                      {currentPreview.preview_data.call_to_action.value || 
                       currentPreview.preview_data.call_to_action.type.replace('_', ' ')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimates */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Estimates</h4>
            <div className="space-y-3">
              {currentPreview.estimated_reach && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-900 mb-1">Estimated Reach</div>
                  <div className="text-lg font-semibold text-blue-700">
                    {formatNumber(currentPreview.estimated_reach.min)} - {formatNumber(currentPreview.estimated_reach.max)}
                  </div>
                  <div className="text-sm text-blue-600">people</div>
                </div>
              )}
              
              {currentPreview.estimated_cost_per_result && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-900 mb-1">Cost Per Result</div>
                  <div className="text-lg font-semibold text-green-700">
                    ${currentPreview.estimated_cost_per_result.min.toFixed(2)} - ${currentPreview.estimated_cost_per_result.max.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600">{currentPreview.estimated_cost_per_result.currency}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Smart Insights</h4>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {insight.message}
                  </div>
                  {insight.suggestion && (
                    <div className="text-sm text-gray-600 mt-1">
                      {insight.suggestion}
                    </div>
                  )}
                  {insight.platform && (
                    <div className="text-xs text-gray-500 mt-1">
                      Platform: {getPlatformName(insight.platform)}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
              </div>
            ))}
            
            {insights.length > 5 && (
              <div className="text-sm text-gray-500 text-center pt-2">
                And {insights.length - 5} more insights...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}