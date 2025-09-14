'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/components/i18n/LangProvider'
import { useLanguage } from '@/lib/language-context'

interface OAuthStatusProps {
  userId: string
  onConnectionChange?: (platform: string, connected: boolean) => void
}

interface PlatformStatus {
  connected: boolean
  expires_at?: string
  scope?: string
  needs_refresh?: boolean
}

interface OAuthStatusData {
  platforms: {
    meta: PlatformStatus
    google: PlatformStatus
  }
}

export function OAuthStatus({ userId, onConnectionChange }: OAuthStatusProps) {
  const { t } = useLang()
  const { language } = useLanguage()
  const [status, setStatus] = useState<OAuthStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  const fetchOAuthStatus = async () => {
    try {
      const response = await fetch(`/api/campaigns/oauth/status?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch OAuth status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOAuthStatus()
  }, [userId])

  const handleConnect = (platform: 'meta' | 'google') => {
    setConnecting(platform)
    const redirectUri = `${window.location.origin}/e-commerce/campaigns`
    const authUrl = `/api/campaigns/oauth/${platform}/auth?userId=${userId}&redirectUri=${encodeURIComponent(redirectUri)}`
    window.location.href = authUrl
  }

  const handleDisconnect = async (platform: 'meta' | 'google') => {
    try {
      const response = await fetch(`/api/campaigns/oauth/${platform}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        await fetchOAuthStatus() // Refresh status
        onConnectionChange?.(platform, false)
      }
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error)
    }
  }

  const handleRefresh = async (platform: 'meta' | 'google') => {
    try {
      const response = await fetch(`/api/campaigns/oauth/${platform}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        await fetchOAuthStatus() // Refresh status
      }
    } catch (error) {
      console.error(`Failed to refresh ${platform} token:`, error)
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'meta': return 'Meta (Facebook/Instagram)'
      case 'google': return 'Google Ads'
      default: return platform
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'meta':
        return (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            f
          </div>
        )
      case 'google':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
        )
      default:
        return <div className="w-6 h-6 bg-gray-400 rounded-full" />
    }
  }

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false
    const expires = new Date(expiresAt)
    const now = new Date()
    const hoursDiff = (expires.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDiff < 24 // Expires within 24 hours
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('campaigns.platformConnections') || 'Platform Connections'}
      </h3>
      
      <div className="space-y-3">
        {Object.entries(status?.platforms || {}).map(([platform, platformStatus]) => (
          <div 
            key={platform}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {getPlatformIcon(platform)}
              <div>
                <div className="font-medium text-gray-900">
                  {getPlatformName(platform)}
                </div>
                {platformStatus.connected && (
                  <div className="text-sm text-gray-500">
                    {platformStatus.needs_refresh && (
                      <span className="text-orange-600">
                        {t('campaigns.tokenExpired') || 'Token expired'}
                      </span>
                    )}
                    {!platformStatus.needs_refresh && platformStatus.expires_at && isExpiringSoon(platformStatus.expires_at) && (
                      <span className="text-yellow-600">
                        {t('campaigns.tokenExpiringSoon') || 'Expires soon'}
                      </span>
                    )}
                    {!platformStatus.needs_refresh && !isExpiringSoon(platformStatus.expires_at) && (
                      <span className="text-green-600">
                        {t('campaigns.connected') || 'Connected'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {platformStatus.connected ? (
                <>
                  {platformStatus.needs_refresh && (
                    <button
                      onClick={() => handleRefresh(platform as 'meta' | 'google')}
                      className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      {t('campaigns.refresh') || 'Refresh'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDisconnect(platform as 'meta' | 'google')}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {t('campaigns.disconnect') || 'Disconnect'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleConnect(platform as 'meta' | 'google')}
                  disabled={connecting === platform}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {connecting === platform 
                    ? (t('campaigns.connecting') || 'Connecting...')
                    : (t('campaigns.connect') || 'Connect')
                  }
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">
              {t('campaigns.oauthInfo') || 'Platform Connection Info'}
            </p>
            <p>
              {t('campaigns.oauthDescription') || 'Connect your advertising accounts to create and manage campaigns directly from this platform. Your credentials are stored securely and can be revoked at any time.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}